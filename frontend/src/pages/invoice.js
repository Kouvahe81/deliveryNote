import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { REACT_APP_BACKEND_URL } from '../config';
import logo from '../images/Logo.png';
import '../styles/invoice.css';

const generateDisplayDate = () => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    return `${day}-${month}-${year}`;
};

const generateOrderNumber = (invoiceNumber) => {
    const currentDate = new Date();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    return `${invoiceNumber}-${month}-${year}`;
};

const generateDueDate = () => {
    const currentDate = new Date();
    const dueDate = new Date(currentDate.setDate(currentDate.getDate() + 30));
    const day = String(dueDate.getDate()).padStart(2, '0');
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const year = dueDate.getFullYear();
    return `${day}-${month}-${year}`;
};

const formatCurrency = (value) => `€ ${value.toFixed(2)}`;

const Invoice = ({ onFileUploaded }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [invoiceData, setInvoiceData] = useState([]);
    const [message, setMessage] = useState('');
    const [invoiceDate, setinvoiceDate] = useState(generateDisplayDate());
    const [dueDate, setDueDate] = useState(generateDueDate());
    const [invoiceNumber, setInvoiceNumber] = useState(0);
    const [orderNumber, setOrderNumber] = useState(generateOrderNumber(invoiceNumber));
    const [headOffice, setHeadOffice] = useState({name: '', address: '', postalCode: '', city: '', VATNumber: ''});
    const [selectedOffice, setSelectedOffice] = useState({});
    const [fileName, setFileName] = useState(""); 
    const [discrepancies, setDiscrepancies] = useState([]);
    const [showModal, setShowModal] = useState(false);


    const generateInvoiceNumber = () => {
        setInvoiceNumber(prevInvoiceNumber => {
            const newInvoiceNumber = prevInvoiceNumber + 1;
            return newInvoiceNumber;
        });
    };
    
    // Fonction de gestion du drop de fichiers
    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        setFileName(file.name);
    
        try {
            const jsonData = await readExcelFile(file);
    
            const sumByArticle = {};
    
            jsonData.forEach(row => {
                const articleNumber = row[3]; // Supposons que le code article est à l'indice 3
                const productName = row[4];   // Supposons que le nom du produit est à l'indice 4
                const quantitySold = parseInt(row[8]); // Supposons que la quantité vendue est à l'indice 8
    
                if (articleNumber && productName && !isNaN(quantitySold)) {
                    const key = `${articleNumber}-${productName}`;
    
                    if (sumByArticle.hasOwnProperty(key)) {
                        sumByArticle[key] += quantitySold;
                    } else {
                        sumByArticle[key] = quantitySold;
                    }
                }
            });
    
            console.log('Sommes par article :', sumByArticle);
    
            onFileUploaded({ jsonData, sumByArticle });
    
        } catch (error) {
            console.error("Une erreur s'est produite lors de la lecture du fichier :", error);
        }
    }, [onFileUploaded]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.xlsx' });

    const readExcelFile = async (file) => {
        return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        // Fonction pour lire le fichier Excel
        fileReader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            resolve(jsonData);
        };
    
        fileReader.onerror = (error) => {
            reject(error);
        };
    
        fileReader.readAsArrayBuffer(file);
        });
    }

    const DiscrepancyModal = ({ discrepancies, onClose }) => (
        <div className="modal">
            <div className="modal-content">
                <h2>Divergences de Quantités</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Article</th>
                            <th>Nom du produit</th>
                            <th>Quantité dans la DB</th>
                            <th>Quantité dans Excel</th>
                        </tr>
                    </thead>
                    <tbody>
                        {discrepancies.map((item, index) => (
                            <tr key={index}>
                                <td>{item.articleNumber}</td>
                                <td>{item.productName}</td>
                                <td>{item.dbQuantity}</td>
                                <td>{item.excelQuantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={onClose}>Fermer</button>
            </div>
        </div>
    );

    // Hook pour récupérer les données de l'office principal
    useEffect(() => {
        const fetchHeadOfficeData = async () => {
            try {
                const response = await axios.get(`${REACT_APP_BACKEND_URL}/headOffice`);
                const datas = response.data[0]               
                setHeadOffice({
                    name: datas.headOfficeName || '',
                    address: datas.headOfficeAddress || '',
                    postalCode: datas.headOfficePostalCode || '',
                    city: datas.headOfficeCity || '',
                    VATNumber: datas.headOfficeVATNumber || ''
                });
            } catch (error) {
                console.error("Erreur lors de la récupération des données de l'office principal :", error);
            }
        };

        fetchHeadOfficeData();
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchInvoiceData(startDate, endDate);
        }
    }, [startDate, endDate]);

    
/*
    const fetchInvoiceData = async (startDate, endDate) => {
        try {
            const response = await axios.get(`${REACT_APP_BACKEND_URL}/invoice`, {
                params: { startDate, endDate }
            });
            setInvoiceData(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des données : ', error);
            setMessage('Erreur lors de la récupération des données.');
        }
    };
*/
    
    // Fonction pour changer la date de début
    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    // Fonction pour changer la date de fin avec validation
    const handleEndDateChange = (e) => {
        const selectedEndDate = e.target.value;
        const today = new Date().toISOString().split('T')[0]; // Date du jour en format YYYY-MM-DD
        if (selectedEndDate > today) {
            setMessage('La date de fin ne peut pas dépasser la date du jour.');
        } else {
            setEndDate(selectedEndDate);
        }
    };

    // Fonction pour comparer les quantités entre les données de la facture et les quantités externes
    const compareQuantities = (excelQuantities, dbQuantities) => {
        const discrepancies = [];
    
        dbQuantities.forEach(dbItem => {
            const key = `${dbItem.articleNumber}-${dbItem.productName}`;
            const excelQuantity = excelQuantities[key];
    
            if (excelQuantity !== dbItem.quantitySold) {
                discrepancies.push({
                    productName: dbItem.productName,
                    articleNumber: dbItem.articleNumber,
                    dbQuantity: dbItem.quantitySold,
                    excelQuantity: excelQuantity || 0 // Si la quantité Excel est absente, elle est considérée comme 0
                });
            }
        });
    
        return discrepancies;
    };
    
    // Fonction pour récupérer les données de la facture et gérer les divergences
    const fetchInvoiceData = async (startDate, endDate, excelQuantities) => {
        try {
            const response = await axios.get(`${REACT_APP_BACKEND_URL}/invoice`, {
                params: { startDate, endDate }
            });
    
            const dbQuantities = response.data.map(item => ({
                productName: item.categoryName,
                articleNumber: item.articleNumber, // Vous devrez vous assurer que l'articleNumber est inclus dans la requête SQL et dans la réponse
                quantitySold: item.quantitySold // Assurez-vous que la quantité est correctement extraite dans votre requête SQL
            }));
    
            const discrepancies = compareQuantities(excelQuantities, dbQuantities);
    
            if (discrepancies.length > 0) {
                setMessage('Les quantités ne correspondent pas pour certains produits. Facture non générée.');
                setDiscrepancies(discrepancies); // Ajoutez un état pour stocker les divergences
                setShowModal(true); // Affichez le modal automatiquement si les quantités ne correspondent pas
            } else {
                setInvoiceData(response.data); // Affiche les données de la facture si tout est en ordre
                setMessage(''); // Réinitialise le message d'erreur s'il y en avait un
            }
    
        } catch (error) {
            console.error('Erreur lors de la récupération des données : ', error);
            setMessage('Erreur lors de la récupération des données.');
        }
    };
    
    
    const handlePrintInvoice = () => {
        if (invoiceData.length === 0) {
            setMessage('Impossible d\'imprimer la facture. Vérifiez que les données sont correctes.');
            
        } else {
            window.print();
        }
    };

    return (
        <div className="invoice-container">
            {showModal && (
            <DiscrepancyModal 
                discrepancies={discrepancies}
                onClose={() => setShowModal(false)}
            />
        )}
            <div className="header">
                <div className="payment-info">
                    <div className="payment-method">
                        <a href='/home'><img src={logo} alt="Logo" /></a>
                    </div>
                    <div className="invoice-details">
                        <h2>FACTURE</h2>
                        <div>
                            <p className='m-0'>Numéro de facture: {generateInvoiceNumber()}</p>
                            <p className='m-0'>Commande : {orderNumber}</p>
                            <p className='m-0'>Date de facturation: {invoiceDate}</p>
                            <p className='m-0'>Échéance: {dueDate}</p>
                            <p className='m-0'>Mode de paiement: Virement</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="address-section">
                <div className="address-left">
                    <h3>Petit Liban</h3>
                    <p className='m-0'>Brusselsesteenweg 661</p>
                    <p className='m-0'>3090 Overijse</p>
                    <p className='m-0'>Belgique</p>
                    <p className='m-0'>+32485239505</p>
                    <p className='m-0'>milad.italia10@hotmail.fr</p>
                </div>
                <div className="address-right">
                    <h3>{headOffice.name || ''}</h3>
                    <p className='m-0'>{headOffice.address || ''}</p>
                    <p className='m-0'>{headOffice.postalCode || ''} {headOffice.city || ''}</p>
                    <p className='m-0'>Belgique</p>
                    <p className='m-0'>Numéro TVA: BE {headOffice.VATNumber}</p>
                </div>
            </div>
            <div className="date-selection mb-3">
                <label htmlFor="startDate">Date de début:</label>
                <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={handleStartDateChange}
                />
                <label htmlFor="endDate">Date de fin:</label>
                <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={handleEndDateChange}
                />
            </div>
            
            <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                <p>Fichier à télécharger</p>
                {fileName && <p>Nom du fichier : {fileName}</p>} {/* Affiche le nom du fichier si disponible */}
            </div>

            {message && <div className="error-message">{message}</div>}
            <div className="invoice-table">
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Total </th>
                            <th>Remise 12%</th>
                            <th>Montant HT</th>
                            <th>TVA</th>
                            <th>Montant TTC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.categoryName}</td>
                                <td>{(item.MontantVendu).toFixed(2)}</td>
                                <td>{(item.Remise).toFixed(2)}</td>
                                <td>{(item.MontantHT).toFixed(2)}</td>
                                <td>{(item.TVA).toFixed(2)}</td>
                                <td>{formatCurrency(item.MontantTTC)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="total-section">
                <div className="total-left">
                    <p>Net à payer</p>
                </div>
                <div className="total-right">
                    <p
                        style={{ fontWeight: 'bold', fontSize: '20px' }}
                    >{formatCurrency(invoiceData.reduce((total, item) => total + item.MontantTTC, 0))}</p>
                </div>
            </div>
            <div className="footer">
                <button onClick={handlePrintInvoice}>Créer et Imprimer</button>
                <p>Merci pour votre confiance!</p>
                <p>Pour toute question ou information complémentaire, n'hésitez pas à nous contacter.</p>
            </div>
        </div>
    );
};

export default Invoice;
