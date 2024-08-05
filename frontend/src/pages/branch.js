import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Loupe from '../images/Loupe.png';
import '../styles/category.css'
import { REACT_APP_BACKEND_URL } from "../config";

const Branch = () => {
    const [branches, setBranches] = useState([]);
    const [headOffice, setHeadOffice] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showModal, setShowModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [branchCode, setBranchCode] = useState('');
    const [branchName, setBranchName] = useState('');
    const [branchAddress, setBranchAddress] = useState('');
    const [branchCity, setBranchCity] = useState('');
    const [branchPostalCode, setBranchPostalCode] = useState('');
    const [headOfficeId, setHeadOfficeId] = useState('');
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

    const listBranch = () => {
        axios.get(`${REACT_APP_BACKEND_URL}/branch`)
            .then(response => {
                setBranches(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des succursales: ', error);
            });
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

    const handleDeleteBranch = async (branchID) => {
        const branchToDelete = branches.find(branch => branch.branchId === branchID);
        const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer ${branchToDelete.branchName} ?`);
        if (confirmDelete) {
            try {
                await axios.delete(`${REACT_APP_BACKEND_URL}/branch/${branchID}`);
                listBranch();
                setMessage({ text: `${branchToDelete.branchName} a été supprimé avec succès.`, type: 'success' });
            } catch (error) {
                console.error("Erreur lors de la suppression de la succursale:", error);
                setMessage({ text: 'Erreur lors de la suppression de la succursale.', type: 'error' });
            }
        }
        deleteMessage();
    };

    const handleOpenModal = (branch) => {
        setSelectedBranch(branch);
        setShowModal(true);
        setBranchCode(branch.branchCode);
        setBranchName(branch.branchName);
        setBranchAddress(branch.branchAddress);
        setBranchCity(branch.branchCity);
        setBranchPostalCode(branch.branchPostalCode);
        setHeadOfficeId(branch.headOfficeId);
    };

    const handleCloseModal = () => {
        setSelectedBranch(false);
        setShowModal(null);
        setBranchCode('');
        setBranchName('');
        setBranchAddress('');
        setBranchCity('');
        setBranchPostalCode('');
        setHeadOfficeId('');
    };

    const handleUpdateBranch = async () => {
        const confirmUpdate = window.confirm("Êtes-vous sûr de vouloir enregistrer les modifications ?");
        if (confirmUpdate) {
            try {
                await axios.put(`${REACT_APP_BACKEND_URL}/branch/${selectedBranch.branchId}`, {
                    branchName,
                    branchAddress,
                    branchCity,
                    branchPostalCode,
                    branchCode,
                    headOfficeId,
                });
                listBranch();
                setMessage({ text: `${branchName} a été mis à jour avec succès.`, type: 'success' });
                handleCloseModal();
            } catch (error) {
                console.error("Erreur lors de la mise à jour de la succursale :", error);
                setMessage({ text: 'Erreur lors de la mise à jour de la succursale.', type: 'error' });
            }
        }
        deleteMessage();
    };
    
    const handleSearchTermChange = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
    };

    
    useEffect(() => {
        let url = `${REACT_APP_BACKEND_URL}/branch`;
        axios.get(url)
            .then(response => {
                let filteredBranches = response.data;
                if (searchTerm.trim() !== '') {
                    filteredBranches = filteredBranches.filter(branch =>
                        branch.branchName.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setBranches(filteredBranches);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération de la succursale : ', error);
            });
        listHeadOffices()
    }, [searchTerm]);

    
    return (
        <div>
            <HeaderHome/>
            <div id="error-message" className= {`mt-5 ${message.type === 'error' ? 'text-danger' : 'text-success'}`}>
                {message.text}
            </div>
            <div className="container">
                <div className="row justify-content-center">
                        <div className="col-md-10">
                            <div className="d-flex justify-content-center align-items-center">
                            <img className="loupe" src={Loupe} alt="Loupe" />
                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    placeholder="..."
                                    value={searchTerm}
                                    onChange={handleSearchTermChange}
                                />
                            </div>
                                <table className="table table-responsive">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Nom</th>
                                            <th>Adresse</th>
                                            <th>Ville</th>
                                            <th>Code Postal</th>
                                            <th>Lié à </th>
                                            <th colSpan="2" className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {branches.map((branch) => (
                                            <tr key={branch.branchId}>
                                                <td>{branch.branchCode}</td>
                                                <td>{branch.branchName}</td>
                                                <td>{branch.branchAddress}</td>
                                                <td>{branch.branchCity}</td>
                                                <td>{branch.branchPostalCode}</td>
                                                <td>{branch.headOfficeName}</td>
                                                <td>
                                                    <button className="btn btn-warning mr-2" onClick={() => handleOpenModal(branch)}>Modifier</button>
                                                </td>
                                                <td>
                                                    <button className="btn btn-danger" onClick={() => handleDeleteBranch(branch.branchId)}>Supprimer</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                        </div>
                    </div>
            </div>
            <Modal 
                show={showModal} 
                onHide={handleCloseModal} 
                dialogClassName="dialog-modal"
            >
                <Modal.Header className="d-flex justify-content-center">
                    <Modal.Title> Succursale </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedBranch && (
                        <div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id='branchCode'
                                    value={branchCode}
                                    onFocus={handleFocus}
                                    onChange={(e) => setBranchCode(e.target.value)}
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
                                    placeholder="Nom"
                                    onFocus={handleFocus}
                                    onChange={(e) => setBranchName(e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    type="text"
                                    id="producbranchAdress"
                                    value={branchAddress}
                                    placeholder="Adresse"
                                    onFocus={handleFocus}
                                    onChange={(e) => setBranchAddress(e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id='branchCity'
                                    value={branchCity}
                                    onFocus={handleFocus}
                                    onChange={(e) => setBranchCity(e.target.value)}
                                    placeholder="Ville"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id='branchPostalCode'
                                    value={branchPostalCode}
                                    onFocus={handleFocus}
                                    onKeyPress={filterNonNumericInput}
                                    onChange={(e) => setBranchPostalCode(e.target.value)}
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
                                        <option value='' disabled> Sélectionnez la maison mère </option>
                                        {headOffice.map((office) => (
                                            <option key={office.headOfficeId} value={office.headOfficeId}>
                                                {office.headOfficeName}
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
                    <Button className="d-flex justify-content-center" variant="success" onClick={handleUpdateBranch}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Branch;

