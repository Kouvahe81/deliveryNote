import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homeAdmin.css'; 

const HomeAdmin = () => {
    return (
        <div className="container">
            <div className="box-container">
                <div className="box">
                    <h2>Création</h2>
                    <div className="links-container">
                        <Link to="/createProduct" className="link">Produits</Link>
                        <Link to="/createPerson" className="link">Utilisateur</Link>
                        <Link to="/createPersonFunction" className="link">Fonction</Link>
                        <Link to="/category" className="link">Categorie</Link>
                        <Link to="/CreateBranch" className="link">Succursale</Link>
                        <Link to="/createHeadOffice" className="link">Siège Social</Link>
                        <Link to="/createVATRate" className="link">TVA</Link>
                    </div>
                </div>
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
                <div className="box">
                    <h2>États Ventes</h2>
                    <div className="links-container">
                        <Link to="/etats-ventes" className="link"> Quantités Vendues</Link>
                        <Link to="/etats-ventes" className="link"> Chiffres d'Affaires Réalisés</Link>
                        <Link to="/etats-ventes" className="link">Quantités Perdues</Link>
                        <Link to="/etats-ventes" className="link"> Chiffres d'Affaires en Pertes</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeAdmin;
