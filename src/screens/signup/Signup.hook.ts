import { useState } from "react";
import { loginFacebook, loginGoogle } from "../../api/customer/CustomerAuth";
import { useNavigate } from "react-router-dom";
import { OTPApi } from "../../api/OtpApi";

const useSignup = () => {
  //navigate
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePhone = (value: string) => {
    const regex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
    return regex.test(value);
  };

  //đăng ký = sđt
  const handleSignUpPhone = async () => {
    if (!phone || error) return;

    try {
      const res = await OTPApi.sendOtp(phone);
      console.log(res);
      navigate("/otp", { state: { phone } });
    } catch (error: any) {
      console.error("Lỗi gửi OTP:", error);
      setError(error.message);
    }
  };

  //-------------

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
    phone,
    setPhone,
    validatePhone,
    error,
    setError,
    loading,
    //handle login oauth
    handleLoginFB,
    handleLoginGG,
    //signup
    handleSignUpPhone,
  };
};

export default useSignup;
