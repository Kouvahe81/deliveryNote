import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth0Provider } from '@auth0/auth0-react';
import Home from './pages/home';
import HomeAdmin from './pages/homeAdmin';
import HomeUser from './pages/homeUser';
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
import Product from './pages/product';
import ListProduct from './pages/listProduct';
import CreateProduct from './pages/createProduct';
import HeadOffice from './pages/headOffice';
import CreateHeadOffice from './pages/createHeadOffice';
import Branch from './pages/branch';
import CreateBranch from './pages/createBranch';
import DeliveryNote from './pages/deleveryNote';
import ListDeliveryNote from './pages/listDeliveryNote';
import FinalDeliveryNote from './pages/finalDeliveryNote';
import ReturnVoucher from './pages/returnVoucher';
import ListReturnVoucher from './pages/listReturnVoucher';
import Invoice from './pages/invoice';


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
          <Route path="/homeAdmin" element={<HomeAdmin/>} />
          <Route path="/homeUser" element={<HomeUser/>} />
          <Route path="/error" element={<Error/>}/>
          
          <Route path='/createPersonFunction' element={<CreatePersonFunction/>}/>   
          <Route path='/personFunction' element={<PersonFunction/>}/>

          <Route path='/createPerson' element={<CreatePerson/>}/>
          <Route path="/person" element={<Person/>} />

          <Route path='/createVATRate' element={<CreateVatRate/>}/>
          <Route path='/vatRate' element={<VatRate/>}/>

          <Route path='/createCategory' element={<CreateCategory/>}/>
          <Route path='/category' element={<Category/>}/>

          <Route path='/createProduct' element={<CreateProduct/>}/>
          <Route path="/product" element={<Product/>} />
          <Route path="/listProducts" element={<ListProduct/>} />

          <Route path='/createHeadOffice' element={<CreateHeadOffice/>}/>
          <Route path="/headOffice" element={<HeadOffice/>} />
                    
          <Route path="/createBranch" element={<CreateBranch/>} />
          <Route path="/branch" element={<Branch/>} />
          
          <Route path="/deliveryNote" element={<DeliveryNote/>} />
          <Route path="/ListDeliveryNote" element={<ListDeliveryNote/>} />
          <Route path='/finalDeliveryNote' element={<FinalDeliveryNote/>}/>
          
          <Route path='/returnVoucher' element={<ReturnVoucher/>}/>
          <Route path='/listReturnVoucher' element={<ListReturnVoucher/>}/>

          <Route path='/invoice' element={<Invoice/>}/>
         
        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);
