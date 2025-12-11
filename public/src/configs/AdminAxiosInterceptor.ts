import axios from "axios";
import { getAdminToken } from "../utils/tokenUtils";

// API endpoints that don't require admin token check (like login)
const SKIP_TOKEN_CHECK_ENDPOINTS = [
  "/admins/login",
  "/customers/",  // Skip check for customer endpoints
];

const shouldSkipTokenCheck = (url: string): boolean => {
  return SKIP_TOKEN_CHECK_ENDPOINTS.some(endpoint => url?.includes(endpoint));
};

/**
 * Setup axios request interceptor để check admin token trước khi gọi API
 * Chỉ check admin token cho endpoints `/admins/*`
 * Skip check cho `/customers/*`, `/login`, v.v...
 */
export const setupAdminAxiosInterceptor = () => {
  axios.interceptors.request.use(
    (config) => {
      // Skip token check cho customer endpoints hoặc login endpoints
      if (shouldSkipTokenCheck(config.url || "")) {
        console.log("Skipping admin token check for:", config.url);
        return config;
      }
      
      // Chỉ check admin token cho admin endpoints
      if (config.url?.includes("/admins/")) {
        const adminToken = getAdminToken();
        
        // Nếu không có admin token, redirect to login
        if (!adminToken) {
          console.warn("No admin_token found in localStorage - redirecting to /admin/login");
          window.location.href = "/admin/login";
          return Promise.reject(new Error("No admin token"));
        }
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );
};
