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
      localStorage.setItem("token", loginResponse.token);
      localStorage.setItem("id", loginResponse.id.toString());
    }
    return loginResponse;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "OAuth2 Backend login failed",
        err.response?.data || err.message
      );
    } else if (err instanceof Error) {
      console.error("OAuth2 Backend login failed", err.message);
    } else {
      console.error("OAuth2 Backend login failed", String(err));
    }
    throw err;
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
      localStorage.setItem("token", loginResponse.token);
      localStorage.setItem("id", loginResponse.id.toString());
    }

    return loginResponse;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data;
    }
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
      localStorage.setItem("token", loginResponse.token);
      localStorage.setItem("id", loginResponse.id.toString());
    }

    return loginResponse;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "OAuth2 Backend login failed",
        err.response?.data || err.message
      );
    } else if (err instanceof Error) {
      console.error("OAuth2 Backend login failed", err.message);
    } else {
      console.error("OAuth2 Backend login failed", String(err));
    }
    throw err;
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
      localStorage.setItem("token", loginResponse.token);
      localStorage.setItem("id", loginResponse.id.toString());
    }

    return loginResponse;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      throw new Error(err.response.data?.message || "Lỗi server");
    }
    throw new Error("Không thể kết nối server");
  }
};
