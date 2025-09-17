import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "user",
  initialState: {
    userId: null,
    email: null,
  },
  reducers: {
    login: (state, action) => {
      state.userId = action.payload.id;
      state.email = action.payload.email;
    },
    logout: (state) => {
      state.userId = null;
      state.email = null;
    },
  },
});

export const { login, logout } = slice.actions;
export default slice.reducer;
