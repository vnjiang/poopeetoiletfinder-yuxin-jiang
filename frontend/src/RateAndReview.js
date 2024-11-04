import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RateAndReview.css';
import { auth } from './firebase';
import { FaTrashAlt } from 'react-icons/fa';
import { renderStarWithoutCount,changeDateFormat } from './utils'; 

function RateAndReview() {
  const { toiletId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState();
  const navigate = useNavigate();

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


  //fetch review by toilet id
  useEffect(() => {
    const fetchReviewById = async () => {
      try {
        const reviewDataRes = await axios.get(`/routes/reviewRoute/${toiletId}`);
        setReviews(reviewDataRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchReviewById();
  }, [toiletId]);


// Ensure only logged-in users can write a review
  const writeReviewClick = () => {
    if (user) {
      navigate(`/writeReview/${toiletId}`);
    } else {
      navigate('/login');
    }
  };


//delete review from the database and remove it from the frontend
  const deleteReviewClick = async (reviewId) => {
    try {
      await axios.delete(`/routes/reviewRoute/${reviewId}`);
      setReviews(reviews.filter(review => review._id !== reviewId));
    } catch (error) {
      console.error(error);
    }
  };

// Sum all ratings for the toilet
  let totalRatingSum = 0;
  for (let i = 0; i < reviews.length; i++) {
    totalRatingSum += reviews[i].rating;
  } 

  return (
    <div className="rate-and-review-container">

      <div className="rating-part">
        <h1>Rating Summary</h1>
        <div className="overall-rating-review">
        <div className="review-stars-1"> 
          {renderStarWithoutCount(reviews.length > 0 ? totalRatingSum / reviews.length : 0)}
        </div>
        <div className="rating-number">
          {/* manually calculate the average rating */}
          {reviews.length > 0 ? (totalRatingSum / reviews.length).toFixed(1) : '0.0'}
        </div>
          <p>{reviews.length} reviews</p>
        </div>
        <button onClick={writeReviewClick} className="write-review-button">
          Write a Review
        </button>
      </div>

      <div className="review-part">
        {reviews.length > 0 ? (
          reviews.map((review) => {
            return (
              <div key={review._id} className="review-box">
                <div className="review-header">
                  <div className="user-and-date">
                    <div>
                      {/*user don't have user name, display Anonymous*/}
                      <h6>{review.user_name ? review.user_name : 'Anonymous'}</h6>
                      <h7>{changeDateFormat(review.created_date)}</h7>
                    </div>
                  </div>
                  <div className="rating-and-delete">
                  <div className="review-stars"> 
                    {renderStarWithoutCount(review.rating)}
                  </div>
                  <div className="rating-number">{review.rating.toFixed(1)}</div>
                  {/*only add delete icon for user who write review*/}
                    {user && user.uid === review.user_id ? (
                      <FaTrashAlt
                        className="delete-icon"
                        onClick={() => deleteReviewClick(review._id)}
                      />
                    ) : null}

                  </div>
                </div>
                <p>{review.comment}</p>
              </div>
            );
          })
        ) : (
          //add hint when there is no reviews
          <div className="no-review">Waiting For Your Review...</div>
        )}
      </div>

    </div>
  );


}

export default RateAndReview;
