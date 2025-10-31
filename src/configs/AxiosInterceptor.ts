import axios from "axios";
import store from "../store/store";
import { logout } from "../store/userSlice";

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
      
      if (status === 401) {
        const token = localStorage.getItem("token");
        console.warn(`⚠️ 401 Unauthorized detected`);
        console.warn(`   Token in storage: ${token ? "✅ EXISTS" : "❌ MISSING"}`);
        console.warn(`   URL: ${url}`);
        
        // Only logout if token exists AND it's not a login request
        // This prevents logout during login process
        if (token && !url?.includes("/login")) {
          console.error(`🔴 Token is invalid, removing and redirecting to login`);
          localStorage.removeItem("token");
          store.dispatch(logout());
          
          // Redirect to login
          if (window.location.pathname.startsWith("/admin")) {
            window.location.href = "/admin/login";
          } else {
            window.location.href = "/login";
          }
        } else if (!token) {
          console.warn(`⚠️ No token found on 401, user is already logged out`);
        }
      }
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED') {
        console.error(`⏱️ Request timeout: ${url}`);
      }
      
      return Promise.reject(error);
    }
  );
};



