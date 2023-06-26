import { configureStore } from "@reduxjs/toolkit";

import appReducer from "./slices/appSlice";
import wbTransactionReducer from "./slices/wbTransactionSlice";
import { apiSlice } from "./slices/apiSlice";

const store = configureStore({
  reducer: {
    app: appReducer,
    wbTransaction: wbTransactionReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;
