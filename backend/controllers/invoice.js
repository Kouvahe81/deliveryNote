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
    
    console.log('Num', invoiceNumber);
    console.log('Date', invoiceDate);
    console.log('Deadline', invoicePaymentDeadline);
    console.log('Head', headOfficeId);
    console.log('Start Date', startDate);
    console.log('End Date', endDate);

    try {
        // Commencez une transaction
        await dbConnection.transaction(async (transaction) => {
            
            // Vérifier si une facture existe déjà pour une période chevauchante et le même siège social
            const checkInvoiceSql = `
                SELECT COUNT(*) AS Count
                FROM Invoice
                WHERE headOfficeId = :headOfficeId
                AND (
                    (invoiceStartDate <= ? AND invoiceEndDate >= ?) -- Chevauchement de période
                );
            `;
            const [results] = await dbConnection.query(checkInvoiceSql, {
                bind: {
                    HeadOfficeId: headOfficeId,
                    NewStartDate: startDate,
                    NewEndDate: endDate
                },
                type: Sequelize.QueryTypes.SELECT,
                transaction,
            });

            if (results.Count > 0) {
                // Si une facture existe déjà pour cette période et ce siège social, retournez une réponse appropriée
                return res.status(400).json({ error: 'Une facture pour cette période et ce siège social existe déjà.' });
            }

            // Insérez la nouvelle facture
            const insertInvoiceSql = `
                INSERT INTO Invoice (invoiceNumber, invoiceDate, invoicePaymentDeadline, headOfficeId, invoiceStartDate, invoiceEndDate)
                VALUES (@InvoiceNumber, @InvoiceDate, @InvoicePaymentDeadline, @HeadOfficeId, @StartDate, @EndDate);
            `;
            await dbConnection.query(insertInvoiceSql, {
                bind: {
                    InvoiceNumber: invoiceNumber,
                    InvoiceDate: invoiceDate,
                    InvoicePaymentDeadline: invoicePaymentDeadline,
                    HeadOfficeId: headOfficeId,
                    StartDate: startDate,
                    EndDate: endDate
                },
                type: Sequelize.QueryTypes.INSERT,
                transaction,  // Passer la transaction pour s'assurer que l'insertion est dans la transaction
            });

            // Retourner une réponse de succès
            res.status(201).json({ message: 'Facture créée avec succès.' });
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la facture:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la facture.' });
    }
};
  