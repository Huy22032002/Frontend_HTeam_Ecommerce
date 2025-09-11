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
    localStorage.setItem("token", loginResponse.token);
    localStorage.setItem("id", loginResponse.id.toString());

    return loginResponse;
  } catch (err: any) {
    console.error("FB Backend login failed", err.response?.data || err.message);
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
    localStorage.setItem("token", loginResponse.token);
    localStorage.setItem("id", loginResponse.id.toString());

    return loginResponse;
  } catch (err: any) {
    console.error("FB Backend login failed", err.response?.data || err.message);
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
    localStorage.setItem("token", loginResponse.token);
    localStorage.setItem("id", loginResponse.id.toString());

    return loginResponse;
  } catch (err: any) {
    console.error("GG Backend login failed", err.response?.data || err.message);
    throw err;
  }
};
