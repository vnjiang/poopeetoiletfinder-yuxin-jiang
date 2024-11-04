import React from 'react';
import ReactDOM from 'react-dom/client'; 
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { AuthContextProvider } from './authContext';

import 'bootstrap/dist/css/bootstrap.min.css';

// Create the root for rendering
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Wrap APP and router in the AuthContextProvider to manage authentication state
  <AuthContextProvider>
    {/* Wrap APP in a Router to enable routing */}
  <Router basename="/">

    <App />

  </Router>
  </AuthContextProvider>
);


