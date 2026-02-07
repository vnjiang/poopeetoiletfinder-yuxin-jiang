import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import ReviewForm from '../../components/ReviewForm/ReviewForm';
import { submitReview } from '../../services/reviewService';

const WriteReviewPage = () => {
  const { toiletId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

 
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async ({ rating, comment }) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        place_id: toiletId,
        user_id: user.uid,
        user_name: user.displayName || 'Anonymous',
        rating,
        comment,
      };

      await submitReview(payload);
      navigate(-1);
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to submit your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full pt-40 px-4 bg-slate-100 min-h-screen">
      <div className="mx-auto max-w-xl">
      
        <div className="mb-3 ml-3">
          <h1 className="text-lg font-semibold text-slate-900">
            Write a review
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Share your experience to help other users.
          </p>
        </div>

        <ReviewForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      </div>
    </div>
  );
};

export default WriteReviewPage;
