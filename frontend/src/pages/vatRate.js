import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../styles/category.css';
import { REACT_APP_BACKEND_URL } from "../config";

const VatRate = () => {
    const [rates, setRates] = useState([]);
    const [searchTerm] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showModal, setShowModal] = useState(false);
    const [selectedVatRate, setSelectedVatRate] = useState(null);
    const [vatRateTaxe, setVatRateTaxe] = useState('');
    const [vatRateStartDate, setVatRateStartDate] = useState(new Date());
    const [vatRateEndDate, setVatRateEndDate] = useState(new Date());
    //const currentDate = new Date().toISOString().split('T')[0];
    const [isFocused, setIsFocused] = useState(false);

    const deleteMessage = useCallback(() => {
        setTimeout(() => {
            resetMessages();
        }, 5000);
    }, []);

    const resetMessages = () => {
        setMessage({
            text: '',
            type: ''
        });
    };

    const validationForm = () => {
        if (vatRateTaxe === '' || vatRateStartDate === '' || vatRateEndDate === '') {
            setMessage({ text: 'Veuillez remplir tous les champs SVP.', type: 'error' });
            deleteMessage();
            return false;
        } else {
            resetMessages();
            return true;
        }
    };

    const listVatRates = useCallback(() => {
        axios.get(`${REACT_APP_BACKEND_URL}/vatRate`)
            .then(response => {
                setRates(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des taux tva: ', error);
                setMessage({ text: 'Erreur lors de la récupération des taux tva.', type: 'error' });
                deleteMessage();
            });
    }, [deleteMessage]);

    const handleDeleteVatRate = async (vatRateId) => {
        const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette TVA ?");
        if (confirmDelete) {
            try {
                await axios.delete(`${REACT_APP_BACKEND_URL}/vatRate/${vatRateId}`);
                listVatRates();
                setMessage({ text: 'Le taux TVA a été supprimé avec succès.', type: 'success' });
            } catch (error) {
                console.error("Erreur lors de la suppression du taux TVA :", error);
                setMessage({ text: 'Erreur lors de la suppression du taux TVA.', type: 'error' });
            }
            deleteMessage();
        }
    };

    const handleOpenModal = (vatRate) => {
        setSelectedVatRate(vatRate);
        setShowModal(true);
        setVatRateTaxe(vatRate.vatRateTaxe);
        // Convertir la date de début et la date de fin
        const startDate = new Date(vatRate.vatRateStartDate);
        startDate.setDate(startDate.getDate() + 1); 
        setVatRateStartDate(startDate);

        const endDate = new Date(vatRate.vatRateEndDate);
        endDate.setDate(endDate.getDate() + 1); 
        setVatRateEndDate(endDate);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedVatRate(null);
        setVatRateTaxe('');
        setVatRateStartDate(new Date());
        setVatRateEndDate(new Date());
    };

    const handleUpdateVatRate = async () => {
        const isValid = validationForm();

        if (!isValid) {
            setMessage({ text: 'Veuillez remplir tous les champs.', type: 'error' });
            deleteMessage();
            return;
        }

        const confirmUpdate = window.confirm("Êtes-vous sûr de vouloir enregistrer les modifications ?");
        if (confirmUpdate) {
            try {
                await axios.put(`${REACT_APP_BACKEND_URL}/vatRate/${selectedVatRate.vatRateId}`, {
                    vatRateTaxe,
                    vatRateStartDate: vatRateStartDate.toISOString().split('T')[0],
                    vatRateEndDate: vatRateEndDate.toISOString().split('T')[0]
                });
                listVatRates();
                setMessage({ text: `${vatRateTaxe} a été mis à jour avec succès.`, type: 'success' });
                handleCloseModal();
            } catch (error) {
                console.error("Erreur lors de la mise à jour du taux TVA :", error);
                setMessage({ text: 'Erreur lors de la mise à jour du taux TVA.', type: 'error' });
            }
            deleteMessage();
        }
    };

    useEffect(() => {
        listVatRates();
    }, [listVatRates]);

    useEffect(() => {
        let url = `${REACT_APP_BACKEND_URL}/vatRate`;
        axios.get(url)
            .then(response => {
                let filteredVatRates = response.data;
                if (searchTerm !== '') {
                    filteredVatRates = filteredVatRates.filter(vatRate =>
                        vatRate.vatRateName.includes(searchTerm)
                    );
                }
                setRates(filteredVatRates);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des taux TVAs : ', error);
                setMessage({ text: 'Erreur lors de la récupération des taux TVAs.', type: 'error' });
                deleteMessage();
            });
    }, [searchTerm, deleteMessage]);

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
                            <div className="table mt-3">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Taux</th>
                                            <th>Début</th>
                                            <th>Fin</th>
                                            <th colSpan="2" className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rates.map((vatRate) => (
                                            <tr key={vatRate.vatRateId}>
                                                <td>{vatRate.vatRateTaxe}%</td>
                                                <td>{new Date(vatRate.vatRateStartDate).toLocaleDateString('fr-FR')}</td>
                                                <td>{new Date(vatRate.vatRateEndDate).toLocaleDateString('fr-FR')}</td>
                                                <td>
                                                    <button className="btn btn-warning" onClick={() => handleOpenModal(vatRate)}>Modifier</button>
                                                </td>
                                                <td>
                                                    <button className="btn btn-danger" onClick={() => { handleDeleteVatRate(vatRate.vatRateId) }}>Supprimer</button>
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
                    <Modal.Title> Taux TVA </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedVatRate && (
                        <div>
                            {message.text && (
                                <div className={`d-flex justify-content-center alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                                    {message.text}
                                </div>
                            )}
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="vatRateTaxe"
                                    placeholder="Taux"
                                    value={vatRateTaxe}
                                    onFocus={handleFocus}
                                    onChange={(e) => setVatRateTaxe(e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="vatRateStartDate"
                                    type='date'
                                    placeholder="Date début"
                                    value={vatRateStartDate.toISOString().split('T')[0]}
                                    onFocus={handleFocus}
                                    onChange={(e) => setVatRateStartDate(new Date(e.target.value))}
                                    />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    className={`form-control ${isFocused ? 'focused' : ''}`}
                                    id="vatRateEndDate"
                                    type='date'
                                    placeholder="Date fin"
                                    value={vatRateEndDate.toISOString().split('T')[0]}
                                    onFocus={handleFocus}
                                    onChange={(e) => setVatRateEndDate(new Date(e.target.value))}
                                    />
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={handleUpdateVatRate}>
                        Sauvegarder
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default VatRate;
