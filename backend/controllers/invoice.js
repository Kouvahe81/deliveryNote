const { dbConnection } = require('../dbConfig');
const { Sequelize } = require('sequelize');

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
    const transaction = await dbConnection.transaction();

    try {
        let { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            const currentDate = new Date();
            const firstDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const lastDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

            startDate = firstDayOfPreviousMonth.toISOString().split('T')[0];
            endDate = lastDayOfPreviousMonth.toISOString().split('T')[0];
        }

        const invoiceData = {
            invoiceDate: new Date(),
            
        };

        const invoiceInsertQuery = `
            INSERT INTO Invoice (invoiceNumber,invoiceDate, invoicePaymentDeadline, headOfficeId)
            VALUES (:invoiceNumber, :invoiceDate, :invoicePaymentDeadline, :headOfficeId)
        `;

        await dbConnection.query(invoiceInsertQuery, {
            replacements: invoiceData,
            type: Sequelize.QueryTypes.INSERT,
            transaction
        });

        await transaction.commit();
        res.status(201).json({ message: 'Invoice created successfully', invoice: invoiceData });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'An error occurred while creating the invoice' });
    }
};

