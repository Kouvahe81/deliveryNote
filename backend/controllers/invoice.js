const { dbConnection } = require('../dbConfig');
const { Sequelize } = require('sequelize');


exports.getLastInvoiceId = async (req, res) => {
    try {
        const query = `
            SELECT TOP 1 invoiceId
            FROM Invoice
            ORDER BY invoiceId DESC;
        `;

        const [result] = await dbConnection.query(query, {
            type: Sequelize.QueryTypes.SELECT
        });

        let nextInvoiceNumber = 1; // Valeur par défaut si aucune facture n'existe

        if (result) {
            nextInvoiceNumber = result.invoiceId + 1;
        }

        res.json({ nextInvoiceNumber });
    } catch (error) {
        console.error('Erreur lors de la génération du prochain numéro de facture :', error);
        res.status(500).json({ error: 'Erreur lors de la génération du prochain numéro de facture.' });
    }
};


exports.getSalesReport = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            const currentDate = new Date();
            const firstDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const lastDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

            startDate = firstDayOfPreviousMonth.toISOString().split('T')[0];
            endDate = lastDayOfPreviousMonth.toISOString().split('T')[0];
        }
        const query = `
            SELECT 
                c.categoryName,
                h.headOfficeId, 
                h.headOfficeName,
                h.headOfficeAddress,
                h.headOfficePostalCode,
                h.headOfficeCity,
                h.headOfficeVATNumber,
                SUM(l.productPrice * (l.deliveryQuantity - l.returnQuantity)) AS MontantVendu,
                SUM(l.productPrice * (l.deliveryQuantity - l.returnQuantity) * (h.headOfficeRateReduction / 100)) AS Remise,
                SUM(l.productPrice * (l.deliveryQuantity - l.returnQuantity) - (l.productPrice * (l.deliveryQuantity - l.returnQuantity) * (h.headOfficeRateReduction / 100))) AS MontantHT,
                SUM((l.productPrice * (l.deliveryQuantity - l.returnQuantity) - (l.productPrice * (l.deliveryQuantity - l.returnQuantity) * (h.headOfficeRateReduction / 100))) * v.vatRateTaxe/100) AS TVA,
                -- Calcul du MontantTTC comme la somme de MontantHT et TVA
                SUM(l.productPrice * (l.deliveryQuantity - l.returnQuantity) - 
                    (l.productPrice * (l.deliveryQuantity - l.returnQuantity) * (h.headOfficeRateReduction / 100)) +
                    (l.productPrice * (l.deliveryQuantity - l.returnQuantity) - 
                    (l.productPrice * (l.deliveryQuantity - l.returnQuantity) * (h.headOfficeRateReduction / 100))) * v.vatRateTaxe / 100) AS MontantTTC
            FROM 
                dbo.To_list l
            INNER JOIN 
                Product p ON p.productID = l.productId
            INNER JOIN 
                Category c ON c.categoryId = p.productCategoryID
            INNER JOIN 
                VATRate v ON v.vatRateId = c.vatRateId
            INNER JOIN 
                DeliveryNote d ON d.deliveryNoteId = l.deliveryNoteId
            INNER JOIN 
                Branch b ON b.branchId = d.branchId
            INNER JOIN 
                HeadOffice h ON h.headOfficeId = b.headOfficeId
            WHERE 
                d.deliveryDate BETWEEN :startDate AND :endDate
            GROUP BY 
                c.categoryName,
                h.headOfficeId, 
                h.headOfficeName,
                h.headOfficeAddress,
                h.headOfficePostalCode,
                h.headOfficeCity,
                h.headOfficeVATNumber;
        `;

        const results = await dbConnection.query(query, {
            replacements: { startDate, endDate },
            type: Sequelize.QueryTypes.SELECT
        });
        res.json(results); 
    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({ error: 'An error occurred while fetching the sales report' });
    }
};

