import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './authContext';// Import authentication context
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
  const [sharedToilet, setSharedToilet] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  //set admin account
  useEffect(() => {
    //hardcode the email account of admin
    if (user?.email !== 'jiangyuxin0326@gmail.com' && user?.email !== '735576596@qq.com') {
      alert('No access');
      navigate(-1);
    } else {
      fetchUnapprovedSharedToilet();
    }
  }, [user, navigate]);


  const fetchUnapprovedSharedToilet = async () => {
    try {
      //fetch unapproved SharedToilet from Mongo
      const unapprovedSharedToilet = await axios.get('/routes/sharedToiletRoute', {
        params: { approved_by_admin: false }//only fetch toilet whose approved_by_admin field is false
      });
      setSharedToilet(unapprovedSharedToilet.data);
    } catch (error) {
      console.error(error);
    }
  };


  // handle approve button click
  const sharedToiletApprove = async (toilet) => {
    try {

      await axios.put(`/routes/sharedToiletRoute/${toilet._id}`, {
        ...toilet,
        approved_by_admin: true,// Set the toilet as approved
        rejected: true  //mark it as a processed toilet
      });
      //remove approved toilet from admin page(just frontend data)
      setSharedToilet(sharedToilet.filter(t => t._id !== toilet._id));
    } catch (error) {
      console.error(error);
    }
  };

  // handle reject action
  const sharedToiletReject = async (id) => {
    try {
      await axios.put(`/routes/sharedToiletRoute/reject/${id}`); 
      //remove rejected toilet from admin page in frontend
      setSharedToilet(sharedToilet.filter(t => t._id !== id));
    } catch (error) {
      console.error(error);
    }
  };


 //render page 
  return (
    <div className="admin">
      <h3>Shared Toilets List Unverificated</h3>
      {/*make sure it is an array*/}
      {Array.isArray(sharedToilet) && sharedToilet.length > 0 ? (
        <div className="admin-item">
          <ul>
            {sharedToilet.map(toilet => (
              <li key={toilet._id}>
                <p>Toilet Name: {toilet.toilet_name}</p>
                <p>Description: {toilet.toilet_description}</p>
                <p>Eircode: {toilet.eircode} </p>
                <p>Price: €{toilet.price}</p>
                <p>Contact Number: {toilet.contact_number}</p>
                <p>Toilet Paper: {toilet.toilet_paper_accessibility ? 'Available' : 'Not Available'}</p>
                <div>
                  <button onClick={() => sharedToiletApprove(toilet)}>Approve</button>  {/*for approve item*/}
                  <button onClick={() => sharedToiletReject(toilet._id)}>Reject</button> {/*for reject item*/}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <span>Waiting for them to share...</span> //add hint when there is no toilet item
      )}
    </div>
  );

};

export default Admin;
