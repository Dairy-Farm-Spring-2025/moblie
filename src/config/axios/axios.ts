import { RootState, store } from '@core/store/store';
import axios from 'axios';
import { updateNewAccessToken } from '@core/store/authSlice';

const baseURL = 'http://34.124.196.11:8080/api/v1';
// Create an Axios instance
const apiClient = axios.create({
  baseURL: baseURL, // Replace with your API's base URL
  timeout: 10000, // Optional timeout in milliseconds
});

const refreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const response = await axios.post(`${baseURL}users/refresh`, refreshToken, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const { accessToken } = response.data.data;
  return accessToken;
};

// Add a request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const state = store.getState();
      const token = state.auth.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Process the response data
    return response.data; // Optionally, return only the data payload
  },
  async (error) => {
    // Handle response errors
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      try {
        const state: RootState = store.getState();
        const user = state.auth;
        const newAccessToken = await refreshToken(user.refreshToken);
        store.dispatch(updateNewAccessToken(newAccessToken));
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (error: any) {
        console.error('Error refreshing token:', error.message);
        return Promise.reject(error);
      }
    } else {
      console.error('Network or server error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
