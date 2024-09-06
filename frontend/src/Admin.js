import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './authContext';
import { useNavigate } from 'react-router-dom';
import './Admin.css'; 

const Admin = () => {
  const [toilets, setToilets] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email !== 'jiangyuxin0326@gmail.com') {
      alert('No access');
      navigate(-1);
      return;
    }

    axios.get('http://localhost:5007/routes/sharedToiletRoute', {
      params: { approved_by_admin: false }  
    })
    .then(response => setToilets(response.data))
    .catch(error => console.error('Error fetching toilets:', error.message));
  }, [user, navigate]);

  const handleCorrect = (toilet) => {
    axios.put(`http://localhost:5007/routes/sharedToiletRoute/${toilet._id}`, {
      ...toilet,
      approved_by_admin: true
    })
    .then(() => {
      setToilets(toilets.filter(t => t._id !== toilet._id));
    })
    .catch(error => console.error('Error approving toilet:', error));
  };

  const handleWrong = (id) => {

    setToilets(toilets.filter(t => t._id !== id));
  };

  return (
<div className="admin-page">
      <h2>Admin Page</h2>
      <h3>Toilets Awaiting Verification</h3>
      <ul>
        {toilets.map(toilet => (
          <li key={toilet._id}>
            {toilet.toilet_name} - {toilet.toilet_description} - {toilet.eircode} - €{toilet.price} - {toilet.contact_number} - 
            {toilet.toilet_paper_accessibility ? 'Available' : 'Not Available'}
            <button onClick={() => handleCorrect(toilet)}>Approve</button>
            <button onClick={() => handleWrong(toilet._id)}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
