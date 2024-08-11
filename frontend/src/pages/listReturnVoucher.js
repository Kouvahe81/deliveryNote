import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import Loupe from '../images/Loupe.png';
import { REACT_APP_BACKEND_URL } from "../config";

const ListReturnVoucher = () => {
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

    // Fonction pour gérer la création ou ouverture d'un bon retour
    const handleReturnNote = async (deliveryNoteId) => {
        try {
            // Vérifier s'il y a un bon retour actif pour le bon de livraison spécifié
            const response = await axios.get(`${REACT_APP_BACKEND_URL}/returnVoucher/${deliveryNoteId}`);
            const returnNote = response.data;
                    
            if (returnNote.length === 0) {
                // Redirection vers la page du nouveau bon retour
                navigate(`/returnVoucher/?deliveryNoteId=${deliveryNoteId}`);
            } 
        } catch (error) {
            console.error('Erreur lors de la gestion du bon de retour : ', error);
            setMessage({ text: 'Erreur lors de la gestion du bon de retour.', type: 'error' });
            deleteMessage();
        }
    };
    

    return (
        <div>
            <HeaderHome />
            <div id="error-message" className={`mt-5 ${message.type === 'error' ? 'text-danger' : 'text-success'}`}>
                {message.text}
            </div>
            <div className="container mt-5">
                <div className="row justify-content-center">
                <h1 className="text-center mb-3">Liste des bons retour</h1>
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
                                                    <button className="btn btn-primary" onClick={() => handleReturnNote(note.deliveryNoteId)}> Bon Retour </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="d-flex justify-content-center mt-3">
                                <button className="btn btn-primary" onClick={() => navigate('/createDeliveryNote')}>Créer un bon de livraison</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListReturnVoucher;
