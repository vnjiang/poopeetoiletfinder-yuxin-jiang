import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchReviewsByToilet, deleteReview } from '../../services/reviewService';
import { useAuth } from '../../context/authContext';
import ReviewSummary from '../../components/RateAndReview/ReviewSummary';
import ReviewList from '../../components/RateAndReview/ReviewList';

const RateAndReviewPage = () => {
  const { toiletId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviewsByToilet(toiletId)
      .then(setReviews)
      .catch(() => setError('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, [toiletId]);

  const handleDelete = async (id) => {
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r._id !== id));
  };

  const handleWriteReview = () => {
    user ? navigate(`/write-review/${toiletId}`) : navigate('/login');
  };

  const ratingStats = useMemo(() => {
    const valid = reviews.map(r => Number(r.rating)).filter(Number.isFinite);
    const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
    return { avg, count: valid.length };
  }, [reviews]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;

  return (
<div className=" bg-slate-50  px-0 mx-auto w-full  min-h-screen">


      <ReviewSummary
        avgRating={ratingStats.avg}
        total={reviews.length}
        onWrite={handleWriteReview}
      />

      <ReviewList
        reviews={reviews}
        currentUser={user}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default RateAndReviewPage;
