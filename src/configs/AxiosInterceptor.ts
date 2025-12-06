import axios from "axios";

// List of public endpoints that should NOT require authentication
const PUBLIC_ENDPOINTS = [
  "/api/promotions/active",
  "/api/promotions/by-product-sku",
  "/api/promotions/",
  "/public/",
];

const isPublicEndpoint = (url: string): boolean => {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

export const setupAxiosInterceptors = () => {
  // Set default timeout for all axios requests
  axios.defaults.timeout = 10000; // 10 seconds
  
  // Request interceptor để thêm Authorization header
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      
      // Only add Authorization header if not a public endpoint
      if (token && !isPublicEndpoint(config.url || "")) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("[AxiosInterceptor] Added Authorization header for request: " + config.url);
      } else if (isPublicEndpoint(config.url || "")) {
        console.log("[AxiosInterceptor] Public endpoint - NO Authorization header for request: " + config.url);
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





