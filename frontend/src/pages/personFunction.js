import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Loupe from '../images/Loupe.png';
import '../styles/category.css'
    
    const PersonFunction = () => {
        const [personFunction, setPersonFunction] = useState([]);
        const [searchTerm, setSearchTerm] = useState('');
        const [message, setMessage] = useState({ text: '', type: '' });
        const [showModal, setShowModal] = useState(false);
        const [selectedPersonFunction, setSelectedPersonFunction] = useState(null);
        const [functionName, setFunctionName] = useState('');
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
            const nameValue = functionName.trim().toUpperCase();
                        
            if (nameValue === '') {
                setMessage({ text: 'Veuillez remplir tous les champs SVP.', type: 'error' });
                deleteMessage();
                return false;
            } else {
                resetMessages();
                return true;
            }
        };
    
        const handleDeleteFunction = async (functionId) => {
            const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette fonction ?");
          
            if (confirmDelete) {
              try {
                await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/personFunction/${functionId}`);
                
                listPersonFunctions();
                setMessage({ text: 'Cette fonction a été supprimée avec succès.', type: 'success' });
              } catch (error) {
                console.error("Erreur lors de la suppression de la fonction :", error);
                await setMessage({ text: 'Erreur lors de la suppression de la fonction.', type: 'error' });
              }
            }
            deleteMessage();
          };
          
        const handleOpenModal = (persFunction) => {
            setSelectedPersonFunction(persFunction);
            setShowModal(true);
            setFunctionName(persFunction.functionName);
        };
    
        const handleCloseModal = () => {
            setShowModal(false);
            setFunctionName('')
        };
    
        const handleUpdateFunction = async () => {
            const isValid = validationForm();
    
            if (!isValid) {
                setMessage({ text: 'Veuillez remplir les champs', type: 'error' });
                deleteMessage();
                return;
            }
            const confirmUpdate = window.confirm("Êtes-vous sûr de vouloir enregistrer les modifications ?");
        
            if (confirmUpdate) {
                try {
                    await axios.put(`${process.env.REACT_APP_BACKEND_URL}/personFunction/${selectedPersonFunction.functionId}`, {
                        functionName,
                    });
                    listPersonFunctions();
                    setMessage({ text: `${functionName} a été mis à jour avec succès.`, type: 'success' });
                    handleCloseModal();
                } catch (error) {
                    console.error("Erreur lors de la mise à jour de la fonction :", error);
                    setMessage({ text: 'Erreur lors de la mise à jour de la fonction.', type: 'error' });
                }
            }
            deleteMessage();
        };
    
        const handleSearchTermChange = (event) => {
            const term = event.target.value;
            setSearchTerm(term);
        };
    
        const listPersonFunctions = async() => {
            await axios.get(`${process.env.REACT_APP_BACKEND_URL}/personFunction`)
                .then(response => {
                    setPersonFunction(response.data);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des fonctions: ', error);
                });
        };
        useEffect(() => {
            listPersonFunctions();
        }, []);
    
        useEffect(() => {
            let url = `${process.env.REACT_APP_BACKEND_URL}/personFunction`;
            axios.get(url)
                .then(response => {
                    let filteredpersonFunction = response.data;
                    if (searchTerm.trim() !== '') {
                        filteredpersonFunction = filteredpersonFunction.filter(personFunction =>
                            personFunction.functionName.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                    }
                    setPersonFunction(filteredpersonFunction);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des fonctions : ', error);
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
                                            <th colSpan="2" className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {personFunction.map((persFunction) => (
                                            <tr key={persFunction.functionId}>
                                                <td>{persFunction.functionName}</td>
                                                <td>
                                                    <button className="btn btn-warning" onClick={() => handleOpenModal(persFunction)}>Modifier</button>
                                                </td>
                                                <td>
                                                    <button className="btn btn-danger" onClick={() => {handleDeleteFunction(persFunction.functionId);}}>Supprimer</button>
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
                        <Modal.Title> Fonction </Modal.Title>
                    </Modal.Header>
                                    <Modal.Body>
                        {selectedPersonFunction && (
                            <div>
                                {message.text && (
                                    <div className={`d-flex justify-content-center alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                                        {message.text}
                                    </div>
                                )}
                                <div className="form-group mb-3">
                                    <input
                                        className={`form-control ${isFocused ? 'focused' : ''}`}
                                        id="functionName"
                                        placeholder="Nom"
                                        value={functionName}
                                        onFocus={handleFocus}
                                        onChange={(e) => setFunctionName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="d-flex justify-content-center">
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Fermer
                        </Button>
                        <Button className="d-flex justify-content-center" variant="success" onClick={handleUpdateFunction}>
                            Enregistrer
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    };
    
export default PersonFunction;
    