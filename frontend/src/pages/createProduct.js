import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import '../styles/product.css';
import { REACT_APP_BACKEND_URL } from "../config";

const CreateProduct = () => {
    const [productId, setProductId] = useState('');
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productCost, setProductCost] = useState('');
    const [productCategoryId, setProductCategoryId] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isFocused, setIsFocused] = useState(false);
    const [categories, setCategories] = useState([])  
    

    // Fonction rendu d'un champ
    const handleBlur = (event, field) => {
        const value = event.target.value.trim();
        if (value === '') {
            setMessage({ text: `${field} est obligatoire.`, type: 'error' });
            deleteMessage();
        } else {
            resetMessages();
        }
    };

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

    const handleFocus = () => {
        setIsFocused(true);
    };
	
    const filterNonNumericInput = (event) =>{
        const keyCode = event.keyCode || event.which;
        const keyValue = String.fromCharCode(keyCode);
        const numericRegex = /^[0-9.]+$/;
    
        if (!numericRegex.test(keyValue)) {
            event.preventDefault();
        }
    }

    // Fonction validation du formulaire de saisie
    const validationForm = () => {
        const idValue = productId.trim();
        const nameValue = productName.trim().toUpperCase();
        const priceValue = productPrice;
        const category = productCategoryId.trim();
        
        if (idValue === '' || nameValue === '' || priceValue === false || category ==='') {
            setMessage({ text: 'Veuillez remplir tous les champs SVP.', type: 'error' });
            deleteMessage();
            return false;
        } else {
            resetMessages();
            return true;
        }
    };
    
    //Fonction pour la liste des catégories
    const listCategories = () => {
        // Requête de la liste catégorie
        axios.get(`${REACT_APP_BACKEND_URL}/category`)
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des catégories: ', error);
            });
    };

    const handleCreateProduct = async () => {
        if (validationForm()) {
            try {
                await axios.post(`${REACT_APP_BACKEND_URL}/product`, {
                    productId,
                    productName,
                    productPrice,
                    productCost,
                    productCategoryId
                });
                // Affichage du message de succès
                setMessage({ text: 'Insertion réussie', type: 'success' });
    
                // Suppression du message 
                deleteMessage();
                
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    // Si le produit existe déjà
                    setMessage({ text: 'Le produit existe déjà.', type: 'error' });
                } else if (error.response && error.response.status === 400) {
                    // Si les champs n'ont pas le bon type
                    setMessage({ text: 'Assurez-vous que les champs ont le bon type.', type: 'error' });
                } else {
                    // Autres erreurs
                    console.error('Erreur lors de la création', error);
                    setMessage({ text: 'Insertion refusée.', type: 'error' });
                }
            } finally {
                // Réinitialisation des champs à vide
                setProductId('');
                setProductName('');
                setProductPrice(0.0);
                setProductCost(0.0);
                setProductCategoryId('');
                
                // Suppression du message après un court délai
                deleteMessage();
            }
        }
    };
    
    useEffect(() => {
        listCategories();
    }, []);
       
    return (
        <div>
            <HeaderHome/>
            <div className="container mt-3 d-flex justify-content-center">
                <div className="card col-4">
                    <div className="card-body">
                        <form className="row">
                            <h1 className="card-title text-center"> Produit </h1>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="number"
                                    id="productId"
                                    value={productId}
                                    onChange={(e) => setProductId(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Code')}
                                    onFocus={handleFocus}
                                    onKeyPress={filterNonNumericInput}
                                    placeholder="Code"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="text"
                                    id="productName"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Nom produit')}
                                    onFocus={handleFocus}
                                    placeholder="Nom"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">      
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="number"
                                    min={0}
                                    step={0.1}
                                    id="productCost"
                                    value={productCost}
                                    onChange={(e) => setProductCost(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Prix de revient')}
                                    onKeyPress={filterNonNumericInput}
                                    onFocus={handleFocus}
                                    placeholder="Prix de revient"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3 ">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="number"
                                    min={0}
                                    step={0.1}
                                    value={productPrice}
                                    onChange={(e) => setProductPrice(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Prix de Vente')}
                                    onKeyPress={filterNonNumericInput}
                                    onFocus={handleFocus}
                                    placeholder="Prix de Vente"
                                    required
                                />
                                
                            </div>
                            <div className="form-group">
                                <select
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id='productCategoryId'
                                    value={productCategoryId}
                                    onChange={(e) => setProductCategoryId(e.target.value)}
                                    onBlur={(e) => { handleBlur(e, 'Catégorie') }}
                                    onFocus={handleFocus}
                                    placeholder='Catégorie'
                                    required
                                >
                                    <option value='' disabled> Sélectionnez une catégorie </option>
                                        {categories.map((category) => (
                                            <option key={category.categoryId} value={category.categoryId}>
                                                {category.categoryName}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div id="error-message" className={`${message.type === 'error' ? 'text-danger' : 'text-success'} col-12`}>
                                {message.text}
                            </div>
                            <div className="d-flex justify-content-center col-12 mt-3">
                                <button
                                    type="button"
                                    className="btn btn-primary col-12"
                                    onClick={handleCreateProduct}
                                >
                                    Valider
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );   
       
};

export default CreateProduct;

