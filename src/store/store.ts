import { configureStore } from "@reduxjs/toolkit";
import customerAuthReducer from "./customerSlice";

const store = configureStore({
  reducer: {
    customerAuth: customerAuthReducer,
  },
});

export default store;

// Kiểu root state của store
export type RootState = ReturnType<typeof store.getState>;
