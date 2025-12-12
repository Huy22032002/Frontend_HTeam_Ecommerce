import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ReadableCustomer } from "../models/customer/ReadableCustomer";

interface AuthState {
  customer: ReadableCustomer | null;
}

const initialState: AuthState = {
  customer: null,
};

const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<ReadableCustomer>) => {
      state.customer = action.payload;
    },
    logout: (state) => {
      state.customer = null;
      localStorage.removeItem("customer_token");
      localStorage.removeItem("customer_id");
    },
  },
});

export const { login, logout } = customerAuthSlice.actions;

// Selectors
export const selectCustomer = (state: { customerAuth: AuthState }) => state.customerAuth.customer;
export const selectCustomerId = (state: { customerAuth: AuthState }) => state.customerAuth.customer?.id;

export default customerAuthSlice.reducer;
