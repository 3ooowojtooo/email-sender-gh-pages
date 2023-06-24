import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {LoaderContextProvider} from "./service/component/loader/LoaderContext";
import "font-awesome/css/font-awesome.css";
import "tempusdominus-bootstrap/build/css/tempusdominus-bootstrap.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <LoaderContextProvider>
    <App />
  </LoaderContextProvider>
);
