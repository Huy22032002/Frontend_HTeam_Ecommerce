import { configureStore } from "@reduxjs/toolkit";
import customerAuthReducer from "./customerSlice";
import cartReducer from "./cartSlice";
import userAuthReducer from "./userSlice";

const store = configureStore({
  reducer: {
    customerAuth: customerAuthReducer,
    cart: cartReducer,
    userAuth: userAuthReducer,
  },
});

export default store;

// Kiểu root state của store
export type RootState = ReturnType<typeof store.getState>;
