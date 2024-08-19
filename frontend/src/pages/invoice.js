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

const DiscrepancyModal = ({ discrepancies, onClose }) => (
    <div className="modal" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                            <td>{item.articleDescription}</td> {/* Corrected to match the data */}
                            <td>{item.quantityInDb}</td> {/* Corrected dbQuantity */}
                            <td>{item.quantityInExcel}</td> {/* Corrected excelQuantity */}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={onClose} className="close-button">Fermer</button>
        </div>
    </div>
);


const Invoice = ({ onFileUploaded }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [invoiceData, setInvoiceData] = useState([]);
    const [message, setMessage] = useState('');
    const [invoiceDate] = useState(generateDisplayDate());
    const [dueDate] = useState(generateDueDate());
    const [invoiceNumber, setInvoiceNumber] = useState(0);
    const [orderNumber, setOrderNumber] = useState(generateOrderNumber(0));
    const [headOffice, setHeadOffice] = useState({id:'', name: '', address: '', postalCode: '', city: '', VATNumber: '' });
    const [fileName, setFileName] = useState("");
    const [discrepancies, setDiscrepancies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [details, setDetails] = useState([]);
    const [dbQuantities, setDbQuantities] = useState([]);
    const [excelQuantities, setExcelQuantities] = useState(null);
    
    const today = new Date().toISOString().split('T')[0]; // Date d'aujourd'hui au format YYYY-MM-DD

    const deleteMessage = () => {
        // Ajouter un délai pour réinitialiser le message après 5 secondes
        setTimeout(() => {
            resetMessages();
        }, 5000)
    }

    // Fonction réinitialisation des messages
    const resetMessages = () => {
        setMessage({
            text: '',
            type: ''
        });
    };
   
    const generateNewInvoiceNumber = useCallback(() => {
        setInvoiceNumber((prevInvoiceNumber) => {
            const newInvoiceNumber = prevInvoiceNumber + 1;
            setOrderNumber(generateOrderNumber(newInvoiceNumber));
            return newInvoiceNumber;
        });
    }, []);   

    useEffect(() => {
        // Appeler generateNewInvoiceNumber lors du premier rendu du composant
        generateNewInvoiceNumber();
    }, [generateNewInvoiceNumber]);

    const handleEndDateChange = (e) => {
        const selectedEndDate = e.target.value;
        const today = new Date().toISOString().split('T')[0];
        
        if (selectedEndDate > today) {
            setMessage('La date de fin ne peut pas dépasser la date du jour.');
            deleteMessage();
            resetMessages();
        } else {
            setEndDate(selectedEndDate);
            setMessage(''); // Réinitialiser le message d'erreur si la date est valide
        }
    };
    
    // Fonction appelée lorsqu'un fichier est déposé dans la zone de dépôt
    const onDrop = async (acceptedFiles) => {
        // Sélectionne le premier fichier de la liste des fichiers acceptés (ici, on suppose qu'il s'agit d'un fichier Excel)
        const file = acceptedFiles[0]; 
        if (acceptedFiles.length > 0) {
            setFileName(acceptedFiles[0].name);
        }
        try {
            // Appelle la fonction readExcelFile pour lire et traiter le fichier Excel
            const excelData = await readExcelFile(file); 
            // Met à jour l'état de l'application avec les données traitées du fichier Excel
            setExcelQuantities(excelData); 
        } catch (error) {
            // Capture et affiche les erreurs potentielles lors de la lecture du fichier Excel
            console.error("Erreur lors de la lecture du fichier Excel :", error);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.xlsx' });

    // Fonction pour lire un fichier Excel et extraire les données nécessaires
    const readExcelFile = async (file) => {
        return new Promise((resolve, reject) => {
            // Crée un nouvel objet FileReader pour lire le contenu du fichier
            const fileReader = new FileReader();

            // Fonction appelée lorsque la lecture du fichier est terminée
            fileReader.onload = (e) => {
                // Convertit le résultat de la lecture en tableau d'octets
                const data = new Uint8Array(e.target.result);
                // Utilise la bibliothèque xlsx pour lire le contenu du fichier comme un classeur Excel
                const workbook = XLSX.read(data, { type: 'array' });
                // Sélectionne la première feuille du classeur
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                // Convertit les données de la feuille en format JSON (tableau de tableaux)
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                // Appelle la fonction calculateProductSums pour calculer les quantités ou autres données
                const sums = calculateProductSums(jsonData);
                // Résout la promesse avec les données traitées
                resolve(sums);
            };

            // Fonction appelée en cas d'erreur lors de la lecture du fichier
            fileReader.onerror = (error) => reject(error);
            // Lit le fichier comme un tableau d'octets
            fileReader.readAsArrayBuffer(file);
        });
    };

    // Fonction qui calcule la somme de chaque produit à partir des données JSON
    const calculateProductSums = (data) => {
        const productSums = {}; // Objet pour stocker les sommes des quantités par produit

        // Itère sur chaque ligne des données (à partir de la ligne 1 pour ignorer les en-têtes)
        for (let i = 1; i < data.length; i++) {
            const row = data[i]; // Obtient la ligne actuelle des données
            const articleNumber = row[3]; // Numéro de l'article (supposé à la colonne 3)
            const articleDescription = row[5]; // Description de l'article (supposée à la colonne 5)
            const soldQuantity = parseInt(row[8], 10); // Quantité vendue (supposée à la colonne 8), convertie en nombre entier

            // Ignore les lignes avec des informations manquantes ou une quantité vendue invalide
            if (!articleNumber || !articleDescription || isNaN(soldQuantity)) {
                continue;
            }

            const key = `${articleNumber}-${articleDescription}`; // Crée une clé unique pour chaque produit

            // Si le produit existe déjà dans l'objet productSums, ajoute la quantité vendue
            if (productSums[key]) {
                productSums[key].quantity += soldQuantity;
            } else {
                // Sinon, ajoute une nouvelle entrée pour le produit avec la quantité vendue initiale
                productSums[key] = {
                    articleNumber,
                    articleDescription,
                    quantity: soldQuantity
                };
            }
        }
        return productSums; // Retourne l'objet contenant les sommes des quantités pour chaque produit
    };

    useEffect(() => {
        const fetchProductsData = async () => {
            try {
                // Assurez-vous que la date de fin n'est pas future
                const today = new Date().toISOString().split('T')[0];
                    if (endDate > today) {
                        console.error("La date de fin ne peut pas dépasser la date du jour.");
                        return;
                    }

                // Vérifiez que les dates de début et de fin sont fournies
                if (!startDate || !endDate) {
                    //console.error("Dates de début et de fin requises.");
                    return;
                }

                // Construisez l'URL de la requête avec les paramètres de date
                const url = `${REACT_APP_BACKEND_URL}/salesQuantities?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
                                
                // Envoyez la requête GET pour récupérer les données
                const response = await axios.get(url);
                const sellingData = response.data;

                // Assurez-vous que les données sont un tableau et non vide
                if (Array.isArray(sellingData) && sellingData.length > 0) {
                    setDbQuantities(sellingData);
                } else {
                    console.error("Aucune donnée trouvée pour la période spécifiée.");
                }
            } catch (error) {
                // Gérez les erreurs de la requête
                console.error("Erreur lors de la récupération des données des ventes :", error);
            }
        };

        fetchProductsData();
    }, [startDate, endDate]); // Dépendances: redemande les données lorsque startDate ou endDate change

    
    /**
 * Compare les quantités de produits entre les données extraites d'un fichier Excel et celles de la base de données.
 * 
 * @param {Object} excelQuantities - Un objet contenant les quantités de produits extraites du fichier Excel. Les clés sont des chaînes de caractères composées du numéro d'article et du nom du produit, et les valeurs sont des objets contenant la quantité.
 * @param {Array} dbQuantities - Un tableau d'objets représentant les quantités de produits enregistrées dans la base de données. Chaque objet contient le numéro d'article, le nom du produit et la quantité vendue.
 * 
 * @returns {Array} Un tableau d'objets représentant les divergences trouvées entre les quantités de la base de données et celles du fichier Excel.
 */
    function compareQuantities(excelData, dbData) {
        // Convertir les données Excel en tableau
        const excelDataArray = Object.values(excelData);
        
        let discrepancies = [];
    
        // Boucle sur les données Excel pour chaque élément
        excelDataArray.forEach(excelItem => {
            // Recherche d'un élément correspondant dans la base de données par description de l'article
            const dbItem = dbData.find(item => item.productName === excelItem.articleDescription);
    
            if (dbItem) {
                // Comparaison des quantités
                const dbQuantity = Number(dbItem.QteVendu);
                const excelQuantity = Number(excelItem.quantity);
    
                if (dbQuantity !== excelQuantity) {
                    // Ajouter à la liste des divergences si les quantités ne correspondent pas
                    discrepancies.push({
                        articleNumber: excelItem.articleNumber,
                        articleDescription: excelItem.articleDescription,
                        quantityInDb: dbQuantity,
                        quantityInExcel: excelQuantity
                    });
                }
            } else {
                // Si l'article n'existe pas dans la base de données
                console.warn(`L'article ${excelItem.articleDescription} est absent de la base de données.`);
            }
        });
    
        // Affichage des résultats
        if (discrepancies.length === 0) {
            console.log("Toutes les quantités concordent.");
        } else {
            console.log("Les divergences de quantités sont : ", discrepancies);
        }
    
        return discrepancies;
    }
        
    useEffect(() => {
        const fetchHeadOfficeData = async () => {
            try {
                // Effectue la requête et récupère la réponse
                const response = await axios.get(`${REACT_APP_BACKEND_URL}/headOffice`);
                
                // Accède au premier élément du tableau de réponse
                const headOffice = response.data[0]; // La première entrée dans le tableau
                
                // Vérifie si l'objet headOffice existe
                if (headOffice) {
                  // Mets à jour ton état ou affiche les informations
                  setHeadOffice({
                    id:headOffice.headOfficeId,
                    name: headOffice.headOfficeName,
                    address: headOffice.headOfficeAddress,
                    postalCode: headOffice.headOfficePostalCode,
                    city: headOffice.headOfficeCity,
                    VATNumber: headOffice.headOfficeVATNumber
                  });
                } else {
                  console.error("Aucune donnée trouvée pour le siège social.");
                }
              } catch (error) {
                console.error("Erreur lors de la récupération des données du siège social :", error);
              }              
        };
    
        fetchHeadOfficeData(); // Appel de la fonction à l'initialisation du composant
    }, []); // Le tableau vide [] fait que l'effet se lance seulement lors du montage du composant
    
    // Fonction pour formater le numéro de facture en 4 chiffres
    const formatInvoiceNumber = (number) => {
        return number.toString().padStart(4, '0'); // Ajoute des zéros à gauche pour avoir 4 chiffres
    };

    const isDebugMode = false;
    isDebugMode && console.log(setDetails);

    // Fonction pour récupérer les données de facture
    const fetchInvoiceData = async () => {
        try {
            // Ajouter les dates comme paramètres de requête
            const url = `${REACT_APP_BACKEND_URL}/invoice?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
            const response = await axios.get(url);
            setInvoiceData(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des données de la facture :", error);
        }
    };

    const handleGenerateInvoice = async () => {
        
        if (!excelQuantities || !dbQuantities) {
            console.error("Les quantités Excel et DB doivent être chargées avant la comparaison.");
            return;
        }
    
        const discrepancies = compareQuantities(excelQuantities, dbQuantities);
        setDiscrepancies(discrepancies);
    
        if (discrepancies.length > 0) {
            setShowModal(true);
        } else {
            await fetchInvoiceData();
        }
    };
    
    const handlePrintInvoice = async () =>{}
    
    return (
        <div className="invoice-container">
            {/* Affiche le modal si showModal est true */}
            {showModal && (
                <DiscrepancyModal 
                    discrepancies={discrepancies}
                    details={details}
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
                            <p className='m-0'>Numéro de facture: {formatInvoiceNumber(invoiceNumber)} </p>
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
                    <p className='m-0' style={{ display: 'none' }}>{headOffice.id || ''}</p>
                </div>
            </div>
    
            <div className="date-selection mb-3">
                <label htmlFor="startDate">Date de début:</label>
                <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
    
                <label htmlFor="endDate">Date de fin:</label>
                <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    max={today}
                    onChange={handleEndDateChange}
                />
                {message && <p>{message}</p>}
            </div>
    
            <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                <p>{fileName || 'Fichier Excel cliquez ici.'}</p>
            </div>
            {message && <div className="error-message">{message}</div>}
    
            <div className="invoice-table">
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Total</th>
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
                    <button className='btn btn-primary m-2' onClick={handleGenerateInvoice}>Générer la facture</button>
                    <button className='btn btn-secondary m-2' onClick={handlePrintInvoice}>Imprimer</button>
                    <p>Merci pour votre confiance!</p>
                    <p>Pour toute question ou information complémentaire, n'hésitez pas à nous contacter.</p>
                </div>
            </div>
    
            {/* Modal avec les divergences de quantités affichées */}
            {showModal && (
                <DiscrepancyModal
                    discrepancies={discrepancies}
                    details={details}
                    onClose={() => setShowModal(false)}
                />
            )}
    
        </div>
    );
    
};

export default Invoice;
