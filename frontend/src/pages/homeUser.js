import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homeAdmin.css'; 

const HomeUser = () => {
    return (
        <div className="container">
            <div className="box-container">
                
                <div className="box">
                    <h2>Liste</h2>
                    <div className="links-container">
                        <Link to="/product" className="link">Produits</Link>
                        <Link to="/person" className="link">Utilisateur</Link>
                        <Link to="/personFunction" className="link">Fonction</Link>
                        <Link to="/category" className="link">Categorie</Link>
                        <Link to="/branch" className="link">Succursale</Link>
                        <Link to="/headOffice" className="link">Siège Social</Link>
                        <Link to="/vatRate" className="link">TVA</Link>
                    </div>
                </div>
                <div className="box">
                    <h2>Fonctionnalités</h2>
                    <div className="links-container">
                        <Link to="/listDeliveryNote" className="link">Bon de livraison</Link>
                        <Link to="/listReturnVoucher" className="link">Bon de retour </Link>
                        <Link to="/invoice" className="link">Facture</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeUser;
