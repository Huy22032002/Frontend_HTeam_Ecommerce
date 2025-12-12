import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";

interface Banner {
  id?: number;
  title: string;
  imageUrl: string;
  description?: string;
  displayOrder: number;
  active: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const useBannerApi = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy banner đang hoạt động (cho frontend)
  const getActiveBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/banners`);
      setBanners(response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy tất cả banner (cho admin)
  const getAllBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/banners/admin/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setBanners(response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy banner theo ID
  const getBannerById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/banners/${id}`);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo banner mới
  const createBanner = useCallback(async (banner: Banner) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/banners/admin`, banner, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      setBanners((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật banner
  const updateBanner = useCallback(async (id: number, banner: Banner) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_BASE}/banners/admin/${id}`, banner, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? response.data : b))
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Xoá banner
  const deleteBanner = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE}/banners/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bật/tắt banner
  const toggleBannerStatus = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.patch(
        `${API_BASE}/banners/admin/${id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? response.data : b))
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật thứ tự hiển thị
  const updateDisplayOrder = useCallback(async (id: number, order: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.patch(
        `${API_BASE}/banners/admin/${id}/order?order=${order}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? response.data : b))
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    banners,
    loading,
    error,
    getActiveBanners,
    getAllBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    updateDisplayOrder,
  };
};
