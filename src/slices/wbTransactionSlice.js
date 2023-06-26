import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  adis: localStorage.getItem("adis")
    ? JSON.parse(localStorage.getItem("adis"))
    : null,
};

const authSlice = createSlice({
  name: "wbTransaction",
  initialState,
  reducers: {
    setAdis: (state, action) => {
      state.adis = action.payload;
      localStorage.setItem("adis", JSON.stringify(action.payload));
    },
    clearAdis: (state, action) => {
      state.edispatch = null;
      localStorage.removeItem("adis");
    },
  },
});

export const { setAdis, clearAdis } = authSlice.actions;
export default authSlice.reducer;
