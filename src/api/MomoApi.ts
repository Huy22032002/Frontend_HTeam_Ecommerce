import axios from "axios";
import type { MomoDTO } from "../models/MomoDTO";
const API_BASE = import.meta.env.VITE_BASE_URL + "/api";

export const MomoApi = {
  createQRCode: async (amount: number, orderId: number, orderInfo: string) => {
    const data: MomoDTO = {
      amount: amount,
      orderId: orderId.toString(),
      orderInfo: orderInfo,
    };

    try {
      const response = await axios.post(`${API_BASE}/public/momo/create`, data);
      return response.data;
    } catch (error) {
      console.error("Failed to create QR Code:", error);
      throw error;
    }
  },
};
