import { apiSlice } from "./apiSlice";

const API_URL = "/auth";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signin: builder.mutation({
      query: (data) => ({
        url: `${API_URL}/signin`,
        method: "POST",
        body: data,
      }),
    }),
    signout: builder.mutation({
      query: (data) => ({
        url: `${API_URL}/signout`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      }),
    }),
  }),
});

export const { useSigninMutation, useSignoutMutation } = authApiSlice;
