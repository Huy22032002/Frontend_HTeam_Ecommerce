const BASE_URL = import.meta.env.VITE_BASE_URL;

import axios from "axios";

export const fetchUserLogin = async (userId: number) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `${BASE_URL}/private/user-service/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw new Error("unknown error");
  }
};

export const fetchUserById = async (userId: number) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${BASE_URL}/private/user-service/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw new Error("unknown error");
  }
};

export const fetchListUser = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(`${BASE_URL}/private/user-service/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw new Error("unknown error");
  }
};
