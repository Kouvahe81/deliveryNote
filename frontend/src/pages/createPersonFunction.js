import React, { useState,useEffect } from 'react';
import axios from "axios";
import HeaderHome from "../components/navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/createTemplate.css'

function PersonFonction() {
    const [functionName, setFunctionName] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
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
        // Ajout du délai de réinitialisation du message après 5 secondes
        setTimeout(() => {
            resetMessages();
        }, 5000)
    }

    // Fonction réinitialisation du message
    const resetMessages = () => {
        setMessage({
            text: '',
            type: ''
        });
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const validationForm = () => {
        const description = functionName.trim().toUpperCase();       
        if (description === '') {
            setMessage({ text: 'Veuillez remplir le champs du formulaire.', type: 'error' });
            deleteMessage();
            return false;
        } else {
            resetMessages();
            return true;
        }
    };

    // Fonction création d'une fonction
    const handleCreateFunction = async () => {
        if (validationForm()) {
            try {
                await axios.post(`${process.env.REACT_APP_BACKEND_URL}/personFunction`, {
                    functionName,  
                });
    
                // Réinitialisation des champs à vide
                setFunctionName('');
                
                // Affichage du message de succès
                setMessage({ text: 'Insertion réussie', type: 'success' }, () => {
                });
                deleteMessage();
                
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    // Si la fonction existe déjà
                    setMessage({ text: 'La fonction existe déjà.', type: 'error' }, () => {
                    });
                    deleteMessage();
                    
                } else {
                    console.error('Erreur lors de la création', error);
                    setMessage({ text: 'Insertion refusée.', type: 'error' }, () => {
                    });
                    deleteMessage();
                } 
                // Réinitialisation des champs à vide
                setFunctionName('');
            }
        }
    };
    
    useEffect(() => {
        
    }, [message]);

    return (
        <div>
            <HeaderHome />
            <div className="container mt-3 d-flex justify-content-center">
                <div className="card col-4">
                    <div className="card-body">
                        <form className="row">
                            <h1 className="card-title text-center mb-4">Fonction</h1>
                            <div className="form-group col-12">
                                <input
                                    type="text"
                                    id="functionName"
                                    value={functionName}
                                    onFocus={handleFocus}
                                    onChange={(e) => setFunctionName(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Fonction')}
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    placeholder="Nom de la fonction"
                                    required
                                />
                            </div>
                            <div id="error-message" className={`${message.type === 'error' ? 'text-danger' : 'text-success'} mb-3 col-12`}>
                                {message.text}
                            </div>
                            <div className="d-flex justify-content-center col-12">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-valider col-12 mt-3"
                                    onClick={handleCreateFunction}
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
}

export default PersonFonction;
