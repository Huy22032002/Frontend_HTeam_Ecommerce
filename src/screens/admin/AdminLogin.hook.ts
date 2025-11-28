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
        console.log("🔐 Login successful - token:", token?.substring(0, 20) + "...", "id:", id);

        // 1. Save token to localStorage FIRST
        localStorage.setItem("token", token);
        localStorage.setItem("adminId", id.toString());
        console.log("✅ Saved to localStorage");

        // 2. Dispatch user to Redux
        const userData = {
          id,
          username,
          name: username,
          emailAddress: "",
          gender: null,
          dateOfBirth: null,
          anonymous: false,
          role: ["ADMIN"]
        };
        dispatch(loginAction(userData));
        console.log("✅ Dispatched to Redux with user id:", id);

        // 3. Navigate immediately (don't wait)
        console.log("📍 Navigating to dashboard NOW");
        navigate("/admin/dashboard");
        setMessage("Đăng nhập thành công!");

        // 4. Fetch full details in background
        UserApi.getById(id)
          .then((res) => {
            console.log("✅ Fetched full user details");
            if (res.data) dispatch(loginAction(res.data));
          })
          .catch((err) => console.warn("⚠️ Could not fetch user details:", err));
      } else {
        setError(`Invalid response. Token: ${!!token}, ID: ${id}`);
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
