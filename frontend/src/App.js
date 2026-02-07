import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, BrowserRouter } from 'react-router-dom';
import Map from './components/Map/Map';
import AllToilet from './components/AllToilet/AllToilet';
import ButtonGroup from './components/ButtonGroup/ButtonGroup';
import Header from './components/Header/Header';

import RateAndReview from './pages/RateAndReview/RateAndReview';
import WriteReview from './pages/WriteReview/WriteReview';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import SharedToiletPage from './pages/SharedToiletPage/SharedToiletPage';
import User from './pages/User/User';
import Admin from './pages/Admin/Admin';

import { getUserLocation } from './utils/utils';

import { useAuth } from './context/authContext';
import './App.css';



const App = () => {
  const [center, setCenter] = useState(null);
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();


  // fetch location
  useEffect(() => {
    getUserLocation(setCenter);
  }, []);

  // share toilet button navigate
  const sharedToiletButtonClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (role !== 'commercial_owner') {
      navigate('/user');
      return;
    }

    navigate('/shared-your-toilet');
  };


  if (loading) return null;


  return (
    <div className="app-root min-h-screen bg-white text-slate-800 flex flex-col">
      <Header />

      <main className="main">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="map-container">
                  <ButtonGroup
                    onShareClick={sharedToiletButtonClick}
                    onLocateClick={() => getUserLocation(setCenter)}
                    canShare={role === 'commercial_owner'}
                  />

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

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rate-and-review/:toiletId" element={<RateAndReview />} />
          <Route path="/write-review/:toiletId" element={<WriteReview />} />
          <Route
            path="/shared-your-toilet"
            element={
              !user ? (
                <Navigate to="/login" />
              ) : role === 'commercial_owner' ? (
                <SharedToiletPage />
              ) : (
                <Navigate to="/user" />
              )
            }
          />

          <Route path="/user" element={user ? <User /> : <Navigate to="/login" />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>


    </div>
  );
};

export default App;
