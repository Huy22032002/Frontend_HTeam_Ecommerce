const backendEndpoint = import.meta.env.VITE_BASE_URL;

import axios from "axios";

import type { FacebookAuthRequest } from "../../models/auths/OAuth2AuthRequest";
import type { LoginResponse } from "../../models/auths/LoginResponse";
import type { AuthRequest } from "../../models/auths/AuthRequest";

export const loginFacebook = async (
  accessTokenFB: string
): Promise<LoginResponse> => {
  try {
    const data: FacebookAuthRequest = { accessToken: accessTokenFB };

    const r = await axios.post(
      `${backendEndpoint}/api/customers/login/facebook`,
      data,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    const loginResponse: LoginResponse = r.data;

    if (loginResponse) {
      localStorage.setItem("customer_token", loginResponse.token);
      localStorage.setItem("customer_id", loginResponse.id.toString());
      console.log("✅ FB Login: Saved customer_token and customer_id");
    }
    return loginResponse;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorData = err.response?.data as any;
      const errorMessage = errorData?.errorMessage || errorData?.message || err.message || "Đăng nhập thất bại";
      const error = new Error(errorMessage);
      throw error;
    } else if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Lỗi không xác định");
    }
  }
};

export const login = async (authRequest: AuthRequest) => {
  try {
    const r = await axios.post(
      `${backendEndpoint}/api/customers/login`,
      authRequest,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    const loginResponse: LoginResponse = r.data;
    if (loginResponse) {
      localStorage.setItem("customer_token", loginResponse.token);
      localStorage.setItem("customer_id", loginResponse.id.toString());
      console.log("✅ Customer Login: Saved customer_token and customer_id");
    }

    return loginResponse;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorData = err.response?.data as any;
      const errorMessage = errorData?.errorMessage || errorData?.message || err.message || "Đăng nhập thất bại";
      const error = new Error(errorMessage);
      throw error;
    }
    throw err;
  }
};

export const loginGoogle = async (jwtGoogleToken: string) => {
  try {
    const data: FacebookAuthRequest = {
      accessToken: jwtGoogleToken,
    };

    const r = await axios.post(
      `${backendEndpoint}/api/customers/login/google`,
      data,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    const loginResponse: LoginResponse = r.data;
    if (loginResponse) {
      localStorage.setItem("customer_token", loginResponse.token);
      localStorage.setItem("customer_id", loginResponse.id.toString());
      console.log("✅ Google Login: Saved customer_token and customer_id");
    }

    return loginResponse;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorData = err.response?.data as any;
      const errorMessage = errorData?.errorMessage || errorData?.message || err.message || "Đăng nhập thất bại";
      const error = new Error(errorMessage);
      throw error;
    } else if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Lỗi không xác định");
    }
  }
};

export const signUpByPhone = async (phone: string, password: string) => {
  const data = {
    phone,
    password,
  };

  try {
    const r = await axios.post(
      `${backendEndpoint}/api/public/signUpByPhone`,
      data,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    const loginResponse: LoginResponse = r.data;
    if (loginResponse) {
      localStorage.setItem("customer_token", loginResponse.token);
      localStorage.setItem("customer_id", loginResponse.id.toString());
      console.log("✅ SignUp by Phone: Saved customer_token and customer_id");
    }

    return loginResponse;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      throw new Error(err.response.data?.message || "Lỗi server");
    }
    throw new Error("Không thể kết nối server");
  }
};
