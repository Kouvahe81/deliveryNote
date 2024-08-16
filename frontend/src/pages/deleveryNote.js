import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate} from 'react-router-dom';
import logo from '../images/Logo.png';
import axios from 'axios';
import Modal from 'react-modal';
import '../styles/category.css';
import '../styles/deleveryNote.css';
import { REACT_APP_BACKEND_URL } from "../config";

const generateDisplayDate = () => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    return `${day}-${month}-${year}`;
};

const BonDeLivraison = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDeliveryNoteId, setCurrentDeliveryNoteId] = useState(null);
    const [deliveryNoteStatus, setDeliveryNoteStatus] = useState(false);
    const [products, setProducts] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);
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
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const deliveryNoteId = queryParams.get('deliveryNoteId');
    const navigate = useNavigate();

    const fetchLastDeliveryNoteId = async () => {
        try {
            const response = await axios.get(`${REACT_APP_BACKEND_URL}/getLastDeliveryNoteId`);
            const lastId = response.data[0].lastId;
            return lastId === null ? 1 : lastId + 1;
        } catch (error) {
            console.error('Erreur lors de la récupération du dernier ID de bon de livraison : ', error);
            return null;
        }
    };

    const generateDeliveryNumber = useCallback(async () => {
        try {
            const newId = await fetchLastDeliveryNoteId();
            if (newId !== null) {
                const formattedId = String(newId).padStart(4, '0');
                const baseDeliveryNumber = generateDisplayDate();
                setDeliveryNoteNumber(`${baseDeliveryNumber}-${formattedId}`);
                return newId;
            } else {
                setDeliveryNoteNumber('Erreur dans la génération du numéro');
                return 0;
            }
        } catch (error) {
            console.error('Erreur lors de la génération du numéro de bon de livraison:', error);
        }
    }, []);

    const listBranches = async () => {
        try {
            const response = await axios.get(`${REACT_APP_BACKEND_URL}/branch`);
            setBranches(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des codes de succursales : ', error);
        }
    };

    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const convertDateToDBFormat = (dateString) => {
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
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
        generateDeliveryNumber();
        if (modalIsOpen) {
            fetchProducts();
        }
    }, [fetchProducts, modalIsOpen, searchTerm, generateDeliveryNumber]);

    const addProductToDelivery = (idProduct, description, price) => {
        const isProductExist = selectedProducts.some(product => product.id === idProduct);
        if (!isProductExist) {
            setSelectedProducts([...selectedProducts, { id: idProduct, description, price, quantity: deliveryQuantity, returnQuantity: 0 }]);
            setMessage('');
        } else {
            setMessage({ text: 'Le produit existe déjà dans la liste !', type: 'error' });
            resetMessages();
        }
        setModalIsOpen(true);
    };

    const handleContextMenu = (event, index) => {
        event.preventDefault();
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
            handleDeleteProduct(index);
        }
    };

    const handleDeleteProduct = (index) => {
        const updatedProducts = [...selectedProducts];
        updatedProducts.splice(index, 1);
        setSelectedProducts(updatedProducts);
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setSearchTerm('');
        setModalIsOpen(false);
    };

    const validateForm = () => {
        if (!deliveryNoteNumber || !deliveryDate || !branchId || selectedProducts.length === 0) {
            setMessage({ text: 'Veuillez remplir tous les champs requis.', type: 'error' });
            deleteMessage();
            return false;
        }

        for (const product of selectedProducts) {
            if (!Number.isFinite(product.quantity) || product.quantity <= 0 || !Number.isFinite(product.price) || product.price <= 0) {
                setMessage({ text: "Les quantités et les prix des produits doivent être des nombres valides et supérieurs à 0.", type: 'error' });
                deleteMessage();
                return false;
            }
        }

        setMessage('');
        return true;
    };

    const handleCreateDeliveryNote = async () => {
        if (!validateForm()) {
            return;
        }

        const date_delivery = convertDateToDBFormat(deliveryDate);
        try {
            const response = await axios.post(`${REACT_APP_BACKEND_URL}/deliveryNote`, {
                deliveryNoteNumber,
                deliveryDate: date_delivery,
                deliveryNoteStatus,
                branchId
            });

            const createdDeliveryNote = response.data;
            setMessage({ text: '', type: 'success' });
            resetMessages();

            return createdDeliveryNote.deliveryNoteId;
        } catch (error) {
            console.error('Erreur lors de la création du bon de livraison', error);
            setMessage({ text: 'Erreur lors de la création du bon de livraison.', type: 'error' });
            deleteMessage();
            throw error;
        }
    };

    const handleCreateToList = async (deliveryNoteId) => {
        try {
            const productsToAdd = selectedProducts.map(product => ({
                deliveryNoteId: deliveryNoteId,
                productId: product.id,
                deliveryQuantity: product.quantity,
                returnQuantity: product.returnQuantity,
                productPrice: product.price
            }));
            
            await axios.post(`${REACT_APP_BACKEND_URL}/to_list`, {
                deliveryNoteId: deliveryNoteId,
                products: productsToAdd
            });

            setMessage({ text: 'Bon de livraison crée avec succès.', type: 'success' });
            resetMessages();
        } catch (error) {
            console.error('Erreur lors de l\'ajout des produits', error);
            setMessage({ text: 'Erreur lors de l\'ajout des produits.', type: 'error' });
            deleteMessage();
        } finally {
            resetProductSelection();
        }
    };

      // Fonction pour afficher la boîte de dialogue de confirmation d'impression
      const showPrintConfirmationDialog = (deliveryNoteId) => {
        setConfirmationModalIsOpen(true);
        setCurrentDeliveryNoteId(deliveryNoteId); 
    };

    // Fonction pour masquer la boîte de dialogue de confirmation d'impression
    const closePrintConfirmationDialog = () => {
        setConfirmationModalIsOpen(false);
    };

    const handlePrintConfirmation = async (shouldPrint) => {
        closePrintConfirmationDialog();
        if (shouldPrint) {
            navigate(`/finalDeliveryNote?deliveryNoteId=${currentDeliveryNoteId}`);
        }else{
            window.location.reload();
        }
    };

    const redirectToDeliveryNoteList = () => {
        navigate('/listDeliveryNote');
    };
    
    const handleButtonClick = async () => {
        try {
            const deliveryNoteId = await handleCreateDeliveryNote();
            if (deliveryNoteId) {
                await handleCreateToList(deliveryNoteId);
                showPrintConfirmationDialog(deliveryNoteId); // Afficher la boîte de dialogue après la création
                resetDeliveryNote();
            } else {
                //console.error('L\'identifiant du bon de livraison est indéfini');
                setMessage({ text: 'Veuillez remplir les champs requis SVP.', type: 'error' });
                deleteMessage();
            }
        } catch (error) {
            console.error('Erreur dans le processus de création', error);
        }
    };

    const resetMessages = () => {
        setTimeout(() => {
            setMessage('');
        }, 5000);
    };

    const resetDeliveryNote = () => {
        setDeliveryDate(generateDisplayDate());
        setDeliveryNoteStatus(false);
        setBranchId('');
        setSelectedProducts([]);
        setDeliveryNoteNumber('');
        
    };

    const resetProductSelection = () => {
        setSelectedProducts([]);
        setDeliveryQuantity(1);
    };

    const isDebugMode = false;
    isDebugMode && console.log(deliveryNoteId);
    const handleFocus = () => {
        setIsFocused(true);
    };

    const deleteMessage = () => {
        // Ajout du délai de réinitialisation du message après 5 secondes
        setTimeout(() => {
            resetMessages();
        }, 5000)
    }

    const handlePriceChange = (index, newPrice) => {
        const updatedProducts = [...selectedProducts];
        updatedProducts[index].price = newPrice;
        setSelectedProducts(updatedProducts);
    };

    const handleQuantityChange = (index, newQuantity) => {
        const updatedProducts = [...selectedProducts];
        updatedProducts[index].quantity = newQuantity;
        setSelectedProducts(updatedProducts);
    };

    const handleBranchChange = (e) => {
        const selectedBranchCode = e.target.value;
        const selectedBranch = branches.find(office => office.branchCode === selectedBranchCode);

        setBranchId(selectedBranch ? selectedBranch.branchId : '');
        setBranchAddress(selectedBranch ? selectedBranch.branchAddress : '');
        setBranchPostalCode(selectedBranch ? selectedBranch.branchPostalCode : '');
        setBranchCity(selectedBranch ? selectedBranch.branchCity : '');
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
                    <p className='m-0'>Date de livraison : {deliveryDate}</p>
                    <div className="form-group d-flex align-items-center haut">
                        <label htmlFor="branchCode" className="mr-2">Code client :</label>
                        <select
                            className={`form-control custom-select ${isFocused ? 'focused' : ''}`}
                            id='branchCode'
                            value={branchId ? branches.find(office => office.branchId === branchId)?.branchCode : ''}
                            onFocus={handleFocus}
                            onChange={handleBranchChange}
                            required
                        >
                            <option value=''>Code</option>
                            {branches.map((office) => (
                                <option key={office.branchId} value={office.branchCode}>
                                    {office.branchCode}
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
                <table id="deliveryNoteTable" className="table  table-bordered mt-3">
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
                            <tr key={product.id} onContextMenu={(e) => handleContextMenu(e, index)}>
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
                    <button className='btn btn-primary m-2' onClick={handleButtonClick} disabled={deliveryNoteStatus}>Créer le bon de livraison</button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={redirectToDeliveryNoteList}
                        style={{ fontWeight: 'bold' }}
                    > → Bons</button>

                </div>
                {message && (
                    <div id="error-message" className={`${message.type === 'error' ? 'text-danger' : 'text-success'} mb-3 col-12`}>
                        {message.text}
                    </div>
                )}
            </div>
            {confirmationModalIsOpen && (
                <div className="confirmation-modal">
                    <p>Voulez-vous imprimer ?</p>
                    <button onClick={() => handlePrintConfirmation(true)}>Oui</button>
                    <button onClick={() => handlePrintConfirmation(false)}>Non</button>
                </div>
            )}
        </div>
    );
};

export default BonDeLivraison;