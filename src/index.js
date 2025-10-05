import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Load Bootstrap first so our app styles can override it
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './index.css';
import './App.css';
import './assets/css/app.css';
import './assets/css/style-preset.css';
import './assets/css/style.css';

import './assets/fonts/inter/inter.css';
import './assets/fonts/tabler-icons.min.css';
import './assets/fonts/feather.css';
import './assets/fonts/fontawesome.css';
import './assets/fonts/material.css';
import './assets/fonts/phosphor/duotone/style.css';

import reportWebVitals from './reportWebVitals';
import { HelmetProvider } from 'react-helmet-async';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
