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

let currentInvoiceNumber = -1; // Variable pour suivre le dernier numéro utilisé

const generateInvoiceNumber = () => {
    currentInvoiceNumber += 1; // Incrémenter le numéro
    const paddedNumber = String(currentInvoiceNumber).padStart(4, '0'); // Ajouter des zéros au début
    return `${paddedNumber}`;
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
    const [invoicedate, setinvoicedate] = useState(generateDisplayDate());
    const [dueDate, setDueDate] = useState(generateDueDate());
    const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
    const [orderNumber, setOrderNumber] = useState(generateOrderNumber(invoiceNumber));
    const [headOffice, setHeadOffice] = useState([]);
    const [selectedOffice, setSelectedOffice] = useState({});
    const [fileName, setFileName] = useState(""); 
    
    const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    setFileName(file.name); // Met à jour le nom du fichier
    try {
      const jsonData = await readExcelFile(file);
      console.log(jsonData);
      
      // Créer un objet pour stocker les sommes par numéro d'article
      const sumByArticleNumber = {};

      // Parcourir les données et calculer les sommes par numéro d'article
      jsonData.forEach(row => {
        const articleNumber = row[3]; // Supposons que le numéro d'article est à l'indice 3 du tableau
        const quantitySold = parseInt(row[8]); // Supposons que la quantité vendue est à l'indice 8 du tableau
        if (articleNumber && !isNaN(quantitySold)) { // Vérifier que le numéro d'article et la quantité vendue sont présents
          if (sumByArticleNumber.hasOwnProperty(articleNumber)) {
            sumByArticleNumber[articleNumber] += quantitySold;
          } else {
            sumByArticleNumber[articleNumber] = quantitySold;
          }
        }
      });

      // Afficher les sommes par numéro d'article
      console.log('Sommes par numéro d\'article :', sumByArticleNumber);

      // Appeler la fonction de rappel avec les données Excel et les sommes calculées
      onFileUploaded({ jsonData, sumByArticleNumber });

    } catch (error) {
      console.error("Une erreur s'est produite lors de la lecture du fichier :", error);
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.xlsx' });

  const readExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      
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

    const listHeadOffice = async () => {
        try {
            const response = await axios.get(`${REACT_APP_BACKEND_URL}/headOffice`);
            setHeadOffice(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des informations de la maison mère : ', error);
        }
    };

    const today = new Date().toISOString().split('T')[0]; // Date du jour en format YYYY-MM-DD

    useEffect(() => {
        listHeadOffice(); // Appel de la fonction pour récupérer la liste des bureaux
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
    const handleOfficeChange = (e) => {
        const officeId = e.target.value;  // Récupère l'ID sélectionné
        const office = headOffice.find(o => o.headOfficeId === parseInt(officeId));  // Trouve l'objet bureau correspondant
        setSelectedOffice(office || {});  // Met à jour l'état avec les informations du bureau sélectionné
    };
    

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        const selectedEndDate = e.target.value;
        if (selectedEndDate > today) {
            setMessage('La date de fin ne peut pas dépasser la date du jour.');
        } else {
            setEndDate(selectedEndDate);
        }
    };

    const fetchExternalQuantities = async (startDate, endDate) => {
        try {
            const response = await axios.get(`${REACT_APP_BACKEND_URL}/external-quantities`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des quantités externes : ', error);
            return [];
        }
    };

    const compareQuantities = (invoiceData, externalQuantities) => {
        const discrepancies = invoiceData.filter(item => {
            const externalItem = externalQuantities.find(eq => eq.productName === item.categoryName);
            return !externalItem || item.quantitySold !== externalItem.quantity;
        });
        return discrepancies;
    };

    const fetchInvoiceData = async (startDate, endDate) => {
        try {
            const [invoiceResponse, externalQuantities] = await Promise.all([
                axios.get(`${REACT_APP_BACKEND_URL}/invoice`, {
                    params: { startDate, endDate }
                }),
                fetchExternalQuantities(startDate, endDate)
            ]);

            const discrepancies = compareQuantities(invoiceResponse.data, externalQuantities);

            if (discrepancies.length > 0) {
                setMessage('Les quantités ne correspondent pas pour certains produits. Facture non générée.');
                setInvoiceData([]); // Vide les données de la facture si des divergences sont trouvées
            } else {
                setInvoiceData(invoiceResponse.data); // Affiche les données de la facture si tout est en ordre
                setMessage(''); // Réinitialise le message d'erreur s'il y en avait un
            }

        } catch (error) {
            console.error('Erreur lors de la récupération des données : ', error);
            setMessage('Erreur lors de la récupération des données.');
        }
    };

    // Gestion des événements et autres parties du composant inchangées...

    const handlePrintInvoice = () => {
        if (invoiceData.length === 0) {
            setMessage('Impossible d\'imprimer la facture. Vérifiez que les données sont correctes.');
        } else {
            window.print();
        }
    };

    return (
        <div className="invoice-container">
            <div className="header">
                <div className="payment-info">
                    <div className="payment-method">
                        <a href='/home'><img src={logo} alt="Logo" /></a>
                    </div>
                    <div className="invoice-details">
                        <h2>FACTURE</h2>
                        <div>
                            <p className='m-0'>Numéro de facture: {invoiceNumber}</p>
                            <p className='m-0'>Commande : {orderNumber}</p>
                            <p className='m-0'>Date de facturation: {invoicedate}</p>
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
                    <select 
                        id="officeSelect" 
                        onChange={handleOfficeChange} 
                        value={selectedOffice.headOfficeId || ''}
                    >
                        <option value="">Sélectionner un bureau</option>
                        {headOffice.map(office => (
                            <option key={office.headOfficeId} value={office.headOfficeId}>
                                {office.headOfficeName}
                            </option>
                        ))}
                    </select> <h3>{selectedOffice.headOfficeName || ''}</h3>
                    
                    <p className='m-0'>{selectedOffice.headOfficeAddress || ''}</p>
                    <p className='m-0'>{selectedOffice.headOfficePostalCode || ''} {selectedOffice.headOfficeCity || ''}</p>
                    <p className='m-0'>Belgique</p>
                    <p className='m-0'>Numéro TVA: BE {selectedOffice.headOfficeVATNumber || ''}</p>
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
                    defaultValue={today}
                    onChange={handleEndDateChange}
                    max={today} 
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
