import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';
import HeaderHome from '../components/navbar';
import HomeAdmin from './homeAdmin';
import HomeUser from './homeUser';
import axios from 'axios';

import '../styles/home.css'

const Home = () => {
    const { isAuthenticated, user } = useAuth0();
    const [userFunction, setUserFunction] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState(null);
    const [isDefault, setIsDefault] = useState(true);
    const navigate = useNavigate();
 
    const checkFunction = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/person/${user.email}`);
            const userData = response.data.results[0];
            if (!userData) {
                setError('Utilisateur non trouvé dans la base de données');
                return;
            }
            const userFunction = userData.functionId;
            setIsAdmin(userFunction === 500);
            setUserFunction(userFunction);
        } catch (error) {
            console.error('Erreur lors de la récupération de la fonction de l\'utilisateur : ', error);
            setError('Erreur lors de la récupération de la fonction de l\'utilisateur');
        }
    }, [user]);

    useEffect(() => {
        if (isAuthenticated && user && user.email) {
            checkFunction();
            setIsDefault(false);
        }
    }, [isAuthenticated, user, checkFunction]);

    useEffect(() => {
        if (error) {
            navigate('/error');
        }
    }, [error, navigate]);

    

    if (isDefault) {
        return (
            <div>
                <div className="header-wrapper">
                    <HeaderHome />
                </div>
                <div className="d-flex flex-column justify-content-center align-items-center container">
                    <div className="text-center">
                        <h1 className=''>Bienvenue sur Gestion des </h1>
                    </div>
                    <div className="textShow">
                        <ul>
                            <li>Bons de Livraisons</li>
                            <li>Bons Retours</li>
                            <li>Factures</li>
                            <li>Contrôle des Documents</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    } else {
        if (!isAuthenticated || error || userFunction === null) {
            return null; // Empêche le rendu du contenu non pertinent pendant la récupération de la fonction utilisateur
        } else {
            if (!userFunction) {
                navigate('/error');
                return null; // Empêche le rendu du contenu non pertinent pendant la redirection
            }
            return (
                <div>
                    <div className="header-wrapper">
                        <HeaderHome />
                    </div>
                    <div className="container">
                        <div className="headerHome">
                            {isAdmin ? <HomeAdmin /> : <HomeUser />}
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default Home;
