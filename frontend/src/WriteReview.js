import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './authContext';

const WriteReview = () => {
  const { toiletId } = useParams(); 
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(rating >= 0 && rating <= 5 && comment.trim() !== '');
  }, [rating, comment]);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if(rating > 5 || rating < 0) {
      throw new Error('please input correct number');
      return;
    }
  
    try {
      const review = {
        review_id: `review${Math.random().toString(36).substring(7)}`, //generate random id
        toilet_id: toiletId,
        user_id: user.uid,
        user_name: user.displayName ? user.displayName : 'Anonymous',
        rating: Number(rating), 
        comment,
      };
  

      await axios.post('http://localhost:5007/routes/reviewRoute', review);
  
      alert('Review submitted successfully!');
      navigate(-1);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review.');
    }
  };
  

  return (
    <div>
      <h1>Write a Review</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="rating">Rating from 0 to 5 </label>
          <input
            type="number"
            id="rating"
            name="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            min="1"
            max="5"
            required
          />
        </div>
        <div>
          <label htmlFor="comment">Make a Comment: </label>
          <textarea
            id="comment"
            name="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={!isFormValid}>Submit</button>
      </form>
    </div>
  );
};

export default WriteReview;