exports.getSolQuantities = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            const currentDate = new Date();
            const firstDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const lastDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

            startDate = firstDayOfPreviousMonth.toISOString().split('T')[0];
            endDate = lastDayOfPreviousMonth.toISOString().split('T')[0];
        }
        const query = `
			SELECT 
				p.productID,
				p.productName,
				  SUM(l.deliveryQuantity - l.returnQuantity) AS QteVendu
			FROM Product  p
			INNER JOIN To_list l
			ON l.productID = p.productID
			INNER JOIN DeliveryNote d
			ON d.deliveryNoteId = l.deliveryNoteId
			WHERE d.deliveryDate BETWEEN :startDate AND :endDate
			GROUP BY p.productID,
		   		     p.productName;
            
        `;

        const results = await dbConnection.query(query, {
            replacements: { startDate, endDate },
            type: Sequelize.QueryTypes.SELECT
        });
        res.json(results); 
    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({ error: 'An error occurred while fetching the sales report' });
    }
};

exports.createInvoice = async (req, res) => {
    const { invoiceNumber, invoiceDate, invoicePaymentDeadline, headOfficeId, startDate, endDate } = req.body;

    try {
        // Commencez une transaction
        await dbConnection.transaction(async (transaction) => {

            // Convertir les dates reçues en objets Date
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Ajuster la date de début et de fin
            const startFirstDay = new Date(start.getFullYear(), start.getMonth(), 1); // Premier jour du mois de start
            const startLastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0); // Dernier jour du mois de start

            // Convertir les dates en format 'yyyy-mm-dd'
            const formattedStartFirstDay = startFirstDay.toISOString().split('T')[0];
            const formattedStartLastDay = startLastDay.toISOString().split('T')[0];
            const formattedInvoiceDate = new Date(invoiceDate).toISOString().split('T')[0];

            let checkInvoiceSql;
            let replacements;

            // Condition pour comparer les mois
            if (start.getMonth() + 1 === new Date(invoiceDate).getMonth() + 1 && start.getFullYear() === new Date(invoiceDate).getFullYear()) {
                // Mois et année identiques
                checkInvoiceSql = `
                    SELECT COUNT(*) AS Count
                    FROM Invoice
                    WHERE headOfficeId = ?
                        AND invoiceDate BETWEEN ? AND ?;
                `;
                replacements = [headOfficeId, formattedStartFirstDay, formattedStartLastDay];
            } else if ((start.getFullYear() < new Date(invoiceDate).getFullYear()) || (start.getFullYear() === new Date(invoiceDate).getFullYear() && start.getMonth() + 1 < new Date(invoiceDate).getMonth() + 1)) {
                // Mois de début antérieur à celui de l'émission
                checkInvoiceSql = `
                    SELECT COUNT(*) AS Count
                    FROM Invoice
                    WHERE headOfficeId = ?
                        AND invoiceDate BETWEEN ? AND ?;
                `;
                replacements = [headOfficeId, formattedStartFirstDay, formattedStartLastDay];
            } else {
                // Mois de début après celui de l'émission
                return res.status(400).json({ error: 'La date de début ne peut pas être après la date d\'émission.' });
            }

            const [results] = await dbConnection.query(checkInvoiceSql, {
                replacements: replacements,  // Utilisation des paramètres dynamiques
                type: Sequelize.QueryTypes.SELECT,
                transaction,
            });

            console.log('Query Results:', results);

            if (results && results.Count > 0) {
                // Si une facture existe déjà pour cette période et ce siège social, retournez une réponse appropriée
                return res.status(400).json({ error: 'Une facture pour cette période et ce siège social existe déjà.' });
            }

            // Insérez la nouvelle facture
            const insertInvoiceSql = `
                INSERT INTO Invoice (invoiceNumber, invoiceDate, invoicePaymentDeadline, headOfficeId )
                VALUES (?, ?, ?, ?);
            `;
            await dbConnection.query(insertInvoiceSql, {
                replacements: [invoiceNumber, formattedInvoiceDate, invoicePaymentDeadline, headOfficeId], 
                type: Sequelize.QueryTypes.INSERT,
                transaction,
            });

            // Retourner une réponse de succès
            res.status(201).json({ message: 'Facture créée avec succès.' });
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la facture:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la facture.' });
    }
};
