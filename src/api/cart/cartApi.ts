const backendEndpoint = import.meta.env.VITE_BASE_URL;

import axios from "axios";
import type { Cart } from "../../models/cart/Cart";
import type { CartItem } from "../../models/cart/CartItem";

const token = localStorage.getItem("token");

export const CartApi = {
  getOrCreateByCustomerId: async (customerId: number): Promise<Cart | null> => {
    try {
      const response = await axios.get<Cart>(
        `${backendEndpoint}/api/customers/cart`,
        {
          params: { customerId: customerId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      return null;
    }
  },
  addCartItem: async (
    cartCode: string,
    cartItem: CartItem
  ): Promise<Cart | null> => {
    try {
      const response = await axios.post(
        `${backendEndpoint}/api/customers/cart/${cartCode}/items`,
        cartItem,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to add cart items:", error);
      return null;
    }
  },
  updateCartItemQuantity: async (
    cartCode: string,
    cartItemId: number,
    action: "inc" | "dec"
  ): Promise<Cart | null> => {
    try {
      const response = await axios.put(
        `${backendEndpoint}/api/customers/cart/${cartCode}/items/${cartItemId}`,
        {}, // body để trống
        {
          params: { action: action },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update cart item quantity:", error);
      return null;
    }
  },
  deleteCartItem: async (
    cartCode: string,
    itemId: number
  ): Promise<Cart | null> => {
    try {
      const response = await axios.delete(
        `${backendEndpoint}/api/customers/cart/${cartCode}/items/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // trả về cart mới
    } catch (error) {
      console.error("Failed to delete cart item:", error);
      return null;
    }
  },
};
