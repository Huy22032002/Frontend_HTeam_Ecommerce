import { useState } from "react";
import { loginFacebook, loginGoogle } from "../../api/customer/CustomerAuth";
import { useNavigate } from "react-router-dom";

const useSignup = () => {
  //navgate
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleLoginFB = async (accessTokenFB: string) => {
    setLoading(true);

    try {
      const loginResponse = await loginFacebook(accessTokenFB);
      if (loginResponse == null) {
        console.log(loginResponse);

        setLoading(false);
        return;
      }

      setLoading(false);

      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không xác định");
      }
      setLoading(false);
    }
  };

  const handleLoginGG = async (jwtGoogleToken: string) => {
    setLoading(true);

    try {
      const loginResponse = await loginGoogle(jwtGoogleToken);

      if (loginResponse == null) {
        setLoading(false);
        return;
      }

      setLoading(false);

      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không xác định");
      }
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    validateEmail,
    error,
    setError,
    loading,
    //handle login oauth
    handleLoginFB,
    handleLoginGG,
  };
};

export default useSignup;
