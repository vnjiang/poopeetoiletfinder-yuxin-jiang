import { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import {
  fetchUserReviews,
  deleteUserReview,
} from '../../services/userService';

import UserProfileCard from '../../components/User/UserProfileCard';
import UserReviewList from '../../components/User/UserReviewList';

const User = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchUserReviews(user.uid)
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleDeleteReview = async (reviewId) => {
    // optimistic update
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));

    try {
      await deleteUserReview(reviewId);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 text-center text-gray-500">
        Loading user data...
      </div>
    );
  }

  return (
    <div className=" w-full min-h-screen bg-slate-50 pt-20 lg:pt-10  px-3 pb-15">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <UserProfileCard user={user} onLogout={handleLogout} />

        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Your reviews
          </h2>

          <UserReviewList
            reviews={reviews}
            onDelete={handleDeleteReview}
          />
        </section>
      </div>
    </div>
  );
};

export default User;
