import React, { useState, useEffect } from 'react';
import { useAuth } from './authContext';
import { formatDate } from './utils';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './User.css'; 

const User = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);  
  const [toilets, setToilets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(''); // 新增状态保存username

  useEffect(() => {
    if (user) {
      setUsername(user.displayName); // 从auth对象中获取用户名

      const fetchData = async () => {
        try {
          // 获取用户的评论
          const reviewResponse = await axios.get(`http://localhost:5007/routes/reviewRoute/user/${user.uid}`);
          setReviews(Array.isArray(reviewResponse.data) ? reviewResponse.data : []); 

          // 获取用户的共享厕所
          const toiletResponse = await axios.get(`http://localhost:5007/routes/sharedToiletRoute/user/${user.uid}`);
          setToilets(Array.isArray(toiletResponse.data) ? toiletResponse.data : []); 

          setLoading(false);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError(err);
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`http://localhost:5007/routes/reviewRoute/${reviewId}`);
      setReviews(reviews.filter(review => review._id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete the review. Please try again.');
    }
  };

  const handleDeleteToilet = async (toiletId) => {
    try {
        await axios.delete(`http://localhost:5007/routes/sharedToiletRoute/${toiletId}`);
        // 确保前端状态正确更新
        setToilets(toilets.filter(toilet => toilet._id !== toiletId));
    } catch (error) {
        console.error('Error deleting toilet:', error);
        alert('Failed to delete the toilet. Please try again.');
    }
  };

  if (!user || loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="user-page">
      <h2>User Information</h2>
      <p><strong>Username:</strong> {username}</p> {/* 显示用户名 */}
      <p><strong>User ID:</strong> {user.uid}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Registration Date:</strong> {formatDate(user.metadata.creationTime)}</p>
      <button className="logout-button" onClick={handleLogout}>Logout</button>

      <h3>Your Reviews</h3>
      {reviews.length === 0 ? (
        <p>You have not submitted any reviews.</p>
      ) : (
        <ul>
          {reviews.map(review => (
            <li key={review._id}>
              <strong>Rating:</strong> {review.rating} <br />
              <strong>Comment:</strong> {review.comment} <br />
              <strong>Date:</strong> {formatDate(review.created_date)} <br />
              <button onClick={() => handleDeleteReview(review._id)}>Delete Review</button>
            </li>
          ))}
        </ul>
      )}

      <h3>Your Shared Toilets</h3>
      {toilets.length === 0 ? (
        <p>You have not shared any toilets.</p>
      ) : (
        <ul>
          {toilets.map(toilet => (
            <li key={toilet._id}>
              <strong>{toilet.toilet_name}</strong> - {toilet.toilet_description} - {toilet.eircode} - ${toilet.price} <br />
              <strong>Contact:</strong> {toilet.contact_number} <br />
              <strong>Status:</strong> {toilet.approved_by_admin ? 'Approved' : 'Pending Approval'} <br />
              <button onClick={() => handleDeleteToilet(toilet._id)}>Delete Toilet</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default User;
