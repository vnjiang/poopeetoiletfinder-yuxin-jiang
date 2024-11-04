import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './authContext';
import './WriteReview.css';


const WriteReview = () => {
  //initialize variable
  const { toiletId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // function to handle form submission
  const submitReviewAction = async (e) => {
    e.preventDefault();

    // Create the review data object to send to the backend
    const submitedReviewData = {
      place_id: toiletId,
      user_id: user.uid,
      user_name: user.displayName ? user.displayName : 'Anonymous User',
      rating: Number(rating),
      comment: comment,
    };

    try {
      // post the review data to the backend
      await axios.post('/routes/reviewRoute', submitedReviewData);
      alert('Thanks for your review!');
      navigate(-1);
    } catch (error) {
      console.error(error);
    }

  };


  return (
    <div className="write-review-container">
      <h2 className="write-review-title">Write Your Review Here</h2>
      {/* Form for submit review */}
      <form onSubmit={submitReviewAction} className="write-review-form">
        <label className="write-review-label">Rating from 0 to 5： </label>
        <input
          required
          type="number"
          name="rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          min="0"
          max="5"
          className="write-review-input"
        />

        {/* textarea for input comment */}
        <label className="write-review-label">Make a Comment Here: </label>
        <textarea
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          maxLength="1500"
          className="write-review-textarea"
        />
        <button type="submit" className="write-review-button">Submit</button>
      </form>
    </div>
  );

};

export default WriteReview;
