import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Cart } from "../models/cart/Cart";

interface CartState {
  cart: Cart | null;
}

const initialState: CartState = {
  cart: null,
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
    },
  },
});

export const { setCart, clearCart, updateCartItemQuantity, removeCartItem } =
  cartSlice.actions;
export default cartSlice.reducer;
