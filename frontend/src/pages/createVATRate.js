import React, { useState } from 'react';
import axios from 'axios';
import HeaderHome from '../components/navbar';
import { REACT_APP_BACKEND_URL } from "../config";

const CreateVATRate = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const [vatRateTaxe, setVatRateTaxe] = useState('');
    const [vatRateStartDate, setVatRateStartDate] = useState(currentDate);
    const [vatRateEndDate, setVatRateEndDate] = useState(currentDate);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isFocused, setIsFocused] = useState(false);

    // Fonction pour le focus perdu d'un champ
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
        const rate = vatRateTaxe.trim();
        const startDate = vatRateStartDate;
        const endDate = vatRateEndDate;

        if (rate === '' || startDate === '' || endDate === '') {
            setMessage({ text: 'Veuillez remplir tous les champs du formulaire.', type: 'error' });
            deleteMessage();
            return false;
        }

        // Vérifier si la date de début est antérieure à la date de fin
        if (startDate > endDate) {
            setMessage({ text: 'La date de début ne peut pas être postérieure à la date de fin.', type: 'error' });
            deleteMessage();
            return false;
        }

        // Réinitialiser le message d'erreur s'il n'y a pas d'erreur
        resetMessages();
        return true;
    };

    const handleCreateVatRate = async () => {
        if (validationForm()) {
            try {
                // Créer le taux de TVA
                await axios.post(`${REACT_APP_BACKEND_URL}/vatRate`, {
                    vatRateTaxe,
                    vatRateStartDate,
                    vatRateEndDate
                });

                setMessage({ text: 'Insertion réussie', type: 'success' });
                deleteMessage();
                
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    setMessage({ text: 'Ce taux TVA existe déjà.', type: 'error' });
                } else if (error.response && error.response.status === 400) {
                    setMessage({ text: 'Assurez-vous que les champs ont le bon type.', type: 'error' });
                } else {
                    console.error('Erreur lors de la création', error);
                    setMessage({ text: 'Insertion refusée.', type: 'error' });
                }
            } finally {
                setVatRateTaxe('');
                setVatRateStartDate(currentDate);
                setVatRateEndDate(currentDate);
                deleteMessage();
            }
        }
    };

    const deleteMessage = () => {
        // Ajouter un délai pour réinitialiser le message après 5 secondes
        setTimeout(() => {
            resetMessages();
        }, 5000);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    return (
        <div>
            <HeaderHome />
            <div className="container mt-3 d-flex justify-content-center">
                <div className="card col-4">
                    <div className="card-body">
                        <form className="row">
                            <h1 className="card-title text-center">TVA</h1>
                            <div className="form-group mb-3">
                                <input
                                    type="number"
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="vatRate"
                                    value={vatRateTaxe}
                                    onChange={(e) => setVatRateTaxe(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Taux TVA')}
                                    onFocus={handleFocus}
                                    placeholder="Taux"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    type="date"
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="vatRateStart"
                                    value={vatRateStartDate}
                                    onChange={(e) => setVatRateStartDate(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Date de début')}
                                    onFocus={handleFocus}
                                    placeholder="Date de début"
                                    min={currentDate}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="date"
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="vatRateEnd"
                                    value={vatRateEndDate}
                                    onChange={(e) => setVatRateEndDate(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Date de fin')}
                                    onFocus={handleFocus}
                                    placeholder="Date de fin"
                                    min={currentDate}
                                    required
                                />
                            </div>
                            <div id="error-message" className={`${message.type === 'error' ? 'text-danger' : 'text-success'}`}>
                                {message.text}
                            </div>
                            <div className="d-flex justify-content-center">
                                <button
                                    type="button"
                                    className="btn btn-primary col-12 mt-3"
                                    onClick={handleCreateVatRate}
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

export default CreateVATRate;
