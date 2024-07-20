import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Loupe from '../images/Loupe.png';
import '../styles/category.css'
import { REACT_APP_BACKEND_URL } from "../config";

const Product = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productId, setProductId] = useState('');
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productCost, setProductCost] = useState('');
    const [productCategoryId, setProductCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [isFocused, setIsFocused] = useState(false);

    const deleteMessage = () => {
        setTimeout(() => {
            resetMessages();
        }, 5000)
    }

    const resetMessages = () => {
        setMessage({
            text: '',
            type: ''
        });
    };

    const validationForm = () => {
        const nameValue = productName.trim().toUpperCase();
        const priceValue = productPrice;
        const costValue = productCost;
        const category = productCategoryId;
        
        if (nameValue === '' || priceValue === false  || costValue === false|| category ==='') {
            setMessage({ text: 'Veuillez remplir tous les champs SVP.', type: 'error' });
            deleteMessage();
            return false;
        } else {
            resetMessages();
            return true;
        }
    };

    const listProducts = (category) => {
        return new Promise((resolve, reject) => {
            let url = `${REACT_APP_BACKEND_URL}/products`;
            // Ajoutez la catégorie à l'URL si elle est sélectionnée
            if (category) {
                url += `?category=${category}`;
            }
            // Requête de la liste produit
            axios.get(url)
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    };

    const handleDeleteProduct = async (productId) => {
    // Recherche du produit dans le tableau products
    const productToDelete = products.find(product => product.productID === productId);
    const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer ${productToDelete.productName} ?`);
        if (confirmDelete) {
            try {
                await axios.delete(`${REACT_APP_BACKEND_URL}/product/${productId}`);
                const updatedProducts = products.filter(product => product.productID !== productId);
                setProducts(updatedProducts);
                setMessage({ text: `${productToDelete.productName} a été supprimé avec succès.`, type: 'success' });
            } catch (error) {
                console.error("Erreur lors de la suppression du produit :", error);
                setMessage({ text: 'Erreur lors de la suppression du produit.', type: 'error' });
            }
        }
        deleteMessage();
    };

    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setProductId(product.productID);
        setShowModal(true);
        setProductName(product.productName);
        setProductCost(product.productCost);
        setProductPrice(product.productPrice);
        setProductCategoryId(product.productCategoryID);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
        setProductName('');
        setProductCost('');
        setProductPrice('');
        setProductCategoryId('');
    };

    const handleUpdateProduct = async () => {
        const isValid = validationForm();

        if (!isValid) {
            setMessage({ text: 'Veuillez remplir les champs', type: 'error' });
            deleteMessage();
            return;
        }

        const confirmUpdate = window.confirm("Êtes-vous sûr de vouloir enregistrer les modifications ?");
        if (confirmUpdate) {
            try {
                await axios.put(`${REACT_APP_BACKEND_URL}/product/${selectedProduct.productID}`, {
                    productName,
                    productCost,
                    productPrice,
                    productCategoryId
                });
                // Mise à jour localement la liste des produits après la modification
                const updatedProducts = products.map(product => {
                    if (product.productID === selectedProduct.productID) {
                        return {
                            ...product,
                            productName,
                            productCost,
                            productPrice,
                            productCategoryId
                        };
                    } else {
                        return product;
                    }
                });
                setProducts(updatedProducts);
                setMessage({ text: `${productName} a été mis à jour avec succès.`, type: 'success' });
                handleCloseModal();
            } catch (error) {
                console.error("Erreur lors de la mise à jour du produit :", error);
                setMessage({ text: 'Erreur lors de la mise à jour du produit.', type: 'error' });
            }
        }
        deleteMessage();
    };

    const filterNonNumericInput = (event) =>{
        const keyCode = event.keyCode || event.which;
        const keyValue = String.fromCharCode(keyCode);
        const numericRegex = /^[0-9.]+$/;
    
        if (!numericRegex.test(keyValue)) {
            event.preventDefault();
        }
    }
    
    const handleSearchTermChange = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
    };

    const listCategories = () => {
        axios.get(`${REACT_APP_BACKEND_URL}/category`)
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des catégories: ', error);
            });
    };

    useEffect(() => {
        listCategories();
        listProducts();
    }, []);

    useEffect(() => {
        let url = `${REACT_APP_BACKEND_URL}/products`;
        axios.get(url)
            .then(response => {
                let filteredProducts = response.data;
                if (searchTerm.trim() !== '') {
                    filteredProducts = filteredProducts.filter(product =>
                        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setProducts(filteredProducts);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des produits : ', error);
            });
    }, [searchTerm]);

    const handleFocus = () => {
        setIsFocused(true);
    };

    return (
        <div>
            <HeaderHome />
            <div id="error-message" className={`mt-5 ${message.type === 'error' ? 'text-danger' : 'text-success'}`}>
                    {message.text}
            </div>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-10">
                    <div className="">
                        <div className="d-flex justify-content-center align-items-center">
                            <img className="loupe" src={Loupe} alt="Loupe" />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="..."
                                value={searchTerm}
                                onChange={handleSearchTermChange}
                            />
                        </div>
                        <div className="table mt-3">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Nom</th>
                                        <th>PR</th>
                                        <th>PV</th>
                                        <th>Catégorie</th>
                                        <th colSpan="2" className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.productID}>
                                            <td>{product.productID}</td>
                                            <td>{product.productName}</td>
                                            <td>{product.productCost}</td>
                                            <td>{product.productPrice}</td>
                                            <td>{product.categoryName}</td>
                                            <td>
                                                <button className="btn btn-warning" onClick={() => handleOpenModal(product)}>Modifier</button>
                                            </td>
                                            <td>
                                                <button className="btn btn-danger" onClick={() => {handleDeleteProduct(product.productID);}}>Supprimer</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
            <Modal 
                show={showModal} 
                onHide={handleCloseModal}
                dialogClassName="dialog-modal"
            >
                <Modal.Header className="d-flex justify-content-center">
                    <Modal.Title> Produit </Modal.Title>
                </Modal.Header>
                                <Modal.Body>
                    {selectedProduct && (
                        <div>
                            {message.text && (
                                <div className={`d-flex justify-content-center alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                                    {message.text}
                                </div>
                            )}
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="productId"
                                    placeholder="Code"
                                    value={productId}
                                    onFocus={handleFocus}
                                    onChange={(e) => setProductId(e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="productName"
                                    placeholder="Nom"
                                    value={productName}
                                    onFocus={handleFocus}
                                    onChange={(e) => setProductName(e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    onKeyPress={filterNonNumericInput}
                                    id="productCost"
                                    value={productCost}
                                    onFocus={handleFocus}
                                    placeholder="Prix de revient"
                                    onChange={(e) => setProductCost(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''} col-12`}
                                    onKeyPress={filterNonNumericInput}
                                    id="productPrice"
                                    value={productPrice}
                                    onFocus={handleFocus}
                                    placeholder="Prix de vente"
                                    onChange={(e) => setProductPrice(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <select
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id='productCategoryId'
                                    value={productCategoryId}
                                    onFocus={handleFocus}
                                    onChange={(e) => setProductCategoryId(e.target.value)}
                                    required
                                >
                                    <option value='' disabled> Sélectionnez une catégorie </option>
                                    {categories.map((category) => (
                                        <option key={category.categoryID} value={category.categoryID}>
                                            {category.categoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-center">
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Fermer
                    </Button>
                    <Button className="d-flex justify-content-center" variant="success" onClick={handleUpdateProduct}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Product;
