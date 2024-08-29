import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import axios from 'axios';
import moment from 'moment';
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

// Fonction pour générer l'ordre
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

const formatCurrency = (value) => `€ ${value}`;

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

const ErrorModal = ({ message, onClose }) => {
    return (
        <div className="modal text-center">
            <div className="modal-content">
                <h3>Alerte</h3>
                <p style={{ fontWeight: 'bold', fontSize: '20px' }} >{message}</p>
                <button onClick={onClose} className="close-button">Fermer</button>
            </div>
        </div>
    );
};

const Invoice = ({ onFileUploaded }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [invoiceData, setInvoiceData] = useState([]);
    const [message, setMessage] = useState('');
    const [invoiceDate] = useState(generateDisplayDate());
    const [dueDate] = useState(generateDueDate());
    const [invoiceNumber, setInvoiceNumber] = useState(0);
    const [orderNumber, setOrderNumber] = useState('');
    const [headOffice, setHeadOffice] = useState({id:'', name: '', address: '', postalCode: '', city: '', VATNumber: '' });
    const [fileName, setFileName] = useState("");
    const [discrepancies, setDiscrepancies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [details, setDetails] = useState([]);
    const [dbQuantities, setDbQuantities] = useState([]);
    const [excelQuantities, setExcelQuantities] = useState(null);
    const [errorMessage, setErrorMessage] = useState(""); // Pour afficher les erreurs
    const [errorModalMessage, setErrorModalMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    
    

    const navigate = useNavigate();
    
    const today = new Date().toISOString().split('T')[0]; // Date d'aujourd'hui au format YYYY-MM-DD
   
    useEffect(() => {
        // Récupération du prochain invoiceNumber depuis le backend
        const fetchNextInvoiceNumber = async () => {
            try {
                const response = await axios.get(`${REACT_APP_BACKEND_URL}/invoiceId`);
                const nextInvoiceNumber = response.data.nextInvoiceNumber;

                // Génération de l'ordre de commande
                const generatedOrderNumber = generateOrderNumber(nextInvoiceNumber);
                setInvoiceNumber(nextInvoiceNumber)
                setOrderNumber(generatedOrderNumber);
            } catch (error) {
                console.error('Erreur lors de la récupération du prochain numéro de facture :', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNextInvoiceNumber();
    }, [])   

    //Fonction Date de fin
    const handleEndDateChange = (e) => {
        const selectedEndDate = e.target.value;
        const today = new Date().toISOString().split('T')[0];

        // Vérifier si la date de fin dépasse la date du jour
        if (selectedEndDate > today) {
            setErrorModalMessage('La date de fin ne peut pas dépasser la date du jour.');
            setShowErrorModal(true);
            return;
        }

        // Vérifier si la date de fin est inférieure à la date de début
        if (startDate && selectedEndDate < startDate) {
            setErrorModalMessage('La date de fin ne peut pas être inférieure à la date de début.');
            setShowErrorModal(true);
            return;
        }

        // Si toutes les validations passent, définir la date de fin
        setEndDate(selectedEndDate);
        setErrorMessage(''); // Réinitialiser le message d'erreur si la date est valide
    };

    
    // Fonction appelée lorsqu'un fichier est déposé dans la zone de dépôt
    const onDrop = async (acceptedFiles) => {
        // Réinitialise les messages d'erreur à chaque dépôt
        setErrorMessage("");

        // Vérifie que le fichier a bien l'extension .xlsx
        const file = acceptedFiles[0];
        if (acceptedFiles.length > 0) {
            // Vérifie le type du fichier pour s'assurer qu'il est bien un fichier Excel
            const fileType = file.name.split('.').pop();
            if (fileType !== 'xlsx' && fileType !== 'xls') {
                // Si le fichier n'est ni .xlsx ni .xls, affiche un message d'erreur et réinitialise le fichier
                setErrorModalMessage("Le fichier non valide; chargez un fichier Excel SVP ");
                setShowErrorModal(true);
                setFileName(""); // Supprime le fichier chargé
                setExcelQuantities([]); // Réinitialise les données des quantités
                return;
            }

        // Si le fichier est valide, met à jour le nom du fichier
        setFileName(file.name);
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

    // Vérifie si le fichier Excel a la même en tête 
    const isValidHeader = (headerRow) => {
        const expectedHeader = [
            "Vendor number",
            "Global PO number",
            "store number",
            "article number",
            "vendor article number",
            "article description",
            "sales date",
            "type",
            "sold quantity",
            "unit",
            "Net sales price",
            "Net sold value w/o vat",
            "Currency"
        ];
        
        return expectedHeader.every((col, index) => col === headerRow[index]);
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

                // Vérifie l'en-tête avant de continuer
                const headerRow = jsonData[0];
                if (!isValidHeader(headerRow)) {
                    setErrorModalMessage("En-tête du fichier Excel non conforme.");
                    setShowErrorModal(true);
                    setFileName(""); // Supprime le fichier chargé
                    return;
                }

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
            } 
        });
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
    isDebugMode && console.log(setMessage);
    isDebugMode && console.log(setInvoiceData);
    isDebugMode && console.log(loading);

    // Fonction pour formater un nombre avec un séparateur de milliers en français
    const formatNumberWithSeparator = (number) => {
        // Convertir le montant en nombre flottant pour s'assurer du bon format
    const montantFloat = parseFloat(number);

    // Vérifier que le montant est un nombre valide
    if (isNaN(montantFloat)) {
        console.error("Montant invalide");
        return null;
    }

    // Utiliser la méthode toLocaleString pour formater le montant en français
    return montantFloat.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    };

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
        // Vérification que le fichier Excel et les dates sont définis
        if (!fileName || !startDate || !endDate) {
            setErrorModalMessage("Veuillez remplir les dates ou charger le fichier.");
            setShowErrorModal(true);
            return;
        }
        
        if (!excelQuantities || !dbQuantities) {
            setErrorModalMessage("Les quantités Excel et DB doivent être chargées avant la comparaison.");
            setShowErrorModal(true);
            return;
        }
            
        const discrepancies = compareQuantities(excelQuantities, dbQuantities);
        setDiscrepancies(discrepancies);
    
        if (discrepancies.length > 0) {
            setShowModal(true);
            return;
        }
        fetchInvoiceData()
    
        // Marquer que l'étape de génération est réussie, mais ne pas encore générer la facture
        setIsInvoiceGenerated(true);
    };

    const handlePrintInvoice = async () => {
        if (!isInvoiceGenerated) {
            setErrorModalMessage("Vous devez d'abord générer la facture.");
            setShowErrorModal(true);
            return;
        }

        try {
            // Formatage des dates en 'yyyy-mm-dd'
            const formattedInvoiceDate = moment(invoiceDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
            const formattedDueDate = moment(dueDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
            console.log('deb', startDate)
            console.log('end', endDate)
            setIsLoading(true);

            // Insérer la facture dans la base de données
            const response = await axios.post(`${REACT_APP_BACKEND_URL}/invoice`, {
                invoiceNumber: invoiceNumber,
                orderNumber: orderNumber,
                invoiceDate: formattedInvoiceDate,
                invoicePaymentDeadline: formattedDueDate,
                headOfficeId: headOffice.id,
                startDate,
                endDate
            });

            if (response.status === 201) {
                // La facture a été insérée, maintenant lancer l'impression
                window.print();

                // Réinitialiser les champs
                setFileName('');
                setStartDate('');
                setEndDate('');
                setExcelQuantities(null);
                setDbQuantities(null);
                setInvoiceNumber('');
                setOrderNumber('');
                setHeadOffice({});
                setIsInvoiceGenerated(false);

                // Rediriger vers la page d'accueil après l'impression
                window.location.href = "/home";
            } else {
                setErrorModalMessage("Échec de l'insertion de la facture.");
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error("Erreur lors de l'insertion de la facture :", error);
            setErrorModalMessage("Erreur lors de l'insertion de la facture.");
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };
    
    
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

            {/* Affichage du modal d'erreur */}
                {showErrorModal && (
                    <ErrorModal 
                        message={errorModalMessage}
                        onClose={() => setShowErrorModal(false)}
                    />
                )}
            
            <div className="header">
                <div className="payment-info">
                    <div className="payment-method">
                        <button onClick={() => navigate('/home')}>
                            <img src={logo} alt="Logo" />
                        </button>
                    </div>
                    <div className="invoice-details">
                        <h2>FACTURE</h2>
                        <div>
                            <p className='m-0'><span class="fw-bold"> Numéro de facture: </span> {formatInvoiceNumber(invoiceNumber)} </p>
                            <p className='m-0'> <span class="fw-bold"> Commande :</span> {orderNumber}</p>
                            <p className='m-0'> <span class="fw-bold"> Date de facturation: </span> {invoiceDate}</p>
                            <p className='m-0'> <span class="fw-bold"> Échéance: </span> {dueDate}</p>
                            <p className='m-0'> <span class="fw-bold"> Mode de paiement: </span> Virement</p>
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
            {errorMessage && (
                <div className="error-message">{errorMessage}</div>
            )}
    
            <div className="invoice-table">
                <table>
                    <thead>
                        <tr>
                            <th class="text-center">Description</th>
                            <th class="text-center">Total</th>
                            <th class="text-center">Remise 12%</th>
                            <th class="text-center">Montant HT</th>
                            <th class="text-center">TVA</th>
                            <th class="text-center">Montant TTC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.categoryName}</td>
                                <td class="text-center">{formatNumberWithSeparator((item.MontantVendu))}</td>
                                <td class="text-center">{formatNumberWithSeparator((item.Remise))}</td>
                                <td class="text-center">{formatNumberWithSeparator((item.MontantHT))}</td>
                                <td class="text-center">{formatNumberWithSeparator((item.TVA))}</td>
                                <td class="text-end">{(formatNumberWithSeparator(item.MontantTTC))}</td>
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
                        >{formatCurrency(formatNumberWithSeparator(invoiceData.reduce((total, item) => total + item.MontantTTC, 0)))}</p>
                    </div>
                </div>
    
                <div className="footer">
                    <div>
                        <button onClick={handleGenerateInvoice} disabled={isLoading}>Générer la Facture</button>
                    </div>
                    <div>
                        <button onClick={handlePrintInvoice} disabled={isLoading}>Imprimer</button>
                    </div>          
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
