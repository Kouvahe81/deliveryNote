import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homeAdmin.css'; 

const HomeUser = () => {
    return (
        <div className="container">
            <div className="box-container">
                <div className="box">
                    <h2>Liste </h2>
                    <div className="links-container">
                        <Link to="/listProducts" className="link">Produits</Link>
                        <Link to="/person" className="link">Utilisateur</Link>
                        <Link to="/category" className="link">Categorie</Link>
                        <Link to="/branch" className="link">Succursale</Link>
                        <Link to="office" className="link">Siège Social</Link>
                        <Link to="/VAT" className="link">TVA</Link>
                    </div>
                </div>               
            </div>
            <div className="box">
                    <h2>Bons </h2>
                    <div className="links-container">
                        <Link to="/deliveryNote" className="link">Bon de Livraison</Link>
                    </div>
                </div>    
        </div>
    );
};

export default HomeUser;

