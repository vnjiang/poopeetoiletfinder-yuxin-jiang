// App.js
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
import { getUserLocation } from './utils';
import { auth } from './firebase';
import Header from './Header'; // 导入 Header 组件
import ResetPassword from './ResetPassword';
import Admin from './Admin';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';



const App = () => {
  const [center, setCenter] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Handle click to share toilet
  const handleSharedToiletClick = () => {
    if (user) {
      navigate('/SharedToiletPage');
    } else {
      navigate('/login');
    }
  };

  // Check authentication status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log("Auth state changed, current user:", currentUser);
      setUser(currentUser);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  // Fetch user location
  useEffect(() => {
    getUserLocation(setCenter);
  }, []);

  return (
    <div classname="container">
      <Header /> {/* 添加 Header 组件 */}
      <main className="main">
        <Routes>
          <Route path="/" element={
            <>
              <div className="map-container">
                <div className="button-container">
                  <button className="share-your-toilet-button" onClick={handleSharedToiletClick}>
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
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reviewRoute/:toiletId" element={<RateAndReview />} />
          <Route path="/writeReview/:toiletId" element={<WriteReview />} />
          <Route path="/SharedToiletPage" element={user ? <SharedToiletPage /> : <Navigate to="/login" />} />
          <Route path="/user" element={user ? <User /> : <Navigate to="/login" />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <footer></footer>
    </div>
  );
};

export default App;


