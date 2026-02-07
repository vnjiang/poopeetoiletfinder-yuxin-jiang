import axios from 'axios';

const apiClient = axios.create({
    baseURL: "http://localhost:5007/routes", 
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
     config.headers = config.headers ?? {};

    return config;
  },
  (error) => Promise.reject(error)
);


apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
