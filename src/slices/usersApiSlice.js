import { apiSlice } from "./apiSlice";

const API_ENDPOINT = "/users";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.mutation({
      query: (data) => ({
        url: `${API_ENDPOINT}`,
        method: "GET",
      }),
    }),
  }),
});
