import axios from "axios";
const API_BASE = import.meta.env.VITE_BASE_URL + "/api";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const CloudApi = {
  uploadImages: async (formData: FormData): Promise<string[] | null> => {
    try {
      const response = await axios.post(
        `${API_BASE}/public/files/upload/image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data as string[];
    } catch (error) {
      console.error("Failed to upload images:", error);
      return null;
    }
  },
};
