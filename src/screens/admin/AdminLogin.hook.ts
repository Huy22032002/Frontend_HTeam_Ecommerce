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
      const { token, id } = response.data || {};

      if (token && id) {
        // 1. Save token to localStorage FIRST
        localStorage.setItem("token", token);
        localStorage.setItem("adminId", id.toString());

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

        // 3. Navigate immediately (don't wait)
        navigate("/admin/dashboard");
        setMessage("Đăng nhập thành công!");

        // 4. Fetch full details in background
        UserApi.getById(id)
          .then((res) => {
            console.log("✅ Fetched full user details - role:", res.data?.role);
            if (res.data) {
              dispatch(loginAction(res.data));
            }
          })
          .catch((err) => console.warn("⚠️ Could not fetch user details:", err));
      } else {
        setError(`Invalid response. Token: ${!!token}, ID: ${id}`);
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || err?.message || "Login failed";
      setError(errorMsg);
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
