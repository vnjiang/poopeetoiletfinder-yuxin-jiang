import apiClient from './apiClient';

export const fetchUserReviews = async (userId) => {
  const res = await apiClient.get(`/reviewRoute/user/${userId}`);
  return res;
};

export const deleteUserReview = async (reviewId) => {
  await apiClient.delete(`/reviewRoute/${reviewId}`);
};
