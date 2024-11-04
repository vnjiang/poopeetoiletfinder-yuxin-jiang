import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Map from './Map';
import AllToilet from './AllToilet';
import RateAndReview from './RateAndReview';
import WriteReview from './WriteReview';
import Login from './Login';
import Register from './Register';
import SharedToiletPage from './SharedToiletPage';
import User from './User';
import Header from './Header';
import Admin from './Admin';
import { getUserLocation } from './utils';
import { auth } from './firebase';
import './App.css';

const App = () => {
  const [center, setCenter] = useState(null);
  const [user, setUser] = useState();
  const navigate = useNavigate();

//fetch location
  useEffect(() => {
    getUserLocation(setCenter);
  }, []);

  // share toilet button navigate
  const sharedToiletButtonClick = () => {
    if (user) {
      navigate('/SharedToiletPage');
    } else {
      navigate('/login');
    }
  };


  // listening for authentication state changes
  useEffect(() => {
    const stopListenUserAuth = auth.onAuthStateChanged((currentUser) => {
      try {
        setUser(currentUser);
      } catch (error) {
        console.error(error);
      }
    });
    return () => stopListenUserAuth();
  }, []);


  return (
    <div className="container">
      <div>
        <Header />
      </div>
      <main className="main">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="map-container">
                  <div className="button-container">
                    <button className="share-your-toilet-button" onClick={sharedToiletButtonClick}>
                      Share Your Toilet
                    </button>
                    <button className="to-curent-location-button" onClick={() => getUserLocation(setCenter)}>
                      Current Location
                    </button>
                  </div>
                  <div className="map">
                    <Map center={center} />
                  </div>
                </div>
                <div className="all-toilet-list">
                  <AllToilet userLocation={center} />
                </div>
              </>
            }
          />
           {/* Define other routes and components */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reviewRoute/:toiletId" element={<RateAndReview />} />
          <Route path="/writeReview/:toiletId" element={<WriteReview />} />
          <Route path="/SharedToiletPage" element={user ? <SharedToiletPage /> : <Navigate to="/login" />} />
          <Route path="/user" element={user ? <User /> : <Navigate to="/login" />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <footer></footer>       {/*for future use*/}
    </div>
  );
};

export default App;
