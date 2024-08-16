import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/createTemplate.css';
import { REACT_APP_BACKEND_URL } from "../config";

const CreatePerson = () => {
    const [isFocused, setIsFocused] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [personFirstName, setPersonFirstName] = useState('');
    const [personLastName, setPersonLastName] = useState('');
    const [personEmail, setPersonEmail] = useState('');
    const [functionId, setFunctionId] = useState('');
    const [function_id, setFunction_id] = useState([]);

    // Fonction rendu d'un champ
    const handleBlur = (event, field) => {
        const value = event.target.value.trim();
        if (value === '') {
            setMessage({ text: `${field} est obligatoire.`, type: 'error' });
            deleteMessage();
        } else {
            resetMessages();
        }
        // Vérification de l'e-mail lorsque l'utilisateur quitte le champ
        if (field === 'E-mail') {
            validateEmail(value);
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

    const validateEmail = (email) => {
        const regularExpression = /^(([^<>()[]\.,;:\s@]+(\.[^<>()[]\.,;:\s@]+)*)|(.+))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;
        const isValid = regularExpression.test(email);
        if (!isValid) {
            setMessage({ text: 'Adresse e-mail invalide.', type: 'error' });
        } else {
            resetMessages();
        }
        return isValid;
    };

    useEffect(() => {
        // Charger les fonctions disponibles lors du chargement du composant
        fetchFunction();
    }, []);

    // Fonction pour charger les fonctions disponibles depuis le serveur
    const fetchFunction = async () => {
        try {
            const response = await axios.get(`${REACT_APP_BACKEND_URL}/personFunction`);
            setFunction_id(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des fonctions:', error);
        }
    };

    // Fonction de validation globale du formulaire
    const validationForm = () => {
        const firstName = personFirstName.trim().toUpperCase();
        const lastName = personLastName.trim().toUpperCase();
        const email = personEmail.trim().toUpperCase();
        const typeFunction = functionId;

        if (firstName === '' || lastName === '' || email === '' || typeFunction === '') {
            setMessage({ text: 'Veuillez remplir tous les champs du formulaire.', type: 'error' });
            deleteMessage();
            return false;
        } else {
            // Validation de l'email
            const isEmailValid = validateEmail(email);
            if (!isEmailValid) {
                setMessage({ text: "Adresse Mail invalide.", type: 'error' });
                deleteMessage();
                return false;
            }

            // Tous les champs sont remplis et l'email est valide
            resetMessages();
            return true;
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    // Fonction création d'un produit
    const handleCreatePerson = async () => {
        if (validationForm()) {
            try {
                await axios.post(`${REACT_APP_BACKEND_URL}/person`, {
                    personFirstName,
                    personLastName,
                    personEmail,
                    functionId
                });

                // Réinitialisation des champs à vide
                setPersonFirstName('');
                setPersonLastName('');
                setPersonEmail('');
                setFunctionId('');

                // Affichage du message de succès
                setMessage({ text: 'Insertion réussie', type: 'success' });

                // Suppression du message 
                deleteMessage();

            } catch (error) {
                if (error.response && error.response.status === 409) {
                    // Si l'utilisateur existe déjà
                    setMessage({ text: 'L\'utilisateur existe déjà.', type: 'error' });
                    // Suppression du message 
                    deleteMessage();

                } else if (error.response && error.response.status === 400) {
                    // Si les champs n'ont pas le bon type
                    setMessage({ text: 'Assurez-vous que les champs ont le bon type.', type: 'error' });
                } else {
                    // Autres erreurs
                    console.error('Erreur lors de la création', error);
                    setMessage({ text: 'Insertion refusée.', type: 'error' });
                }

                // Réinitialisation des champs à vide
                setPersonFirstName('');
                setPersonLastName('');
                setPersonEmail('');
                setFunctionId('');
            }
        }
    };

    return (
        <div>
            <HeaderHome />
            <div className="container mt-3 d-flex justify-content-center">
                <div className="card col-4">
                    <div className="card-body">
                        <form>
                            <h1 className="card-title text-center mb-4">Profil</h1>
                            <div className="form-group mb-3">
                                <input
                                    type="text"
                                    id="personFirstName"
                                    value={personFirstName}
                                    onChange={(e) => setPersonFirstName(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Prénom')}
                                    onFocus={handleFocus}
                                    className="form-control"
                                    placeholder="Prénom"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    type="text"
                                    id="personLastName"
                                    value={personLastName}
                                    onChange={(e) => setPersonLastName(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Nom')}
                                    onFocus={handleFocus}
                                    className="form-control"
                                    placeholder="Nom"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    type="email"
                                    id="personEmail"
                                    value={personEmail}
                                    onChange={(e) => setPersonEmail(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'E-mail')}
                                    onFocus={handleFocus}
                                    className="form-control"
                                    placeholder="e-mail"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <select
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="personFunction"
                                    value={functionId}
                                    onChange={(e) => setFunctionId(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Fonction')}
                                    onFocus={handleFocus}
                                    required
                                >
                                    <option value="">Sélectionner la fonction</option>
                                    {function_id.map(func => (
                                        <option key={func.functionId} value={func.functionId}>{func.functionName}</option>
                                    ))}
                                   
                                </select>
                            </div>
                            <div id="error-message" className={`${message.type === 'error' ? 'text-danger' : 'text-success'} mb-3 col-12`}>
                                {message.text}
                            </div>
                            <div className="mb-3 row">
                                <div className="col-sm-12 text-center">
                                    <button
                                        type="button"
                                        className="btn btn-primary col-12 mt-3"
                                        onClick={handleCreatePerson}
                                    >
                                        Valider
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default CreatePerson;
