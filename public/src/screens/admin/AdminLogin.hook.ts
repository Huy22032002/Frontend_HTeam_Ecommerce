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
      const loginResponse = await UserApi.login(username, password);
      console.log("🔍 AdminLogin: loginResponse:", loginResponse);
      const { token, id } = loginResponse || {};

      if (token && id) {
        // Token đã được lưu bởi UserApi.login(), nhưng lưu lại để chắc chắn
        localStorage.setItem("admin_token", token);
        localStorage.setItem("adminId", id.toString());
        console.log("✅ Token saved - admin_token:", token.substring(0, 20) + "...");
        console.log("✅ ID saved - adminId:", id);

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
        console.warn("⚠️ Token hoặc ID không có trong loginResponse:", { token, id });
        console.log("📋 localStorage keys:", Object.keys(localStorage).filter(k => k.includes('admin')));
        console.log("📋 localStorage admin_token:", localStorage.getItem('admin_token')?.substring(0, 20) + "...");
        console.log("📋 localStorage adminId:", localStorage.getItem('adminId'));
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
    localStorage.removeItem("admin_token");
    localStorage.removeItem("adminId");
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
