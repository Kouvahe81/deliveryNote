import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import '../styles/createTemplate.css';
import { REACT_APP_BACKEND_URL } from "../config";

const CreateBranch = () => {
    const [branchCode, setBranchCode] = useState('');
    const [branchName, setBranchName] = useState('');
    const [branchAddress, setBranchAddress] = useState('');
    const [branchCity, setBranchCity] = useState('');
    const [branchPostalCode, setBranchPostalCode] = useState(''); 
    const [isFocused, setIsFocused] = useState(false); 
    const [headOffice, setHeadOffice] = useState([]);
    const [headOfficeId, setHeadOfficeId] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    
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
        const Code = branchCode;
        const Name = branchName.trim().toUpperCase();
        const Adress = branchAddress.trim().toUpperCase();
        const City = branchCity.trim();
        const PostalCode = branchPostalCode;
        const Office = headOfficeId
        
        if (Code === '' || Name === '' || Adress === '' || City === '' || PostalCode ===''||Office ==='') {
            setMessage({ text: 'Veuillez remplir tous les champs du formulaire.', type: 'error' });
            deleteMessage();
            return false;
        } else {
            resetMessages();
            return true;
        }
    };

    const listHeadOffices = () => {
        axios.get(`${REACT_APP_BACKEND_URL}/headOffice`)
            .then(response => {
                setHeadOffice(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des maisons mère: ', error);
            });
    };
	    
    const handleCreateBranch = async () => {
        if (validationForm()) {
            try {
                await axios.post(`${REACT_APP_BACKEND_URL}/branch`, {
                   branchName,
                    branchAddress,
                    branchCity,
                    branchPostalCode,
                    headOfficeId,
                    branchCode
                });
                setMessage({ text: 'Insertion réussie', type: 'success' });
                deleteMessage();
                
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    setMessage({ text: 'La succursale existe déjà.', type: 'error' });
                } else if (error.response && error.response.status === 400) {
                    setMessage({ text: 'Assurez-vous que les champs ont le bon type.', type: 'error' });
                } else {
                    console.error('Erreur lors de la création', error);
                    setMessage({ text: 'Insertion refusée.', type: 'error' });
                }
            } finally {
                setBranchCode('');
                setBranchName('');
                setBranchAddress('');
                setBranchCity('');
                setBranchPostalCode('');
                setHeadOfficeId('');
                deleteMessage();
            }
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };
    
    useEffect(() => {
        listHeadOffices()
    }, []);

    return (
        <div>
            <HeaderHome/>
            <div className="container mt-3 d-flex justify-content-center">
                <div className="card col-4">
                    <div className="card-body">
                        <form className="row">
                            <h1 className="card-title text-center"> Succursale </h1>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="text"
                                    id="branchCode"
                                    value={branchCode}
                                    onChange={(e) => setBranchCode(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Le code')}
                                    onFocus={handleFocus}
                                    placeholder="Code"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="text"
                                    id="branchName"
                                    value={branchName}
                                    onChange={(e) => setBranchName(e.target.value)}
                                    onBlur={(e) => handleBlur(e, 'Le nom')}
                                    onFocus={handleFocus}
                                    placeholder="Nom"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="text"
                                    id="branchAddress"
                                    value={branchAddress}
                                    onChange={(e) => setBranchAddress(e.target.value)}
                                    onBlur={(e) => handleBlur(e, "L'adresse")}
                                    onFocus={handleFocus}
                                    placeholder="Adresse"
                                    required
                                 />
                            </div>
                            <div className="form-group mb-3">      
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id='branchCity'
                                    value={branchCity}
                                    onChange={(e) => setBranchCity(e.target.value)}
                                    onBlur={(e) => { handleBlur(e, 'La ville') }}
                                    onFocus={handleFocus}
                                    placeholder="Ville"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3 ">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="number"
                                    id="branchPostalCode"
                                    value={branchPostalCode}
                                    onChange={(e) => setBranchPostalCode(e.target.value)}
                                    onKeyPress={filterNonNumericInput}    
                                    onBlur={(e) => handleBlur(e, 'Le code postal')}
                                    onFocus={handleFocus}
                                    placeholder="Code Postal"
                                    required
                                 />
                            </div>
                            <div className="form-group mb-3">
                                    <select
                                        className={`form-control ${isFocused ? 'focused' : ''}`}
                                        id='headOfficeId'
                                        value={headOfficeId}
                                        onFocus={handleFocus}
                                        onChange={(e) => setHeadOfficeId(e.target.value)}
                                        required
                                    >
                                        <option value='' > Sélectionnez la maison mère </option>
                                        {headOffice.map((office) => (
                                            <option key={office.headOfficeId} value={office.headOfficeId}>
                                                {office.headOfficeName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            <div id="error-message" className={`${message.type === 'error' ? 'text-danger' : 'text-success'} col-12`}>
                                {message.text}
                            </div>
                            <div className="d-flex justify-content-center col-12">
                                <button
                                    type="button"
                                    className="btn btn-primary  col-12 mt-3"
                                    onClick={handleCreateBranch}
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

export default CreateBranch;
