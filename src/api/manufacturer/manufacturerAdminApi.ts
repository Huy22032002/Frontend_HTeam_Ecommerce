const API_BASE = import.meta.env.VITE_BASE_URL + "/api";

import axios from "axios";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const ManufacturerAdminApi = {
  create: async (payload: any): Promise<any | null> => {
    try {
      const response = await axios.post(
        `${API_BASE}/admins/manufacturer`,
        payload,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create manufacturer:", error);
      return null;
    }
  },

  getAllForAdmin: async (): Promise<any[]> => {
    try {
      const res = await axios.get(`${API_BASE}/admins/manufacturers`, {
        headers: getAuthHeader(),
      });
      return res.data || [];
    } catch (err) {
      console.error("Failed to fetch manufacturers for admin:", err);
      return [];
    }
  },

  getById: async (id: number): Promise<any | null> => {
    try {
      const res = await axios.get(`${API_BASE}/admins/manufacturer/${id}`, {
        headers: getAuthHeader(),
      });
      return res.data;
    } catch (err) {
      console.error("Failed to fetch manufacturer:", err);
      return null;
    }
  },

  update: async (id: number, payload: any): Promise<any | null> => {
    try {
      const res = await axios.put(`${API_BASE}/admins/manufacturer/${id}`, payload, {
        headers: getAuthHeader(),
      });
      return res.data;
    } catch (err) {
      console.error("Failed to update manufacturer:", err);
      return null;
    }
  },

  toggleStatus: async (id: number): Promise<any | null> => {
    try {
      const res = await axios.put(`${API_BASE}/admins/manufacturer/${id}/toggle-status`, {}, {
        headers: getAuthHeader(),
      });
      return res.data;
    } catch (err) {
      console.error("Failed to toggle manufacturer status:", err);
      return null;
    }
  },

  deactivate: async (id: number): Promise<boolean> => {
    try {
      await axios.delete(`${API_BASE}/admins/manufacturer/${id}`, {
        headers: getAuthHeader(),
      });
      return true;
    } catch (err) {
      console.error("Failed to deactivate manufacturer:", err);
      return false;
    }
  },
};
