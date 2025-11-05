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
        // Save token
        localStorage.setItem("token", token);

        // // Dispatch initial user info
        // dispatch(loginAction({
        //     id,
        //     username,
        //     name: username,
        //     emailAddress: "",
        //     gender: false,
        //     dateOfBirth: new Date(),
        //     anonymous: false,
        //     roles: []
        // }));

        setMessage("Đăng nhập thành công!");

        // Fetch full user details
        try {
          const userDetailRes = await UserApi.getById(id);
          if (userDetailRes.data) {
            dispatch(loginAction(userDetailRes.data));
          }
        } catch (err) {
          console.warn("Could not fetch admin details:", err);
          // User still logged in with minimal info - that's ok
        }

        // Navigate to dashboard
        setTimeout(() => navigate("/admin/dashboard"), 300);
      } else {
        setError("Invalid credentials or server error.");
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
