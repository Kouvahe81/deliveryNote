import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios';
import logo from '../images/Logo.png';
import { REACT_APP_BACKEND_URL } from '../config';


const NavLinks = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: ${props => (props.isOpen ? 'flex' : 'none')};
    flex-direction: column;
    width: 100%;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  margin-right: 1rem;
  font-size: 20px;

  &.links-list:hover:hover {
    background-color: #F0E68C;
    color: black;
    border-radius: 5px;
  }
`;

const NavbarContainer = styled.nav`
  background-color: #939797;
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const MenuIcon = styled.div`
  display: none;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { loginWithRedirect, isAuthenticated, logout, user } = useAuth0();
  const [statusAuthenticated, setStatusAuthenticated] = useState(false);
  const [setError] = useState(null);
  
  const handleAuthAction = () => {
    if (isAuthenticated && statusAuthenticated) {
        logout();
    } else {
        loginWithRedirect();
    }
  };

  useEffect(() => {
    const checkFunction = async () => {
      try {
        const response = await axios.get(`${REACT_APP_BACKEND_URL}/person/${user.email}`);
        const userData = response.data.results[0];
        if (!userData) {
          setError('Utilisateur non trouvé dans la base de données');
          setStatusAuthenticated(false);
        } else {
          setStatusAuthenticated(true);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la fonction de l\'utilisateur : ', error);
        setError('Erreur lors de la récupération de la fonction de l\'utilisateur');
      }
    };
    
    if (isAuthenticated && user && user.email) {
      checkFunction();
    }
  }, [isAuthenticated, user,setError]);

  return (
    <NavbarContainer>
      <NavLink to="/">
        <img src={logo} alt="MyApp Logo" />
      </NavLink>
      <MenuIcon onClick={() => setIsOpen(!isOpen)}>
        <div>☰</div>
      </MenuIcon>
      <NavLinks isOpen={isOpen}>
        <NavLink className='links-list' to="/">Accueil</NavLink>
        <NavLink className='links-list' to="/about">A propos</NavLink>
        <NavLink className='links-list' onClick={handleAuthAction}>
          {(isAuthenticated && statusAuthenticated) ? 'Déconnexion' : 'Connexion' }
        </NavLink>
      </NavLinks>
    </NavbarContainer>
  );
}

export default Navbar;
