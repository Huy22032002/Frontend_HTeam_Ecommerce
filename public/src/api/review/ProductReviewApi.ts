const backendEndpoint = import.meta.env.VITE_BASE_URL;
import axios from "axios";
import { getCustomerToken, getAdminToken } from "../../utils/tokenUtils";
import type {
  CreateReviewDto,
  ReadableProductReview,
} from "../../models/products/ProductReview";
import type { PagedResponse } from "../../models/PagedResponse";

function getAuthHeader() {
  const token = getCustomerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const ReviewApi = {
  // CREATE REVIEW
  createReview: async (
    createReviewDto: CreateReviewDto
  ): Promise<ReadableProductReview> => {
    const response = await axios.post(
      `${backendEndpoint}/api/customers/product/review`,
      createReviewDto,
      { headers: getAuthHeader() }
    );

    return response.data;
  },

  //check can review by customer
  checkCanReview: async (customerId: number, sku: string) => {
    try {
      const response = await axios.get(
        `${backendEndpoint}/api/customers/product/review/check-can-review`,
        {
          params: { customerId, sku },
          headers: getAuthHeader(),
        }
      );
      return response.data; //true or false
    } catch (err: any) {
      throw new Error(err.response?.data || err);
    }
  },

  // GET LIST BY PRODUCT VARIANT OPTION
  getListByProductOptionId: async (
    optionId: number,
    page = 0,
    size = 4
  ): Promise<PagedResponse<ReadableProductReview>> => {
    const response = await axios.get(
      `${backendEndpoint}/api/public/product/${optionId}/reviews`,
      {
        params: { page, size },
      }
    );
    console.log("list review of products: ", response.data);

    return response.data;
  },

  // GET CUSTOMER'S REVIEWS
  getByCustomerId: async (
    customerId: number,
    page = 0,
    size = 10
  ): Promise<PagedResponse<ReadableProductReview>> => {
    const response = await axios.get(
      `${backendEndpoint}/api/customers/${customerId}/reviews`,
      {
        params: { page, size },
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // ADMIN – GET ALL REVIEWS
  getAll: async (
    page = 0,
    size = 20
  ): Promise<PagedResponse<ReadableProductReview>> => {
    const response = await axios.get(
      `${backendEndpoint}/api/admins/products/reviews`,
      {
        params: { page, size },
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      }
    );
    return response.data;
  },
};
