import axios from "axios";
import { getAdminToken } from "../../utils/tokenUtils";
import type { Product } from "../../models/products/Product";
import type { CreateProduct } from "../../models/products/CreateProduct";
const API_BASE = (import.meta.env.VITE_BASE_URL || "https://www.hecommerce.shop") + "/api";

function getAuthHeader() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const ProductApi = {
  // Lấy danh sách sản phẩm (có phân trang)
  getAll: (page = 0, size = 20) =>
    axios.get(`${API_BASE}/admins/products?page=${page}&size=${size}`, {
      headers: getAuthHeader(),
    }),
  getAllByCategoryId: async (categoryId: number, page = 0, size = 20) => {
    try {
      const response = await axios.get(`${API_BASE}/public/products`, {
        params: { categoryId, page, size },
      });
      if (response.data) {
        console.log("product:", response.data);

        return response.data;
      }
    } catch (error) {
      console.error("Failed to fetch list product variants options:", error);
      return null;
    }
  },
  // Tạo sản phẩm kèm biến thể và tuỳ chọn
  createFull: (data: CreateProduct) =>
    axios.post(`${API_BASE}/admins/products/full-create`, data, {
      headers: getAuthHeader(),
    }),

  // Lấy chi tiết sản phẩm theo id
  getById: (id: number) =>
    axios.get(`${API_BASE}/products/${id}`, { headers: getAuthHeader() }),

  // Tạo sản phẩm mới
  create: (product: Product) =>
    axios.post(`${API_BASE}/admins/products`, product, {
      headers: getAuthHeader(),
    }),

  // Thêm biến thể cho sản phẩm
  createVariant: (productId: number, data: any) =>
    axios.post(`${API_BASE}/products/${productId}/variants`, data, {
      headers: getAuthHeader(),
    }),

  // Cập nhật sản phẩm
  update: (id: number, product: Partial<Product>) =>
    axios.put(`${API_BASE}/products/${id}`, product, {
      headers: getAuthHeader(),
    }),

  // Xoá sản phẩm
  delete: (id: number) =>
    axios.delete(`${API_BASE}/products/${id}`, { headers: getAuthHeader() }),

  // ===== Admin endpoints for variants =====
  // Get product by id (full details)
  getByIdAdmin: (id: number) =>
    axios.get(`${API_BASE}/admins/products/${id}`, { headers: getAuthHeader() }),

  // Get product variant by id (admin only)
  getVariantById: (variantId: number) =>
    axios.get(`${API_BASE}/admins/products/variants/${variantId}`, { headers: getAuthHeader() }),

  // Get product variant by id (public - no auth required)
  getVariantByIdPublic: (variantId: number) =>
    axios.get(`${API_BASE}/public/product/variant/${variantId}`),

  // Get product option by SKU (public - no auth required)
  getOptionBySkuPublic: (sku: string) =>
    axios.get(`${API_BASE}/public/product/option/sku/${sku}`),

  // Create variant for a product
  createVariantForProduct: (productId: number, data: any) =>
    axios.post(`${API_BASE}/${productId}/variants`, data, { headers: getAuthHeader() }),

  // Update variant
  updateVariant: (variantId: number, data: any) =>
    axios.put(`${API_BASE}/admins/products/variants/${variantId}`, data, { headers: getAuthHeader() }),

  // Update all specs (replace)
  updateVariantSpecs: (variantId: number, specs: any) =>
    axios.put(`${API_BASE}/admins/products/variants/${variantId}/specs`, specs, { headers: getAuthHeader() }),

  // Add individual spec (key-value pair)
  addSpecToVariant: (variantId: number, key: string, value: string) =>
    axios.post(`${API_BASE}/admins/products/variants/${variantId}/specs/add`, { key, value }, {
      headers: getAuthHeader(),
    }),

  // Remove individual spec
  removeSpecFromVariant: (variantId: number, key: string) =>
    axios.delete(`${API_BASE}/admins/products/variants/${variantId}/specs?key=${encodeURIComponent(key)}`, { headers: getAuthHeader() }),

  // Delete variant
  deleteVariant: (variantId: number) =>
    axios.delete(`${API_BASE}/admins/products/variants/${variantId}`, { headers: getAuthHeader() }),

  // ===== Admin endpoints for options =====
  // Create option for a variant
  createOptionForVariant: (variantId: number, data: any) =>
    axios.post(`${API_BASE}/variants/${variantId}/options`, data, { headers: getAuthHeader() }),

  // Update option
  updateOption: (optionId: number, data: any) =>
    axios.put(`${API_BASE}/admins/products/variants/options/${optionId}`, data, { headers: getAuthHeader() }),

  // Delete option
  deleteOption: (optionId: number) =>
    axios.delete(`${API_BASE}/admins/products/variants/options/${optionId}`, { headers: getAuthHeader() }),
};
