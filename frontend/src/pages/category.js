import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Loupe from '../images/Loupe.png';
//import '../styles/category.css'
import { REACT_APP_BACKEND_URL } from "../config";
    
    const Category = () => {
        const [category, setCategory] = useState([]);
        const [searchTerm, setSearchTerm] = useState('');
        const [message, setMessage] = useState({ text: '', type: '' });
        const [showModal, setShowModal] = useState(false);
        const [selectedCategory, setSelectedCategory] = useState(null);
        const [vatRate, setVatRate] = useState([]);
        //const [categoryId, setCategoryId] = useState('');
        const [categoryName, setCategoryName] = useState('');
        const [vatRateId, setVatRateId] = useState('');
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
            const nameValue = categoryName.trim().toUpperCase();
            const rateId = vatRateId;
            
            if (nameValue === ''|| rateId === false) {
                setMessage({ text: 'Veuillez remplir tous les champs SVP.', type: 'error' });
                deleteMessage();
                return false;
            } else {
                resetMessages();
                return true;
            }
        };
    
        const handleDeleteCategory = async (categoryId) => {
            const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?");
            if (confirmDelete) {
                try {
                    await axios.delete(`${REACT_APP_BACKEND_URL}/category/${categoryId}`);
                    // Mettre à jour la liste des catégories après la suppression réussie
                    listCategories();
                    setMessage({ text: 'La catégorie a été supprimé avec succès.', type: 'success' });
                } catch (error) {
                    console.error("Erreur lors de la suppression du produit :", error);
                    setMessage({ text: 'Erreur lors de la suppression de la catégorie.', type: 'error' });
                }
            }
            deleteMessage();
        };
    
        const handleOpenModal = (category) => {
            setSelectedCategory(category);
            setShowModal(true);
            setCategoryName(category.categoryName);
            setVatRateId(category.vatRateId);
        };
    
        const handleCloseModal = () => {
            setShowModal(false);
            setCategoryName('');
            setVatRateId('');
            
        };
    
        const handleUpdateCategory = async () => {
            const isValid = validationForm();
    
            if (!isValid) {
                setMessage({ text: 'Veuillez remplir les champs', type: 'error' });
                deleteMessage();
                return;
            }
            const confirmUpdate = window.confirm("Êtes-vous sûr de vouloir enregistrer les modifications ?");
            if (confirmUpdate) {
                try {
                    await axios.put(`${REACT_APP_BACKEND_URL}/category/${selectedCategory.categoryId}`, {
                        categoryName,
                        vatRateId
                    });
                    listCategories();
                    setMessage({ text: `${categoryName} a été mis à jour avec succès.`, type: 'success' });
                    handleCloseModal();
                } catch (error) {
                    console.error("Erreur lors de la mise à jour de la catégorie :", error);
                    setMessage({ text: 'Erreur lors de la mise à jour de la catégorie.', type: 'error' });
                }
            }
            deleteMessage();
        };
    
        const handleSearchTermChange = (event) => {
            const term = event.target.value;
            setSearchTerm(term);
        };
    
        const listCategories = () => {
            axios.get(`${REACT_APP_BACKEND_URL}/category`)
                .then(response => {
                    setCategory(response.data);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des catégories: ', error);
                });
        };

        const listVatRate = () => {
            axios.get(`${REACT_APP_BACKEND_URL}/vatRate`)
                .then(response => {
                    setVatRate(response.data);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des catégories: ', error);
                });
        };    
    
        useEffect(() => {
            listCategories();
            listVatRate();
        }, []);
    
        useEffect(() => {
            let url = `${REACT_APP_BACKEND_URL}/category`;
            axios.get(url)
                .then(response => {
                    let filteredcategory = response.data;
                    if (searchTerm.trim() !== '') {
                        filteredcategory = filteredcategory.filter(category =>
                            category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                    }
                    setCategory(filteredcategory);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des categories : ', error);
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
                                            <th>Nom</th>
                                            <th>TVA</th>
                                            <th colSpan="2" className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {category.map((category) => (
                                            <tr key={category.categoryId}>
                                                <td>{category.categoryName}</td>
                                                <td>{category.vatRateTaxe}</td>
                                                <td>
                                                    <button className="btn btn-warning" onClick={() => handleOpenModal(category)}>Modifier</button>
                                                </td>
                                                <td>
                                                    <button className="btn btn-danger" onClick={() => {handleDeleteCategory(category.categoryId);}}>Supprimer</button>
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
                        <Modal.Title> Catégorie </Modal.Title>
                    </Modal.Header>
                                    <Modal.Body>
                        {selectedCategory && (
                            <div>
                                {message.text && (
                                    <div className={`d-flex justify-content-center alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                                        {message.text}
                                    </div>
                                )}
                                <div className="form-group mb-3">
                                    <input
                                        className={`form-control ${isFocused ? 'focused' : ''}`}
                                        id="categoryName"
                                        placeholder="Nom"
                                        value={categoryName}
                                        onFocus={handleFocus}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                    />
                                </div>
                                
                                
                                <div className="form-group mb-3">
                                    <select
                                        className={`form-control ${isFocused ? 'focused' : ''}`}
                                        id='vatRateId'
                                        value={vatRateId}
                                        onFocus={handleFocus}
                                        onChange={(e) => setVatRateId(e.target.value)}
                                        required
                                    >
                                        <option value='' disabled> Sélectionnez un taux TVA </option>
                                        {vatRate.map((rate) => (
                                            <option key={rate.vatRateId} value={rate.vatRateId}>
                                                {rate.vatRateTaxe}
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
                        <Button className="d-flex justify-content-center" variant="success" onClick={handleUpdateCategory}>
                            Enregistrer
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    };
    
    export default Category;
    