import axios from "axios";

export const setupAxiosInterceptors = () => {
  // Set default timeout for all axios requests
  axios.defaults.timeout = 10000; // 10 seconds
  
  // Request interceptor để thêm Authorization header
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("[AxiosInterceptor] Added Authorization header for request: " + config.url);
      } else {
        console.log("[AxiosInterceptor] No token found in localStorage for request: " + config.url);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Response interceptor để xử lý errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const url = error.config?.url;
      const method = error.config?.method;
      const message = error.message;
      const errorData = error.response?.data;
      
      console.warn(`[${method?.toUpperCase()}] ${url} - Status: ${status} - ${message}`);
      if (errorData) {
        console.warn("Error Response Data:", errorData);
      }
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED') {
        console.error(`Request timeout: ${url}`);
      }
      
      // Handle 401 errors
      if (status === 401) {
        console.error("401 Unauthorized - Token may be expired or invalid");
        // Optionally remove token from localStorage
        localStorage.removeItem("token");
      }
      
      // Don't intercept 401 - let it propagate to component
      // ProtectedRoute will handle token removal if needed
      return Promise.reject(error);
    }
  );
};





