import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderHome from "../components/navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/category.css';
import { REACT_APP_BACKEND_URL } from "../config";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // Fonction pour la liste des produits en fonction de la catégorie sélectionnée
    const listProducts = (category = '') => {
        let url = `${REACT_APP_BACKEND_URL}/products`;
        // Ajoutez la catégorie à l'URL si elle est sélectionnée
        if (category) {
            url += `?category=${category}`;
        }
        // Requête de la liste produit
        return axios.get(url).then(response => response.data);
    };

    // Fonction pour la liste des catégories
    const listCategories = () => {
        axios.get(`${REACT_APP_BACKEND_URL}/category`)
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des catégories: ', error);
            });
    };

    // Gestion du changement de catégorie
    const handleCategoryChange = async (event) => {
        const category = event.target.value;
        setSelectedCategory(category);
    };

    // Chargement des produits et des catégories
    useEffect(() => {
        // Chargement des produits en fonction de la catégorie sélectionnée
        listProducts(selectedCategory)
            .then(products => {
                setProducts(products);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des produits : ', error);
            });

        // Chargement des catégories
        listCategories();
    }, [selectedCategory]); // Dépend de selectedCategory

    return (
        <div>
            <HeaderHome />
            <div className="container mt-4">
                <h1 className="mb-2"> Liste des produits </h1>
                <div className="row">
                    <div className="col-md-6 ml-auto mt-3 mb-5">
                        <div className="d-flex justify-content-center align-items-center">
                            <select className="form-select" onChange={handleCategoryChange} style={{ width: '200px' }}>
                                <option value="">Toutes les catégories</option>
                                {categories.map((item) => (
                                    <option key={item.categoryId} value={item.categoryId}>
                                        {item.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="col-6">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Description</th>
                                <th>Prix</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(item => (
                                <tr key={item.productID}>
                                    <td>{item.productID}</td>
                                    <td>{item.productName}</td>
                                    <td>{item.productPrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Products;
