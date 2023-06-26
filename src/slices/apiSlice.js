import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const { REACT_APP_WBMS_BACKEND_API_URL } = process.env;

const baseQuery = fetchBaseQuery({
  baseUrl: `${REACT_APP_WBMS_BACKEND_API_URL}`,
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["wbms"],
  endpoints: (builder) => ({}),
});
