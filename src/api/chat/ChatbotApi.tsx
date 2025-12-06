import axios from "axios";
const backendEndpoint = import.meta.env.VITE_BASE_URL;

export const ChatbotApi = {
  sendMessage: async (customerId: number | null, text: string) => {
    const res = await axios.post(
      `${backendEndpoint}/api/public/chatbot${
        customerId ? `?userId=${customerId}` : ""
      }`,
      {
        message: text,
      }
    );
    console.log("AI tra loi: ", res.data.response);
    return res.data.response;
  },
};
