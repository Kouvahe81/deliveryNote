import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderHome from '../components/navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/createTemplate.css';
import { REACT_APP_BACKEND_URL } from "../config";

const Category = () => {
    const [categoryName, setCategoryName] = useState('');
    const [vatRateId, setVatRateId] = useState('');
    const [vatRates, setVatRates] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        // Charger les taux de TVA disponibles lors du chargement du composant
        fetchVatRates();
    }, []);

    // Fonction pour charger les taux de TVA disponibles depuis le serveur
    const fetchVatRates = async () => {
        try {
            const response = await axios.get(`${REACT_APP_BACKEND_URL}/vatRate`);
            setVatRates(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des taux de TVA :', error);
        }
    };

    // Fonction pour gérer le focus perdu d'un champ
    const handleBlur = (event, field) => {
        const value = event.target.value.trim();
        if (value === '') {
            setMessage({ text: `"${field}" est obligatoire.`, type: 'error' });
            deleteMessage();
        } else {
            resetMessages();
        }
    };

    // Fonction pour réinitialiser les messages
    const resetMessages = () => {
        setMessage({
            text: '',
            type: ''
        });
    };

    // Fonction pour la validation du formulaire
    const validationForm = () => {
        const name = categoryName.trim();
        const rateId = vatRateId.trim();

        if (name === '' || rateId === '') {
            setMessage({ text: 'Veuillez remplir tous les champs du formulaire.', type: 'error' });
            deleteMessage();
            return false;
        }

        // Réinitialiser le message d'erreur s'il n'y a pas d'erreur
        resetMessages();
        return true;
    };

    const handleAddCategory = async () => {
        if (validationForm()) {
            try {
                await axios.post(`${REACT_APP_BACKEND_URL}/category`, {
                    categoryName: categoryName,
                    vatRateId: vatRateId,
                });
                setMessage({ text: 'Insertion réussie', type: 'success' });
                deleteMessage();
                
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    setMessage({ text: 'La catégorie existe déjà.', type: 'error' });
                } else if (error.response && error.response.status === 400) {
                    setMessage({ text: 'Assurez-vous que les champs ont le bon type.', type: 'error' });
                } else {
                    console.error('Erreur lors de la création', error);
                    setMessage({ text: 'Insertion refusée.', type: 'error' });
                }
            } finally {
                setCategoryName('');
                setVatRateId('');
                deleteMessage();
            }
        }
    };

    //Fonction pour supprimer le message après un certain délai
    const deleteMessage = () => {
        setTimeout(() => {
            resetMessages();
        }, 5000);
    };

    // Générer les options pour la liste déroulante des taux de TVA
    const renderVatRateOptions = () => {
        return vatRates.map(rate => (
            <option key={rate.vatRateId} value={rate.vatRateId}>{rate.vatRateTaxe}</option>
        ));
    };

    // Gérer le focus sur le champ
    const handleFocus = () => {
        setIsFocused(true);
    };

    
    return (
        <div>
            <HeaderHome />
            <div className="container mt-3 d-flex justify-content-center">
                <div className="card col-4">
                    <div className="card-body ">
                        <form className="row w-300">
                            <h1 className="card-title text-center w-100">Catégorie</h1>
                            <div className="form-group mb-3 w-100">
                                <input
                                    type="text"
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="categoryName"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Nom de la catégorie')}
                                    onFocus={handleFocus}
                                    placeholder="Nom de la catégorie"
                                    required
                                />
                            </div>
                            <div className="form-group w-100">
                                <select
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="vatRateId"
                                    value={vatRateId}
                                    onChange={(e) => setVatRateId(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Taux de TVA')}
                                    onFocus={handleFocus}
                                    required
                                >
                                    <option value="">Sélectionner un taux de TVA</option>
                                    {renderVatRateOptions()}
                                </select>
                            </div>
                            <div id="error-message" className={`${message.type === 'error' ? 'text-danger' : 'text-success'}`}>
                                {message.text}
                            </div>
                            <div className="d-flex justify-content-center">
                                <button
                                    type="button"
                                    className="btn btn-primary col-12 mt-3"
                                    onClick={handleAddCategory}
                                >
                                    Ajouter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Category;
