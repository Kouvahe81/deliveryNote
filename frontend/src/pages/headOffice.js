import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Loupe from '../images/Loupe.png'
import '../styles/category.css'
import { REACT_APP_BACKEND_URL } from "../config";

const HeadOffice = () => {
    const [headOffices, setHeadOffices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showModal, setShowModal] = useState(false);
    const [selectedHeadOffice, setSelectedHeadOffice] = useState(null);
    const [headOfficeName, setHeadOfficeName] = useState('');
    const [headOfficeAddress, setHeadOfficeAddress] = useState('');
    const [headOfficeCity, setHeadOfficeCity] = useState('');
    const [headOfficePostalCode, setHeadOfficePostalCode] = useState('');
    const [headOfficeVATNumber, setHeadOfficeVATNumber] = useState('');
    const [headOfficeRateReduction, setHeadOfficeRateReduction] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    
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

    const listHeadOffices = () => {
        axios.get(`${REACT_APP_BACKEND_URL}/headOffice`)
            .then(response => {
                setHeadOffices(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des maisons mères: ', error);
            });
    };

    const handleDeleteHeadOffice = async (officeHeadID) => {
        // Recherche du produit dans le tableau products
        const headOfficeToDelete = headOffices.find(office => office.headOfficeId === officeHeadID);
        const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer ${headOfficeToDelete.headOfficeName} ?`);

        if (confirmDelete) {
            try {
                await axios.delete(`${REACT_APP_BACKEND_URL}/headOffice/${officeHeadID}`);
                listHeadOffices();
                setMessage({ text: `${headOfficeToDelete.headOfficeName} a été supprimé avec succès.`, type: 'success' });

            } catch (error) {
                console.error("Erreur lors de la suppression de la maison mère:", error);
                setMessage({ text: 'Erreur lors de la suppression de la maison mère.', type: 'error' });
            }
        }
        deleteMessage();
    };

    const handleOpenModal = (headOffice) => {
        setSelectedHeadOffice(headOffice);
        setShowModal(true);
        setHeadOfficeName(headOffice.headOfficeName);
        setHeadOfficeAddress(headOffice.headOfficeAddress);
        setHeadOfficeCity(headOffice.headOfficeCity);
        setHeadOfficePostalCode(headOffice.headOfficePostalCode);
        setHeadOfficeVATNumber(headOffice.headOfficeVATNumber)
        setHeadOfficeRateReduction(headOffice.headOfficeRateReduction)
    };

    const handleCloseModal = () => {
        setSelectedHeadOffice(false);
        setShowModal(null);
        setHeadOfficeName('');
        setHeadOfficeAddress('');
        setHeadOfficeCity('');
        setHeadOfficePostalCode('');
        setHeadOfficeVATNumber('')
        setHeadOfficeRateReduction('')
    };

    const handleUpdateHeadOffice = async () => {
        const confirmUpdate = window.confirm("Êtes-vous sûr de vouloir enregistrer les modifications ?");
        if (confirmUpdate) {
            try {
                await axios.put(`${REACT_APP_BACKEND_URL}/headOffice/${selectedHeadOffice.headOfficeId}`, {
                    headOfficeName : headOfficeName,
                    headOfficeAddress : headOfficeAddress,
                    headOfficeCity : headOfficeCity,
                    headOfficePostalCode : headOfficePostalCode,
                    headOfficeVATNumber : headOfficeVATNumber,
                    headOfficeRateReduction : headOfficeRateReduction
                });
                listHeadOffices();
                setMessage({ text: ` ${headOfficeName} a été mis à jour avec succès.`, type: 'success' });
                handleCloseModal();
            } catch (error) {
                console.error("Erreur lors de la mise à jour de la maison mère :", error);
                setMessage({ text: 'Erreur lors de la mise à jour de la maison mère.', type: 'error' });
            }
        }
        deleteMessage();
    };
    
    const handleSearchTermChange = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
    };

    const filterNonNumericInput = (event) =>{
        const keyCode = event.keyCode || event.which;
        const keyValue = String.fromCharCode(keyCode);
        const numericRegex = /^[0-9.]+$/;
    
        if (!numericRegex.test(keyValue)) {
            event.preventDefault();
        }
    }
    
    useEffect(() => {
        let url = `${REACT_APP_BACKEND_URL}/headOffice`;
        axios.get(url)
            .then(response => {
                let filteredHeadOffices = response.data;
                if (searchTerm.trim() !== '') {
                    filteredHeadOffices = filteredHeadOffices.filter(headOffice =>
                        headOffice.headOfficeName.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setHeadOffices(filteredHeadOffices);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération de la maison mère. ', error);
            });
    }, [searchTerm]);

    const handleFocus = () => {
        setIsFocused(true);
    };

    return (
        <div>
            <HeaderHome/>
            <div id="error-message" className={`mt-5 ${message.type === 'error' ? 'text-danger' : 'text-success'}`}>
                        {message.text}
            </div>
            <div className="container ">
                    <div className="row justify-content-center">
                        <div className="col-md-10">
                            <div className="d-flex justify-content-center align-items-center">
                            <img className="loupe" src={Loupe} alt="Loupe" />
                                <input
                                    type="text"
                                    className="form-control "
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
                                                <th>Adresse</th>
                                                <th>Ville</th>
                                                <th>Code Postal</th>
                                                <th>Numéro TVA</th>
                                                <th>Réduction</th>
                                                <th colSpan="2" className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {headOffices.map((head) => (
                                                <tr key={head.headOfficeId}>
                                                    <td>{head.headOfficeName}</td>
                                                    <td>{head.headOfficeAddress}</td>
                                                    <td>{head.headOfficeCity}</td>
                                                    <td>{head.headOfficePostalCode}</td>
                                                    <td>{head.headOfficeVATNumber}</td>
                                                    <td>{head.headOfficeRateReduction}</td>
                                                    <td>
                                                        <button className="btn btn-warning btn-sm btn-block " onClick={()=>handleOpenModal(head)}>Modifier</button>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-danger btn-sm btn-block" onClick={() => handleDeleteHeadOffice(head.headOfficeId)}>Supprimer</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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
                    <Modal.Title> Siège Social </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedHeadOffice && (
                        <div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="headOfficeName"
                                    value={headOfficeName}
                                    placeholder="Nom"
                                    onFocus={handleFocus}
                                    onChange={(e) => setHeadOfficeName(e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="headOfficeAddress"
                                    value={headOfficeAddress}
                                    onFocus={handleFocus}
                                    onChange={(e) => setHeadOfficeAddress(e.target.value)}
                                    placeholder="Adresse"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id='headOfficeCity'
                                    value={headOfficeCity}
                                    onFocus={handleFocus}
                                    onChange={(e) => setHeadOfficeCity(e.target.value)}
                                    placeholder="Ville"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id='headOfficePostalCode'
                                    value={headOfficePostalCode}
                                    onFocus={handleFocus}
                                    onChange={(e) => setHeadOfficePostalCode(e.target.value)}
                                    onKeyPress={filterNonNumericInput}
                                    placeholder="Code Postal"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id='headOfficeVATNumber'
                                    value={headOfficeVATNumber}
                                    onFocus={handleFocus}
                                    onChange={(e) => setHeadOfficeVATNumber(e.target.value)}
                                    onKeyPress={filterNonNumericInput}
                                    placeholder="Numéro TVA"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="headOfficeRateReduction"
                                    value={headOfficeRateReduction}
                                    onFocus={handleFocus}
                                    onChange={(e) => setHeadOfficeRateReduction(e.target.value)}
                                    placeholder="Réduction"
                                    required
                                />
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-center">
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Fermer
                    </Button>
                    <Button className="d-flex justify-content-center" variant="success" onClick={handleUpdateHeadOffice}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default HeadOffice;
