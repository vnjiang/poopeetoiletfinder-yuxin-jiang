import apiClient from './apiClient';

export const fetchPendingToilets = () => {
  return apiClient.get('/sharedToiletRoute', {
    params: { approved_by_admin: false },
  });
};

export const approveToilet = (id) => {
  console.log("APPROVE payload = ", { approved_by_admin: true, rejected: false });

  return apiClient.put(`/sharedToiletRoute/${id}`, {
    approved_by_admin: true,
    rejected: false,
  });
};



export const rejectToilet = (id) => {
  return apiClient.put(`/sharedToiletRoute/reject/${id}`);
};
