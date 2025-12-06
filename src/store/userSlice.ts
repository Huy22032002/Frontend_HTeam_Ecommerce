import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ReadableUser } from "../models/user/ReadableUser";

interface UserState {
  user: ReadableUser | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
};

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<ReadableUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = slice.actions;
export default slice.reducer;
