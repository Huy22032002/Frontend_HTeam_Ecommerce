import { useState } from "react";
import {
  login,
  loginFacebook,
  loginGoogle,
} from "../../api/customer/CustomerAuth";
import { useNavigate } from "react-router-dom";
import type { AuthRequest } from "../../models/auths/AuthRequest";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [messsage, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  //login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLoginFB = async (accessTokenFB: string) => {
    setLoading(true);
    setSuccess(false);

    try {
      const loginResponse = await loginFacebook(accessTokenFB);
      if (loginResponse == null) {
        console.log(loginResponse);

        setSuccess(false);
        setError(true);
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccess(true);

      // đợi 1.5s rồi mới chuyển trang
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: unknown) {
      setSuccess(false);
      setLoading(false);
      if (err instanceof Error) {
        setError(true);
        setMessage(err.message || "Đăng nhập thất bại");
      } else {
        setMessage("Đã xảy ra lỗi không xác định");
      }
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setSuccess(false);

    const data: AuthRequest = {
      username: username,
      password: password,
    };

    try {
      const loginResponse = await login(data);

      if (loginResponse == null) {
        setSuccess(false);
        setError(true);
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: unknown) {
      setSuccess(false);
      setLoading(false);
      if (err instanceof Error) {
        setError(true);
        setMessage(err.message || "Đăng nhập thất bại");
      } else {
        setMessage("Đã xảy ra lỗi không xác định");
      }
    }
  };

  const handleLoginGG = async (jwtGoogleToken: string) => {
    setLoading(true);
    setSuccess(false);

    try {
      const loginResponse = await loginGoogle(jwtGoogleToken);

      if (loginResponse == null) {
        setSuccess(false);
        setError(true);
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: unknown) {
      setSuccess(false);
      setLoading(false);
      if (err instanceof Error) {
        setError(true);
        setMessage(err.message || "Đăng nhập thất bại");
      } else {
        setMessage("Đã xảy ra lỗi không xác định");
      }
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    //handle login
    handleLoginFB,
    handleLoginGG,
    handleLogin,
    //sub
    loading,
    setLoading,
    error,
    setError,
    success,
    setSuccess,
    messsage,
  };
};

export default useLogin;
