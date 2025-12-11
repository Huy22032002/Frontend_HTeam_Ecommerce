import axios from "axios";
import { getAdminToken } from "../utils/tokenUtils";

// API endpoints that don't require admin token check (like login)
const SKIP_TOKEN_CHECK_ENDPOINTS = [
  "/admins/login",
];

const shouldSkipTokenCheck = (url: string): boolean => {
  return SKIP_TOKEN_CHECK_ENDPOINTS.some(endpoint => url?.includes(endpoint));
};

/**
 * Setup axios request interceptor để check admin token trước khi gọi API
 * Nếu không có admin_token trong localStorage, redirect to /admin/login
 * Ngoại lệ: login APIs không cần check token
 */
export const setupAdminAxiosInterceptor = () => {
  axios.interceptors.request.use(
    (config) => {
      // Skip token check cho login endpoints
      if (shouldSkipTokenCheck(config.url || "")) {
        console.log("Skipping token check for:", config.url);
        return config;
      }
      
      const adminToken = getAdminToken();
      
      // Nếu không có admin token, redirect to login
      if (!adminToken) {
        console.warn("No admin_token found in localStorage - redirecting to /admin/login");
        window.location.href = "/admin/login";
        return Promise.reject(new Error("No admin token"));
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );
};
