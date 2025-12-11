import axios from "axios";
import { getAdminToken } from "../utils/tokenUtils";

/**
 * Setup axios request interceptor để check admin token
 * Chỉ enforce admin token cho admin endpoints `/admins/*`
 * Skip tất cả: `/customers/*`, `/login`, `/otp`, `/signup` v.v...
 * Chỉ redirect `/admin/login` nếu không có admin token khi vào `/admins/*`
 */
export const setupAdminAxiosInterceptor = () => {
  axios.interceptors.request.use(
    (config) => {
      const url = config.url || "";
      
      // Chỉ check admin token cho `/admins/*` endpoints (trừ login)
      if (url.includes("/admins/") && !url.includes("/admins/login")) {
        const adminToken = getAdminToken();
        
        // Nếu không có admin token, redirect to login
        if (!adminToken) {
          console.warn("No admin_token found in localStorage - redirecting to /admin/login");
          window.location.href = "/admin/login";
          return Promise.reject(new Error("No admin token"));
        }
      }
      
      // Tất cả request khác (customer, public, login) được phép
      return config;
    },
    (error) => Promise.reject(error)
  );
};
