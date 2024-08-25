import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
// App component is wrapped in router component and authprovider and alertTemplate for context and router functionality
root.render(
	<Router>
        <AuthProvider>
          <App />
        </AuthProvider>
    </Router>
);

reportWebVitals();