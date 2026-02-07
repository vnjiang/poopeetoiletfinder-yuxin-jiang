// sharedToiletService.js
import apiClient from './apiClient';

export const fetchUserSharedToilets = async (userId) => {

  return await apiClient.get(`/sharedToiletRoute/user/${userId}`);
};

export const createSharedToilet = async (payload) => {
  return await apiClient.post(`/sharedToiletRoute`, payload);
};

export const updateSharedToilet = async (id, payload) => {
  return await apiClient.put(`/sharedToiletRoute/${id}`, payload);
};

export const deleteSharedToilet = async (id) => {
  return await apiClient.delete(`/sharedToiletRoute/${id}`);
};