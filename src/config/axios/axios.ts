import { logout, updateNewAccessToken } from '@core/store/authSlice';
import { RootState, store } from '@core/store/store';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Alert } from 'react-native';

const baseURL = 'https://api.dairyfarmfpt.website/api/v1';
// Create an Axios instance
const apiClient = axios.create({
  baseURL: baseURL,
});

const refreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const response = await axios.post(`${baseURL}/users/refresh`, refreshToken, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const { accessToken } = response.data.data;
  return accessToken;
};

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
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const state: RootState = store.getState();
        const user = state.auth;
        const newAccessToken = await refreshToken(user.refreshToken);
        store.dispatch(updateNewAccessToken(newAccessToken));
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (error: any) {
        store.dispatch(logout());
        Alert.alert('Warning', 'Expired Token');
        (useNavigation() as any).navigate('Login');
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
