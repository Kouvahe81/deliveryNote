import React, { useState, useEffect,useCallback} from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/Logo.png';
import '../styles/category.css';
import '../styles/deleveryNote.css';
import { REACT_APP_BACKEND_URL } from "../config";

// Fonction pour générer la date actuelle au format dd-mm-yyyy
const generateDisplayDate = () => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    return `${day}-${month}-${year}`;
};

const ReturnVoucher = () => {
    const [isDisabled, setIsDisabled] = useState(true);
    const [deliveryNote, setDeliveryNote] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [message, setMessage] = useState('');
    const [returnVoucherCode, setReturnVoucherCode] = useState('');
    const [returnVoucherStatus, setReturnVoucherStatus] = useState(false);
    const [returnVoucherDate, setReturnVoucherDate] = useState(generateDisplayDate());
    const [branchId, setBranchId] = useState('');
    const [branchAddress, setBranchAddress] = useState('');
    const [branchCity, setBranchCity] = useState('');
    const [branchPostalCode, setBranchPostalCode] = useState('');
    

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const deliveryNoteId = queryParams.get('deliveryNoteId');

    // Fonction pour récupérer les données du bon de livraison et des produits
    const fetchFinalDeliveryNote = useCallback(async (id) => {
        try {
            const response = await axios.get(`${REACT_APP_BACKEND_URL}/deliveryNotes`, { params: { id } });
            const data = response.data;

            if (data.length > 0) {
                const deliveryNoteInfo = data[0];

                const productsList = data.map(item => ({
                    productId: item.productId,
                    description: item.productName,
                    quantity: 0,
                    maxQuantity: item.deliveryQuantity, // Quantité chargée
                    price: item.productPrice,
                }));
                
                setDeliveryNote({
                    deliveryNoteId: deliveryNoteInfo.deliveryNoteId,
                    returnVoucherCode: deliveryNoteInfo.deliveryNoteNumber,
                    returnVoucherDate: setReturnVoucherDate(returnVoucherDate),
                    branchId: deliveryNoteInfo.branchId,
                    branchAddress: deliveryNoteInfo.branchAddress,
                    branchCity: deliveryNoteInfo.branchCity,
                    branchPostalCode: deliveryNoteInfo.branchPostalCode,
                });

                setSelectedProducts(productsList);
                setReturnVoucherCode(deliveryNoteInfo.deliveryNoteNumber);
                setBranchId(deliveryNoteInfo.branchId);
                setBranchAddress(deliveryNoteInfo.branchAddress);
                setBranchCity(deliveryNoteInfo.branchCity);
                setBranchPostalCode(deliveryNoteInfo.branchPostalCode);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des détails du bon de livraison', error);
        }
    }, [returnVoucherDate]); // Inclure les dépendances si nécessaire

    useEffect(() => {
        if (deliveryNoteId) {
            fetchFinalDeliveryNote(deliveryNoteId);
        }
    }, [deliveryNoteId, fetchFinalDeliveryNote]);

    const isDebugMode = false;
    isDebugMode && console.log(setIsDisabled);
    isDebugMode && console.log(deliveryNote);
    isDebugMode && console.log(branchId);
    
    const convertDateToDBFormat = (dateString) => {
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
    };

    // Fonction pour réinitialiser les messages d'erreur
    const resetMessages = () => {
        setTimeout(() => {
            setMessage('');
        }, 5000);
    };

    // Fonction pour gérer le changement de quantité d'un produit
const handleQuantityChange = (index, quantity) => {
    const updatedProducts = [...selectedProducts];
    const maxQuantity = updatedProducts[index].maxQuantity;

    if (quantity > maxQuantity) {
        setMessage({ text: 'La quantité de retour ne peut excéder la quantité livrée.', type: 'error' });
        resetMessages();
    } else {
        updatedProducts[index].returnQuantity = quantity; // Met à jour returnQuantity avec quantity
        setSelectedProducts(updatedProducts);
        setMessage(''); // Réinitialiser le message en cas de valeur valide
    }
};

    const deleteMessage = () => {
        setTimeout(() => {
            resetMessages();
        }, 5000);
    }
            
    const handleButtonClick = async () => {
        const voucherDate = convertDateToDBFormat(returnVoucherDate);
    
        try {
            if (!deliveryNoteId) {
                throw new Error('ID du bon de livraison non défini');
            }
    
            // Crée le bon de retour
            await axios.post(`${REACT_APP_BACKEND_URL}/returnVoucher/${deliveryNoteId}`, {
                returnVoucherCode,
                returnVoucherDate: voucherDate,
                returnVoucherStatus,
            });
    
            // Mise à jour des produits dans le bon de livraison
            for (const product of selectedProducts) {
                if (typeof product.returnQuantity === 'undefined') {
                    console.error(`returnQuantity is undefined for product ${product.productId}`);
                    continue; // Skip this product and continue with the next one
                }
    
                try {
                    await axios.put(`${REACT_APP_BACKEND_URL}/toList`, {
                        returnQuantity: product.returnQuantity,
                        productId: product.productId,
                        deliveryNoteId
                    });
                } catch (error) {
                    console.error(`Erreur lors de la mise à jour du produit ${product.productId}:`, error);
                    setMessage({ text: `Erreur lors de la mise à jour du produit ${product.productId}.`, type: 'error' });
                    return; // Optionnel: Si vous voulez arrêter la mise à jour des autres produits en cas d'erreur
                }
            }
    
            setMessage({ text: 'Bon Retour créé avec succès', type: 'success' });
            resetMessages();
        } catch (error) {
            console.error('Erreur lors de la mise à jour du bon de livraison ou des produits :', error);
            setMessage({ text: 'Erreur lors de la mise à jour.', type: 'error' });
            resetMessages();
        }
    };
    
     
    // Fonction pour imprimer ou retourner à la liste des bons de livraison
    const handlePrint = async () => {
        try {
            // Mettre à jour le statut du bon retour à TRUE (1) après l'impression
            await axios.post(`${REACT_APP_BACKEND_URL}/returnVoucher/${deliveryNoteId}`, {
                returnVoucherStatus: true
            });

        // Mettre à jour l'état local
        setReturnVoucherStatus(true);
            // Masquer les boutons
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(button => button.classList.add('hidden-print'));

            deleteMessage();

            // Impression du bon de livraison
            window.print();

            // Retour à la liste des bons de livraison
            window.location.href = '/listDeliveryNote';
        } catch (error) {
            console.error("Erreur lors de l'impression du bon de livraison :", error);
            setMessage({ text: 'Erreur lors de l\'impression du bon de livraison.', type: 'error' });
        }
    };
    
    return (
        <div>
            <div className='main' style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className='resto m-1'>
                    <a href='/home'><img src={logo} alt="Logo" /></a>
                    <p className='m-0'>Brusselsteenweg 661</p>
                    <p className='m-0'>3090 Overijse</p>
                    <p className='m-0'>Numéro TVA: 0793745357</p>
                    <p className='m-0'>Contact: +32485239505</p>
                </div>
                <div className='branche m-1' style={{ width: '300px' }}>
                <p className='m-0'>Numéro du retour : {returnVoucherCode}</p>
                    <p className='m-0'>Date de livraison : {returnVoucherDate}</p>
                    <div className="form-group d-flex align-items-center haut">
                        <label htmlFor="branchCode" className="mr-2">Code client :</label>
                        <input
                            className={`custom-select }`}
                            id='branchCode'
                            value={branchPostalCode}
                            required
                            disabled={isDisabled}
                            style={{ color: 'black' }}
                        >
                        </input>
                    </div>
                    <div className='address-container'>
                        <p className='address-label'>Adresse : {branchAddress}</p>
                        <div className='address-details'>
                            <div>{branchPostalCode} {branchCity}</div>
                        </div>
                    </div>
                </div>
            </div>
            <h1 className="text-center mt-3">BON RETOUR</h1>
            <div className="mx-5">
                <table id="deliveryNoteTable" className="table table-bordered mt-3">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th className="centered-column">Quantité</th>
                            <th className="centered-column">Prix unitaire</th>
                            <th className="centered-column">Prix total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedProducts.map((product, index) => (
                            <tr key={product.productId}>
                                <td>{product.description}</td>
                                <td className="centered-column">
                                    <input
                                        type="number"
                                        min="0"
                                        max={product.maxQuantity} //Pour limiter directement dans l'input
                                        value={product.returnQuantity || product.quantity} // Affiche la quantité retournée ou la quantité actuelle
                                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                    />
                                </td>
                                <td className="centered-column">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={product.price}
                                        onChange={(e) => (parseFloat(e.target.value))}
                                    />
                                </td>
                                <td className="centered-column">€ {(product.price * (product.returnQuantity || product.quantity)).toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan="5" className='m-5'> Signature </td>
                        </tr>
                        <tr>
                            <td colSpan="5" className='m-5'> Remarques </td>
                        </tr>
                    </tbody>

                </table>
                <div className="text-center">
                    <button className='btn btn-primary m-2' onClick={handleButtonClick}> Valider </button>
                    <button className="btn btn-secondary" onClick={handlePrint}>Imprimer</button>
                </div>
                {message && (
                    <div id="error-message" className={`${message.type === 'error' ? 'text-danger' : 'text-success'} mb-3 col-12`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReturnVoucher;
