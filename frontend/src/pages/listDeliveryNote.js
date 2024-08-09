import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import Loupe from '../images/Loupe.png';
import { REACT_APP_BACKEND_URL } from "../config";

const ListDeliveryNote = () => {
    const [deliveryNote, setDeliveryNote] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [branches, setBranches] = useState([]);

    const deleteMessage = () => {
        setTimeout(() => {
            resetMessages();
        }, 5000);
    };

    const isDebugMode = false;
    isDebugMode && console.log(branches);
    
    const resetMessages = () => {
        setMessage({
            text: '',
            type: ''
        });
    };

    const listDeliveryNote = (branch) => {
        return new Promise((resolve, reject) => {
            let url = `${REACT_APP_BACKEND_URL}/deliveryNote`;
            if (branch) {
                url += `?branch=${branch}`;
            }
            axios.get(url)
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    };

    const handleDeleteDeliveryNote = async (deliveryNoteId) => {
        const deliveryNoteToDelete = deliveryNote.find(note => note.deliveryNoteId === deliveryNoteId);

        // Assurez-vous que `deliveryNoteToDelete` existe avant de continuer
        if (!deliveryNoteToDelete) {
            console.error("Le bon de livraison à supprimer n'a pas été trouvé.");
            setMessage({ text: 'Erreur : Le bon de livraison n\'a pas été trouvé.', type: 'error' });
            deleteMessage();
            return;
        }
    
        const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer le bon ${deliveryNoteToDelete.deliveryNoteNumber} ?`);
        if (confirmDelete) {
            try {
                // Supprimer les lignes liées
                await axios.delete(`${REACT_APP_BACKEND_URL}/to_list/${deliveryNoteId}`);
                
                // Supprimer le bon de livraison
                await axios.delete(`${REACT_APP_BACKEND_URL}/deliveryNote/${deliveryNoteId}`);
                
                const updatedDeliveryNote = deliveryNote.filter(note => note.deliveryNoteId !== deliveryNoteId);
                setDeliveryNote(updatedDeliveryNote);
                setMessage({ text: `Le bon de livraison ${deliveryNoteToDelete.deliveryNoteNumber} a été supprimé avec succès.`, type: 'success' });
            } catch (error) {
                console.error("Erreur lors de la suppression du produit :", error);
                setMessage({ text: 'Erreur lors de la suppression du produit.', type: 'error' });
            }
        }
        deleteMessage();
    };
    
    const handleSearchTermChange = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
    };

    const listBranches = () => {
        axios.get(`${REACT_APP_BACKEND_URL}/branch`)
            .then(response => {
                setBranches(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des catégories: ', error);
            });
    };

    useEffect(() => {
        listBranches();
        listDeliveryNote();
    }, []);

    useEffect(() => {
        let url = `${REACT_APP_BACKEND_URL}/deliveryNote`;
        axios.get(url)
            .then(response => {
                let filteredDeliveryNote = response.data;
                if (searchTerm.trim() !== '') {
                    filteredDeliveryNote = filteredDeliveryNote.filter(ListDeliveryNote =>
                        ListDeliveryNote.branchName.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setDeliveryNote(filteredDeliveryNote);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des produits : ', error);
            });
    }, [searchTerm]);

    // Fonction pour gérer la redirection vers le formulaire finalDeliveryNote
    const handleReturn = (deliveryNoteId) => {
        const noteToEdit = deliveryNote.find(note => note.deliveryNoteId === deliveryNoteId);
        if (noteToEdit) {
            // Redirection vers le formulaire de modification avec les détails du bon de livraison
            window.location.href = `./finalDeliveryNote?deliveryNoteId=${deliveryNoteId}`;
        }
    };

    return (
        <div>
            <HeaderHome />
            <div id="error-message" className={`mt-5 ${message.type === 'error' ? 'text-danger' : 'text-success'}`}>
                {message.text}
            </div>
            <div className="container mt-5">
            <h1 className="text-center mb-3">Liste des bons de livraison</h1>
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <div className="">
                            <div className="d-flex justify-content-center align-deliveryNoteIds-center">
                                <img className="loupe" src={Loupe} alt="Loupe" />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Rechercher par succursale..."
                                    value={searchTerm}
                                    onChange={handleSearchTermChange}
                                />
                            </div>
                            <div className="table mt-3">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Date</th>
                                            <th>Succursale</th>
                                            <th colSpan="3" className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveryNote.map((note) => (
                                            <tr key={note.deliveryNoteId}>
                                                <td>{note.deliveryNoteNumber}</td>
                                                <td>{note.deliveryDate}</td>
                                                <td>{note.branchName}</td>
                                                <td>
                                                    <button className="btn btn-warning" onClick={() => handleReturn(note.deliveryNoteId)}>Modifier</button>
                                                </td>
                                                <td>
                                                    <button className="btn btn-danger" onClick={() => handleDeleteDeliveryNote(note.deliveryNoteId)}>Supprimer</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="d-flex justify-content-center mt-3">
                                <button className="btn btn-primary" onClick={() => window.location.href = '/createDeliveryNote'}>Créer un bon de livraison</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListDeliveryNote;
