import React, { useState } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import '../styles/createTemplate.css';
import { REACT_APP_BACKEND_URL } from "../config";

const CreateHeadOffice = () => {
    const [headOfficeName, setHeadOfficeName] = useState('');
    const [headOfficeAddress, setHeadOfficeAddress] = useState('');
    const [headOfficeCity, setHeadOfficeCity] = useState('');
    const [headOfficePostalCode, setHeadOfficePostalCode] = useState('');
    const [headOfficeVATNumber, setHeadOfficeVATNumber] = useState('');
    const [headOfficeRateReduction, setHeadOfficeRateReduction] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isFocused, setIsFocused] = useState(false);

    const handleBlur = (event, field) => {
        const value = event.target.value.trim();
        if (value === '') {
            setMessage({ text: `${field} est obligatoire.`, type: 'error' });
            deleteMessage();
        } else {
            resetMessages();
        }
    };

    const filterNonNumericInput = (event) =>{
        const keyCode = event.keyCode || event.which;
        const keyValue = String.fromCharCode(keyCode);
        const numericRegex = /^[0-9.]+$/;
    
        if (!numericRegex.test(keyValue)) {
            event.preventDefault();
        }
    }

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
        const Name = headOfficeName.trim();
        const Address = headOfficeAddress.trim();
        const City = headOfficeCity.trim();
        const PostalCode = headOfficePostalCode.trim();
        const VATNumber = headOfficeVATNumber.trim();
        const RateReduction = headOfficeRateReduction.trim();

        if (Name === '' || Address === '' || City === '' || PostalCode === '' || VATNumber === '' || RateReduction === '') {
            setMessage({ text: 'Veuillez remplir tous les champs du formulaire.', type: 'error' });
            deleteMessage();
            return false;
        } else {
            resetMessages();
            return true;
        }
    };
    
    const handleCreateHeadOffice = async () => {
        if (validationForm()) {
            try {
                await axios.post(`${REACT_APP_BACKEND_URL}/headOffice`, {
                    headOfficeName: headOfficeName,
                    headOfficeAddress: headOfficeAddress,
                    headOfficeCity: headOfficeCity,
                    headOfficePostalCode: headOfficePostalCode,
                    headOfficeVATNumber: headOfficeVATNumber,
                    headOfficeRateReduction: headOfficeRateReduction
                });
                setMessage({ text: 'Insertion réussie', type: 'success' });
                deleteMessage();
                
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    setMessage({ text: 'La maison mère existe déjà.', type: 'error' });
                } else if (error.response && error.response.status === 400) {
                    setMessage({ text: 'Assurez-vous que les champs ont le bon type.', type: 'error' });
                } else {
                    console.error('Erreur lors de la création', error);
                    setMessage({ text: 'Insertion refusée.', type: 'error' });
                }
            } finally {
                setHeadOfficeName('');
                setHeadOfficeAddress('');
                setHeadOfficeCity('');
                setHeadOfficePostalCode('');
                setHeadOfficeVATNumber('');
                setHeadOfficeRateReduction('');
                deleteMessage();
            }
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    return (
        <div>
            <HeaderHome/>
            <div className="container mt-3 d-flex justify-content-center">
                <div className="card col-8">
                    <div className="card-body">
                        <form className="row">
                            <h1 className="card-title text-center"> Siège Social </h1>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="text"
                                    id="headOfficeName"
                                    value={headOfficeName}
                                    onChange={(e) => setHeadOfficeName(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Nom')}
                                    onFocus={handleFocus}
                                    placeholder="Nom"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="text"
                                    id="headOfficeAddress"
                                    value={headOfficeAddress}
                                    onChange={(e) => setHeadOfficeAddress(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Adresse')}
                                    onFocus={handleFocus}
                                    placeholder="Adresse"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="text"
                                    id="headOfficeCity"
                                    value={headOfficeCity}
                                    onChange={(e) => setHeadOfficeCity(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Ville')}
                                    onFocus={handleFocus}
                                    placeholder="Ville"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="text"
                                    id="headOfficePostalCode"
                                    value={headOfficePostalCode}
                                    onChange={(e) => setHeadOfficePostalCode(e.target.value)}
                                    onKeyPress={filterNonNumericInput}
                                    onBlur={(e) => handleBlur(e, 'Code Postal')}
                                    onFocus={handleFocus}
                                    placeholder="Code Postal"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="text"
                                    id="headOfficeVATNumber"
                                    value={headOfficeVATNumber}
                                    onChange={(e) => setHeadOfficeVATNumber(e.target.value)}
                                    onKeyPress={filterNonNumericInput}
                                    onBlur={(e) => handleBlur(e, 'Numéro TVA')}
                                    onFocus={handleFocus}
                                    placeholder="Numéro TVA"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="text"
                                    id="headOfficeRateReduction"
                                    value={headOfficeRateReduction}
                                    onChange={(e) => setHeadOfficeRateReduction(e.target.value)}
                                    onKeyPress={filterNonNumericInput}
                                    onBlur={(e) => handleBlur(e, 'Réduction')}
                                    onFocus={handleFocus}
                                    placeholder="Réduction"
                                    required
                                />
                            </div>
                            <div id="error-message" className={`${message.type === 'error' ? 'text-danger' : 'text-success'} col-12`}>
                                {message.text}
                            </div>
                            <div className="d-flex justify-content-center col-12">
                                <button
                                    type="button"
                                    className="btn btn-primary col-12 mt-3"
                                    onClick={handleCreateHeadOffice}
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

export default CreateHeadOffice;
