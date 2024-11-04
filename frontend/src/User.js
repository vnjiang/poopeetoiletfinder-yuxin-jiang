import React, { useState, useEffect } from 'react';
import { useAuth } from './authContext';
import { changeDateFormat } from './utils';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './User.css';

const User = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviewInUserPage, setReviewInUserPage] = useState([]);
  const [username, setUsername] = useState(''); 


  //fetch user data and user's review
  useEffect(() => {
    if (user) {
      setUsername(user.displayName); 
      const fetchAllUserData = async () => {
        try {
          //fetch review by user id
          const fetchReviewByUserRes = await axios.get(`/routes/reviewRoute/user/${user.uid}`);
        //make sure review data is array
          setReviewInUserPage(Array.isArray(fetchReviewByUserRes.data) ? fetchReviewByUserRes.data : []);
        } catch (error) {
          console.error(error);
        }
      };
      fetchAllUserData();
    }
  }, [user]);


  // handle logout button click
  const logoutButtonAction = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  //handle delete review button click
  const deleteReviewButtonAction = async (reviewId) => {
    try {
      //delete review from database
      await axios.delete(`/routes/reviewRoute/${reviewId}`);
      //remove review from frontend
      setReviewInUserPage(reviewInUserPage.filter(review => review._id !== reviewId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="user-page">
      <h2 className="user-page-title"> Your Information</h2>
      <div className="user-page-user-info">
      <div>Username: {username ? username : 'Anonymous User'}</div>
        <div>User ID: {user.uid}</div>
        <div>Email:{user.email}</div>
        <div>Registration Date: {changeDateFormat(user.metadata.creationTime)} </div>
        <button className="user-page-button" onClick={logoutButtonAction}>Log Out</button>
      </div>

      <div className="user-page-review">
        <h3 className="user-page-title">Your Reviews</h3>
          {/* if user have review, show review list, if no, show hint*/}
        {reviewInUserPage.length > 0 ? (
          <ul>
            {reviewInUserPage.map(review => (
              <li key={review._id}>
                <div><strong>Rating:</strong> {review.rating} </div>
                <div><strong>Comment:</strong> {review.comment} </div>
                <div><strong>Date:</strong> {changeDateFormat(review.created_date)}  </div>
                <button onClick={() => deleteReviewButtonAction(review._id)} className="user-page-button">Delete Review</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>You Have Not Written Any Reviews Yet</p>
        )}
      </div>

    </div>
  );
};

export default User;
