import apiClient from './apiClient';

export const submitReview = (reviewData) => {
  return apiClient.post('/reviewRoute', reviewData);
};

export const fetchReviewsByToilet = (toiletId) => {
  return apiClient.get(`/reviewRoute/${toiletId}`);
};

export const deleteReview = (reviewId) => {
  return apiClient.delete(`/reviewRoute/${reviewId}`);
};