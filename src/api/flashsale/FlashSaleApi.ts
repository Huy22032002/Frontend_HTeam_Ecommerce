import axios from "axios";
import type { PagedResponse } from "../../models/PagedResponse";
import type { FlashSaleItemDTO } from "../../models/flashSale/FlashSaleItemDTO";
import type { CreateFlashSaleDTO } from "../../models/flashSale/CreateFlashSaleDTO";
import type { FlashSaleDTO } from "../../models/flashSale/FlashSaleDTO";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
const API_BASE = import.meta.env.VITE_BASE_URL;

export const FlashSaleApi = {
  getAll: async (page = 0, size = 10): Promise<PagedResponse<FlashSaleDTO>> => {
    const response = await axios.get(`${API_BASE}/api/admins/flash-sale`, {
      params: { page, size },
      headers: getAuthHeader(),
    });
    console.log("list flash sale: ", response.data);

    return response.data;
  },

  // GET LIST ACTIVE FLASH SALE (Public)
  getActiveFlashSale: async (
    page = 0,
    size = 10
  ): Promise<PagedResponse<FlashSaleItemDTO>> => {
    const response = await axios.get(
      `${API_BASE}/api/public/flash-sale/active`,
      {
        params: { page, size },
        headers: getAuthHeader(),
      }
    );
    console.log("list active flash sale items: ", response.data);

    return response.data;
  },

  getActiveFlashSaleItemBySku: async (
    sku: string
  ): Promise<FlashSaleItemDTO | null> => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/public/flash-sale-item/active?sku=${sku}`,
        {
          headers: getAuthHeader(),
        }
      );
      console.log("active flash sale item by sku: ", response.data);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null; // không có flash sale
      }
      throw err;
    }
  },

  // CREATE FlashSale (Admin)
  createFlashSale: async (createFlashSaleDto: CreateFlashSaleDTO) => {
    const response = await axios.post(
      `${API_BASE}/api/admins/flash-sale`,
      createFlashSaleDto,
      { headers: getAuthHeader() }
    );

    return response.data;
  },
};
