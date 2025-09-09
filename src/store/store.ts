import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;

// Kiểu root state của store
export type RootState = ReturnType<typeof store.getState>;
