import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth0Provider } from '@auth0/auth0-react';
import Home from './pages/home';
import Error from './components/error' 
import AutoLogout from './components/autoLogout';
import CreatePersonFunction from './pages/createPersonFunction';
import PersonFunction from './pages/personFunction';
import Person from './pages/person';
import CreatePerson from './pages/createPerson';
import CreateVatRate from './pages/createVATRate'
import VatRate from './pages/vatRate'
import CreateCategory from './pages/createCategory'
import Category from './pages/category';

const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ 
        redirect_uri: window.location.origin,
        prompt: 'login',
      }}
    >
      <AutoLogout /> {/* Charge le composant AutoLogout*/}
      <BrowserRouter>
        <Routes>
          {/* Route par défaut */}
          <Route path="*" element={<Home/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/error" element={<Error/>}/>
          <Route path='/createPersonFunction' element={<CreatePersonFunction/>}/>   
          <Route path='/personFunction' element={<PersonFunction/>}/>
          <Route path='/createPerson' element={<CreatePerson/>}/>
          <Route path="/person" element={<Person/>} />
          <Route path='/createVATRate' element={<CreateVatRate/>}/>
          <Route path='/vatRate' element={<VatRate/>}/>
          <Route path='/createCategory' element={<CreateCategory/>}/>
          <Route path='/category' element={<Category/>}/>
        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);
