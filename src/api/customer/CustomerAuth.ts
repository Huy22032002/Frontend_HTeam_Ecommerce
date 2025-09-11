const backendEndpoint = import.meta.env.VITE_BASE_URL;

import axios from "axios";

import type { FacebookAuthRequest } from "../../models/auths/FacebookAuthRequest";
import type { LoginResponse } from "../../models/auths/LoginResponse";

export const loginFacebook = async (accessTokenFB: string) => {
  const data: FacebookAuthRequest = {
    accessToken: accessTokenFB,
  };
  axios
    .post(`${backendEndpoint}/api/customers/login/facebook`, data, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    })
    .then((r) => {
      const loginResponse: LoginResponse = r.data;
      localStorage.setItem("token", loginResponse.token);
      localStorage.setItem("id", loginResponse.id.toString());

      alert("LOGIN SUCCESS with FB");
    })
    .catch((err) => console.error("FB Backend login failed", err));
};
