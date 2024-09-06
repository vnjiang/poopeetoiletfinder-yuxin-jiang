import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RateAndReview.css';
import { auth } from './firebase';
import { FaStar, FaTrashAlt } from 'react-icons/fa'; // Import FontAwesome star and trash icons

function RateAndReview() {
  const { toiletId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:5007/routes/reviewRoute/${toiletId}`);
        setReviews(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchReviews();
  }, [toiletId]);

  const handleWriteReviewClick = () => {
    if (user) {
      navigate(`/writeReview/${toiletId}`);
    } else {
      navigate('/login');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    console.log("Attempting to delete review with ID:", reviewId);
    try {
      await axios.delete(`http://localhost:5007/routes/reviewRoute/${reviewId}`);
      setReviews(reviews.filter(review => review._id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete the review. Please try again.');
    }
  };
  
  

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {Array(5).fill(0).map((_, index) => (
          <FaStar key={index} color={index < rating ? '#f1c40f' : '#e4e5e9'} />
        ))}
        <span className="rating-number">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading reviews: {error.message}</div>;

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="rate-and-review-container">
      <div className="rating-summary">
        <h1>Overall Rating</h1>
        <div className="overall-rating">
          {renderStars(averageRating)}
          <p>{reviews.length} reviews</p>
        </div>
        <button onClick={handleWriteReviewClick} className="button-link">
          Write a Review
        </button>
      </div>

      <div className="reviews-section">
        {reviews.length === 0 ? (
          <p>No reviews available.</p>
        ) : (
          reviews.map((review) => {
            const createdDate = new Date(review.created_date);
            const formattedDate = createdDate.toLocaleDateString();

            return (
              <div key={review._id} className="review-item">
                <div className="review-header">
                  <div className="review-author">
                    {/* Display the username from the review data */}
                    <div>
                      <strong>{review.user_name || 'Anonymous'}</strong>
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                  <div className="review-actions">
                    {renderStars(review.rating)}
                    {user && user.uid === review.user_id && (
                      <FaTrashAlt 
                        className="delete-icon"
                        onClick={() => handleDeleteReview(review._id)}
                        title="Delete your review"
                      />
                    )}
                  </div>
                </div>
                <p>{review.comment}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RateAndReview;
