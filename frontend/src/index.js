import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth0Provider } from '@auth0/auth0-react';
import Home from './pages/home';

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
      
      <BrowserRouter>
        <Routes>
          {/* Route par défaut */}
          <Route path="*" element={<Home/>} />
          <Route path="/home" element={<Home/>} />
        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);
