import { useState } from "react";
import { UserApi } from "../../api/user/UserApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  login as loginAction,
  logout as logoutAction,
} from "../../store/userSlice";

export const useAdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await UserApi.login(username, password);
      console.log("Login response:", response.data);  // DEBUG
      const { token, id } = response.data || {};
      console.log("Extracted token:", token, "id:", id);  // DEBUG

      if (token && id) {
        // Save token AND adminId
        localStorage.setItem("token", token);
        localStorage.setItem("adminId", id.toString());  // Save adminId!
        console.log("Saved to localStorage - token and adminId:", id);

        // Dispatch initial user info (with minimal data from login response)
        dispatch(loginAction({
            id,
            username,
            name: username,
            emailAddress: "",
            gender: false,
            dateOfBirth: new Date(),
            anonymous: false,
            roles: ["ADMIN"]
        }));
        console.log("Dispatched loginAction with id:", id);

        setMessage("Đăng nhập thành công!");

        // Fetch full user details and update Redux
        try {
          const userDetailRes = await UserApi.getById(id);
          console.log("User details:", userDetailRes.data);  // DEBUG
          if (userDetailRes.data) {
            dispatch(loginAction(userDetailRes.data));
            console.log("Updated Redux with full user details");
          }
        } catch (err) {
          console.warn("Could not fetch admin details:", err);
          // User still logged in with minimal info - that's ok
        }

        // Navigate to dashboard
        setTimeout(() => navigate("/admin/dashboard"), 300);
      } else {
        setError(`Invalid credentials or server error. Token: ${token}, ID: ${id}`);
        console.log("Missing token or id in response:", response.data);  // DEBUG
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || err?.message || "Login failed";
      setError(errorMsg);
      console.error("Login error:", err);  // DEBUG
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logoutAction());
    navigate("/admin/login");
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    error,
    message,
    isLoading,
    handleLogin,
    handleLogout,
  };
};
