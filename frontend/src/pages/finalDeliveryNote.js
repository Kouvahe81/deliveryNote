import React, { useState, useEffect , useCallback} from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
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

const FinalDeliveryNote = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [deliveryNote, setDeliveryNote] = useState(null);
    const [deliveryNoteStatus, setDeliveryNoteStatus] = useState(false);
    const [products, setProducts] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [message, setMessage] = useState('');
    const [branches, setBranches] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('');
    const [deliveryDate, setDeliveryDate] = useState(generateDisplayDate());
    const [branchId, setBranchId] = useState('');
    const [branchAddress, setBranchAddress] = useState('');
    const [branchCity, setBranchCity] = useState('');
    const [branchPostalCode, setBranchPostalCode] = useState('');
    const [deliveryQuantity, setDeliveryQuantity] = useState(1);
    const [returnQuantity, setReturnQuantity] = useState(0)
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const deliveryNoteId = queryParams.get('deliveryNoteId');

    // Fonction pour récupérer les données du bon de livraison et des produits
    const fetchFinalDeliveryNote = async (id) => {
        try {
            const response = await axios.get(`${REACT_APP_BACKEND_URL}/deliveryNotes`, { params: { id } });
            const data = response.data;

            if (data.length > 0) {
                // Extraire les informations du bon de livraison
                const deliveryNoteInfo = data[0];
                               
                // Extraire les informations des produits
                const productsList = data.map(item => ({
                    productId: item.productId,
                    description: item.productName,
                    quantity: item.deliveryQuantity,
                    price: item.productPrice,
                }));
                
                // Remplir les données du bon de livraison
                setDeliveryNote({
                    deliveryNoteId: deliveryNoteInfo.deliveryNoteId,
                    deliveryNoteNumber: deliveryNoteInfo.deliveryNoteNumber,
                    deliveryDate: deliveryNoteInfo.deliveryDate,
                    branchId: deliveryNoteInfo.branchId,
                    branchAddress: deliveryNoteInfo.branchAddress,
                    branchCity: deliveryNoteInfo.branchCity,
                    branchPostalCode: deliveryNoteInfo.branchPostalCode,
                });

                // Remplir les lignes de produits
                setSelectedProducts(productsList);
                setDeliveryNoteNumber(deliveryNoteInfo.deliveryNoteNumber);
                setDeliveryDate(deliveryNoteInfo.deliveryDate);
                setBranchId(deliveryNoteInfo.branchId);
                setBranchAddress(deliveryNoteInfo.branchAddress);
                setBranchCity(deliveryNoteInfo.branchCity);
                setBranchPostalCode(deliveryNoteInfo.branchPostalCode);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des détails du bon de livraison', error);
        }
    };

    useEffect(() => {
        if (deliveryNoteId) {
            fetchFinalDeliveryNote(deliveryNoteId);
        }
    }, [deliveryNoteId]);

    // Fonction pour réinitialiser les messages d'erreur
    const resetMessages = () => {
        setTimeout(() => {
            setMessage('');
        }, 5000);
    };

    // Fonction pour récupérer toutes les branches
    const listBranches = async () => {
        try {
            const response = await axios.get(`${REACT_APP_BACKEND_URL}/branch`);
            setBranches(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des codes de succursales : ', error);
        }
    };

    const fetchProducts = useCallback(async () => {
        try {
            const response = await axios.get(`${REACT_APP_BACKEND_URL}/products`);
            let filteredProducts = response.data;

            if (searchTerm.trim() !== '') {
                filteredProducts = filteredProducts.filter(product =>
                    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            setProducts(filteredProducts.slice(0, 5));
        } catch (error) {
            console.error('Erreur lors de la récupération des produits : ', error);
        }
    }, [searchTerm]);

    useEffect(() => {
        listBranches();
        
        if (modalIsOpen) {
            fetchProducts();
        }
    }, [fetchProducts, modalIsOpen, searchTerm]);

    useEffect(() => {
        listBranches();
    }, []);

    // Gestion du changement de branche
    const handleBranchChange = (e) => {
        const selectedBranchCode = e.target.value;
        const selectedBranch = branches.find(branch => branch.branchCode === selectedBranchCode);

        if (selectedBranch) {
            setBranchId(selectedBranch.branchId);
            setBranchAddress(selectedBranch.branchAddress);
            setBranchPostalCode(selectedBranch.branchPostalCode);
            setBranchCity(selectedBranch.branchCity);
        }
    };

    // Gestion du clic droit pour supprimer un produit
    const handleContextMenu = (event, index) => {
        event.preventDefault();
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
            handleDeleteProduct(index);
        }
    };

    // Fonction pour supprimer un produit
    const handleDeleteProduct = (index) => {
        const updatedProducts = [...selectedProducts];
        updatedProducts.splice(index, 1);
        setSelectedProducts(updatedProducts);
    };

    // Ouvrir le modal pour ajouter un produit
    const openModal = () => {
        setModalIsOpen(true);
    };

    // Fermer le modal
    const closeModal = () => {
        setModalIsOpen(false);
    };

    // Fonction pour gérer le changement de quantité d'un produit
    const handleQuantityChange = (index, quantity) => {
        const updatedProducts = [...selectedProducts];
        updatedProducts[index].quantity = quantity;
        setSelectedProducts(updatedProducts);
    };

    // Fonction pour gérer le changement du prix d'un produit
    const handlePriceChange = (index, price) => {
        const updatedProducts = [...selectedProducts];
        updatedProducts[index].price = price;
        setSelectedProducts(updatedProducts);
    };

    // Fonction pour gérer la recherche de produits
    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Fonction pour ajouter un produit au bon de livraison
    const addProductToDelivery = (productId, description, price) => {
        const isProductExist = selectedProducts.some(product => product.productId === productId);
        if (!isProductExist) {
            setSelectedProducts([...selectedProducts, { productId, description, price, quantity: deliveryQuantity, returnQuantity: 0 }]);
            setMessage('');
        } else {
            setMessage({ text: 'Le produit existe déjà dans la liste !', type: 'error' });
            resetMessages();
        }
        setModalIsOpen(false);
    };

    const validateForm = () => {
        return deliveryNoteNumber && deliveryDate && branchId && selectedProducts.length > 0;
    };   

    const convertDateToDBFormat = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Fonction pour masquer le bouton
    const hideButton = () => {
        const button = document.getElementById('myButton');
        if (button) {
            button.classList.add('Hidden');  // Ajouter la classe pour masquer le bouton
        }
    };

    const deleteMessage = () => {
        // Ajout du délai de réinitialisation du message après 5 secondes
        setTimeout(() => {
            resetMessages();
        }, 5000)
    }

    /*Fonction pour afficher le bouton
    const showButton = () => {
        const button = document.getElementById('myButton');
        if (button) {
            button.classList.remove('Hidden');  // Retirer la classe pour afficher le bouton
        }
    };
    */

    const handleButtonClick = async () => {
        if (!validateForm()) {
            setMessage({ text: 'Veuillez remplir tous les champs requis.', type: 'error' });
            return;
        }   
        
        try {
            if (!deliveryNoteId) {
                throw new Error('ID du bon de livraison non défini');
            }
            // Mise à jour du bon de livraison
            await axios.put(`${REACT_APP_BACKEND_URL}/deliveryNote/${deliveryNoteId}`, {
                deliveryNoteNumber,
                deliveryDate,
                deliveryNoteStatus
            });
            // Mise à jour des produits dans le bon de livraison
            for (const product of selectedProducts) {
                setReturnQuantity(product.returnQuantity);
    
                await axios.put(`${REACT_APP_BACKEND_URL}/toList`, {
                    productId: product.productId,
                    deliveryNoteId,
                    deliveryQuantity: product.quantity,
                    returnQuantity,
                    productPrice: product.price
                });
            }
            const isDebugMode = false;
            isDebugMode && console.log(setDeliveryNoteStatus(false));
            isDebugMode && console.log(setDeliveryQuantity(1));
            isDebugMode && console.log(setDeliveryNote(deliveryNote));

            setMessage({ text: 'Bon de livraison mis à jour avec succès', type: 'success' });
            resetMessages();
        } catch (error) {
            console.error('Erreur lors de la mise à jour du bon de livraison ou des produits :', error);
            setMessage({ text: 'Erreur lors de la mise à jour.', type: 'error' });
        }
    };

     // Fonction pour imprimer ou retourner à la liste des bons de livraison
     const handlePrint = async () => {
        try {
            // Mise à jour du statut avant l'impression
            await axios.put(`${REACT_APP_BACKEND_URL}/deliveryNote/${deliveryNoteId}`, {
                deliveryNoteNumber,
                deliveryDate,
                deliveryNoteStatus: true  // Mettre à jour le statut ici
            });
            setMessage({ text: ``, type: 'success' });
            
            // Masquer les éléments avant l'impression
            hideButton(); // Masquer le bouton "Ajouter un produit"

            // Masquer les éléments avant l'impression
            const table = document.getElementById('deliveryNoteTable');
            if (table) {
                const headerCells = table.rows[0].cells;
                const actionColumnIndex = Array.from(headerCells).findIndex(cell => cell.innerText === 'Actions');
                if (actionColumnIndex !== -1) {
                    // Supprimer la colonne d'action
                    for (let row of table.rows) {
                        if (row.cells.length > actionColumnIndex) {
                            row.deleteCell(actionColumnIndex);
                        }
                    }
                }
            }
    
            // Masquer les boutons
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(button => button.classList.add('hidden-print'));

            deleteMessage();
    
            // Impression du bon de livraison
            window.print();
    
            // Réinitialiser les styles après l'impression
            buttons.forEach(button => button.classList.remove('hidden-print'));
    
            // Réafficher la colonne "Action" et actualiser la page
            if (table) {
                const headerRow = table.insertRow(0);
                const headerCell = document.createElement('th');
                headerCell.innerText = 'Actions';
                headerRow.appendChild(headerCell);
                for (let i = 1; i < table.rows.length; i++) {
                    const cell = table.rows[i].insertCell(-1);
                    cell.innerText = 'Actions';  
                }
            }
    
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
                    <p className='m-0'>Numéro de livraison : {deliveryNoteNumber}</p>
                    <p className='m-0'>Date de livraison : {convertDateToDBFormat(deliveryDate)}</p>
                    <div className="form-group d-flex align-items-center haut">
                        <label htmlFor="branchCode" className="mr-2">Code client :</label>
                        <select
                            className={`form-control custom-select ${isFocused ? 'focused' : ''}`}
                            id='branchCode'
                            value={branchId ? branches.find(branch => branch.branchId === branchId)?.branchCode : ''}
                            onFocus={() => setIsFocused(true)}
                            onChange={handleBranchChange}
                            required
                        >
                            <option value=''>Code</option>
                            {branches.map((branch) => (
                                <option key={branch.branchId} value={branch.branchCode}>
                                    {branch.branchCode}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='address-container'>
                        <p className='address-label'>Adresse : {branchAddress}</p>
                        <div className='address-details'>
                            <div>{branchPostalCode} {branchCity}</div>
                        </div>
                    </div>
                </div>
            </div>
            <h1 className="text-center mt-3">BON DE LIVRAISON</h1>
            <div className="mx-5">
                <button id="myButton"
                            className="btn" 
                            onClick={openModal} disabled={deliveryNoteStatus}
                            style={{ fontWeight: 'bold' }}
                >+ Produit
                </button>
                <Modal 
                    isOpen={modalIsOpen} 
                    onRequestClose={closeModal}  
                    className="modal-dialog m-3 custom-modal"
                    overlayClassName="custom-overlay"
                    contentLabel="Example Modal"
                    appElement={document.getElementById('root')}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title text-center">Sélectionner un produit</h5>
                            <button type="button" className="close" onClick={closeModal}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                className="form-control mb-3"
                                placeholder="Rechercher un produit"
                                value={searchTerm}
                                onChange={handleSearchTermChange}
                            />
                        </div>
                        <div>
                            <ul>
                                {products.map(product => (
                                    <li key={product.productID} onClick={() => addProductToDelivery(product.productID, product.productName, product.productPrice)}>
                                        {product.productName}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Modal>
                <table id="deliveryNoteTable" className="table table-bordered mt-3">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th class="centered-column">Quantité</th>
                            <th class="centered-column">Prix unitaire</th>
                            <th class="centered-column">Prix total</th>
                            <th class="centered-column">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedProducts.map((product, index) => (
                            <tr key={product.productId} onContextMenu={(e) => handleContextMenu(e, index)}>
                                <td>{product.description}</td>
                                <td class="centered-column">
                                    <input
                                        type="number"
                                        min="1"
                                        value={product.quantity}
                                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                    />
                                </td>
                                <td class="centered-column">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={product.price}
                                        onChange={(e) => handlePriceChange(index, parseFloat(e.target.value))}
                                    />
                                </td>
                                <td class="centered-column">€ {(product.price * product.quantity).toFixed(2)}</td>
                                <td class="centered-column">
                                    <button className="btn btn-danger" onClick={() => handleDeleteProduct(index)}>Supprimer</button>
                                </td>
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
                    <button className='btn btn-primary m-2' onClick={handleButtonClick} disabled={deliveryNoteStatus}> Valider </button>
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

export default FinalDeliveryNote;
