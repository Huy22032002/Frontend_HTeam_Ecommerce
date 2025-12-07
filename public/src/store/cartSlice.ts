import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Cart } from "../models/cart/Cart";

interface CartState {
  cart: Cart | null;
  itemPromotions: Record<number, any>; // itemId -> promotion
}

const initialState: CartState = {
  cart: null,
  itemPromotions: {},
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
    },
    clearCart: (state) => {
      state.cart = null;
    },
    setItemPromotions: (state, action: PayloadAction<Record<number, any>>) => {
      state.itemPromotions = action.payload;
    },
    setItemPromotion: (state, action: PayloadAction<{ itemId: number; promotion: any }>) => {
      state.itemPromotions[action.payload.itemId] = action.payload.promotion;
    },
    removeItemPromotion: (state, action: PayloadAction<{ itemId: number }>) => {
      delete state.itemPromotions[action.payload.itemId];
    },
    clearItemPromotions: (state) => {
      state.itemPromotions = {};
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      if (!state.cart) return;

      const item = state.cart.items?.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    removeCartItem: (state, action: PayloadAction<{ id: number }>) => {
      if (!state.cart) return;

      state.cart.items = state.cart.items?.filter(
        (i) => i.id !== action.payload.id
      );
      // Also remove promotion for this item
      delete state.itemPromotions[action.payload.id];
    },
  },
});

export const {
  setCart,
  clearCart,
  setItemPromotions,
  setItemPromotion,
  removeItemPromotion,
  clearItemPromotions,
  updateCartItemQuantity,
  removeCartItem,
} = cartSlice.actions;
export default cartSlice.reducer;
