import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'https://api.example.com', // Replace with your API's base URL
  timeout: 10000, // Optional timeout in milliseconds
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add headers or modify request configuration
    const token = 'your-auth-token'; // Retrieve your token from storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    // Handle response errors
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      if (error.response.status === 401) {
        // Handle unauthorized errors (e.g., token expired)
        console.log('Unauthorized! Redirecting to login...');
      }
    } else {
      console.error('Network or server error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
