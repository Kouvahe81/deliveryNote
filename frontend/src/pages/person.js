import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loupe from '../images/Loupe.png';
import '../styles/category.css'
import { REACT_APP_BACKEND_URL } from "../config";

const Person = () => {
    const [persons, setPersons] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showModal, setShowModal] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [personFirstName, setPersonFirstName] = useState('');
    const [personLastName, setPersonLastName] = useState('');
    const [personEmail, setPersonEmail] = useState('');
    const [functionId, setFunctionId] = useState('');
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

    const listPersons = () => {
        axios.get(`${REACT_APP_BACKEND_URL}/person`)
            .then(response => {
                setPersons(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des utilisateurs: ', error);
            });
    };

    const handleDeletePerson = async (personID) => {
        const personToDelete = persons.find(user => user.personId === personID);
        const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer ${personToDelete.personFirstName} ${personToDelete.personLastName} ?`);
        if (confirmDelete) {
            try {
                await axios.delete(`${REACT_APP_BACKEND_URL}/person/${personID}`);
                listPersons();
                setMessage({ text: `${personToDelete.personFirstName} ${personToDelete.personLastName} a été supprimé avec succès.`, type: 'success' });
            } catch (error) {
                console.error("Erreur lors de la suppression de l'utilisateur :", error);
                setMessage({ text: 'Erreur lors de la suppression de l\'utilisateur.', type: 'error' });
            }
        }
        deleteMessage();
    };

    const handleOpenModal = (person) => {
        setSelectedPerson(person);
        setShowModal(true);
        setPersonFirstName(person.personFirstName);
        setPersonLastName(person.personLastName);
        setPersonEmail(person.personEmail);
        setFunctionId(person.functionId);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPerson(null);
        setPersonFirstName('');
        setPersonLastName('');
        setPersonEmail('');
        setFunctionId('');
    };

    const handleUpdatePerson = async () => {
        const confirmUpdate = window.confirm("Êtes-vous sûr de vouloir enregistrer les modifications ?");
        if (confirmUpdate) {
            try {
                await axios.put(`${REACT_APP_BACKEND_URL}/person/${selectedPerson.personId}`, {
                    personFirstName,
                    personLastName,
                    personEmail,
                    functionId
                });
                
                listPersons();
                setMessage({ text: ` ${personLastName} a été mis à jour avec succès.`, type: 'success' });
                handleCloseModal();
            } catch (error) {
                console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
                setMessage({ text: 'Erreur lors de la mise à jour de l\'utilisateur.', type: 'error' });
            }
        }
        deleteMessage();
    };
    
    const handleSearchTermChange = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
    };

    useEffect(() => {
        let url = `${REACT_APP_BACKEND_URL}/person`;
        axios.get(url)
            .then(response => {
                let filteredPersons = response.data;
                if (searchTerm.trim() !== '') {
                    filteredPersons = filteredPersons.filter(person =>
                        person.personFirstName.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setPersons(filteredPersons);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des utilisateurs : ', error);
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
                            <div className="mt-4">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Prénom</th>
                                            <th>Nom</th>
                                            <th>email</th>
                                            <th>Fonction</th>
                                            <th colSpan="2" className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {persons.map((user) => (
                                            <tr key={user.personId}>
                                                <td>{user.personFirstName}</td>
                                                <td>{user.personLastName}</td>
                                                <td>{user.personEmail}</td>
                                                <td>{user.functionName}</td>
                                                <td>
                                                    <button className="btn btn-warning" onClick={() => handleOpenModal(user)}>Modifier</button>
                                                </td>
                                                <td>
                                                    <button className="btn btn-danger" onClick={() => handleDeletePerson(user.personId)}>Supprimer</button>
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
            <Modal className="modalFlex" 
                show={showModal} 
                onHide={handleCloseModal}
                dialogClassName="dialog-modal"
            >
                <Modal.Header className="d-flex justify-content-center">
                    <Modal.Title> Profil </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPerson && (
                        <div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="personFirstName"
                                    value={personFirstName}
                                    placeholder="Prénom"
                                    onFocus={handleFocus}
                                    onChange={(e) => setPersonFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="personLastName"
                                    value={personLastName}
                                    onFocus={handleFocus}
                                    onChange={(e) => setPersonLastName(e.target.value)}
                                    placeholder="Nom"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id='personEmail'
                                    value={personEmail}
                                    onFocus={handleFocus}
                                    onChange={(e) => setPersonEmail(e.target.value)}
                                    placeholder="e-mail"
                                    required
                                />         
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id='personFunction'
                                    value={functionId}
                                    onFocus={handleFocus}
                                    onChange={(e) => setFunctionId(e.target.value)}
                                    placeholder="Fonction"
                                    required
                                    disabled
                                />         
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-center">
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Fermer
                    </Button>
                    <Button className="d-flex justify-content-center" variant="success" onClick={handleUpdatePerson}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );    
};

export default Person;
