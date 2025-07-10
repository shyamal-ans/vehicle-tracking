
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '', // You can add a fallback base URL
    prepareHeaders(headers) {
      return headers;
    },
  }),
  tagTypes: ["vehicle_details", "stored_vehicle_details"],
  endpoints: () => ({}),
});

