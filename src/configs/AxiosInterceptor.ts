import axios from "axios";

export const setupAxiosInterceptors = () => {
  // Set default timeout for all axios requests
  axios.defaults.timeout = 10000; // 10 seconds
  
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const url = error.config?.url;
      const method = error.config?.method;
      const message = error.message;
      
      console.warn(`❌ [${method?.toUpperCase()}] ${url} - Status: ${status} - ${message}`);
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED') {
        console.error(`⏱️ Request timeout: ${url}`);
      }
      
      // Don't intercept 401 - let it propagate to component
      // ProtectedRoute will handle token removal if needed
      return Promise.reject(error);
    }
  );
};





