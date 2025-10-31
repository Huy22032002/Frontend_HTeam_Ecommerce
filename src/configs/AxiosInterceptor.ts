import axios from "axios";
import store from "../store/store";
import { logout } from "../store/userSlice";

export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token hết hạn hoặc không hợp lệ
        localStorage.removeItem("token");
        store.dispatch(logout());
        
        // Redirect to login
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        } else {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );
};
