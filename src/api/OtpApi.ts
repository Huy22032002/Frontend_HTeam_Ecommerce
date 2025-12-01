import axios from "axios";
const API_BASE = import.meta.env.VITE_BASE_URL + "/api";

export const OTPApi = {
  sendOtp: async (phone: string) => {
    try {
      const response = await axios.post(
        `${API_BASE}/public/otp/send/sms`,
        null,
        { params: { phone } }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data);
      }
      // (network, server chết,…)
      throw new Error("Không thể kết nối tới server");
    }
  },
  verifyOtp: async (phone: string, code: string) => {
    console.log("phone gui di: ", phone, "otp: ", code);

    try {
      const res = await axios.post(`${API_BASE}/public/otp/verify`, null, {
        params: { phone, code },
      });

      // Nếu backend trả 200 → OK
      return true;
    } catch (err: any) {
      // Nếu backend trả 400 hoặc lỗi khác
      console.log("OTP VERIFY ERROR:", err.response?.data || err.message);
      return false;
    }
  },
};
