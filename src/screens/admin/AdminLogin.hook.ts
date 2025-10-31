import { useState } from "react";
import { UserApi } from "../../api/user/UserApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login as loginAction } from "../../store/userSlice";
import type { UserSummary } from "../../models/dashboard/UserSummary";

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
                localStorage.setItem("token", token);
                
                // Lấy chi tiết người dùng từ ID
                const userDetail = await UserApi.getById(String(id));
                const user = userDetail.data;
                
                // Lưu vào Redux store
                dispatch(loginAction(user));
                
                setMessage("Đăng nhập thành công!");
                
                // Điều hướng tới dashboard sau 1 giây
                setTimeout(() => {
                    navigate("/admin/dashboard");
                }, 1000);
            } else {
                setError("Invalid credentials or server error.");
            }
        } catch (err) {
            setError("Failed to login. Please check your credentials.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (user: Partial<UserSummary>) => {
        setError("");
        setMessage("");
        setIsLoading(true);
        try {
            const res = await UserApi.register(user);
            setMessage("Registration successful.");
            return res.data;
        } catch (err) {
            setError("Registration failed.");
            console.error(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        UserApi.logout();
        navigate("/login");
    };

    const handleForgotPassword = async (phone: string) => {
        setError("");
        setMessage("");
        setIsLoading(true);
        try {
            const res = await UserApi.forgotPassword(phone);
            setMessage("If the phone exists, a reset instruction was sent.");
            return res.data;
        } catch (err) {
            setError("Failed to request password reset.");
            console.error(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (oldPassword: string, newPassword: string) => {
        setError("");
        setMessage("");
        setIsLoading(true);
        try {
            const res = await UserApi.resetPassword(oldPassword, newPassword);
            setMessage("Password updated successfully.");
            return res.data;
        } catch (err) {
            setError("Failed to reset password.");
            console.error(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Admin user management helpers
    const fetchUsers = async (page = 0, size = 20) => {
        setError("");
        setIsLoading(true);
        try {
            const res = await UserApi.getAll(page, size);
            return res.data;
        } catch (err) {
            setError("Failed to fetch users.");
            console.error(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserById = async (id: string) => {
        setError("");
        setIsLoading(true);
        try {
            const res = await UserApi.getById(id);
            return res.data;
        } catch (err) {
            setError("Failed to fetch user.");
            console.error(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const createUser = async (user: Partial<UserSummary>) => {
        setError("");
        setIsLoading(true);
        try {
            const res = await UserApi.create(user);
            setMessage("User created.");
            return res.data;
        } catch (err) {
            setError("Failed to create user.");
            console.error(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = async (id: string, user: Partial<UserSummary>) => {
        setError("");
        setIsLoading(true);
        try {
            const res = await UserApi.update(id, user);
            setMessage("User updated.");
            return res.data;
        } catch (err) {
            setError("Failed to update user.");
            console.error(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteUser = async (id: string) => {
        setError("");
        setIsLoading(true);
        try {
            const res = await UserApi.delete(id);
            setMessage("User deleted.");
            return res.data;
        } catch (err) {
            setError("Failed to delete user.");
            console.error(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
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
        handleRegister,
        handleLogout,
        handleForgotPassword,
        handleResetPassword,
        fetchUsers,
        fetchUserById,
        createUser,
        updateUser,
        deleteUser,
    };
};
