import React from 'react';
import ReactDOM from 'react-dom/client'; 
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { AuthContextProvider } from './authContext';
//import './custom.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router basename="/">
  <AuthContextProvider>
    <App />
  </AuthContextProvider>
  </Router>
);



/*
<Routes>

  <Route path="/" element={<App />} />
  <Route path="/reviewRoute/:toiletId" element={<RateAndReview />} />
  <Route path="/SharedToiletPage" element={<SharedToiletPage />} />
  <Route path="/WriteReview/:toiletId" element={<WriteReview />} />
</Routes>
*/