// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


// export const apiSlice = createApi({
//   reducerPath: "api",
//   baseQuery: fetchBaseQuery({
//     baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
//     prepareHeaders(headers) {
//       return headers;
//     },
//   }),
//   tagTypes: ["vehicle_details"],
//   endpoints: () => ({}),
// });

// // export const apiSlice = createApi({
// //   reducerPath: 'api',
// //   baseQuery: fetchBaseQuery({
// //     baseUrl: 'http://13.232.146.139:8087/billingservice/',
// //     headers: {
// //       'Content-Type': 'application/json',
// //     },
// //   }),
// //   endpoints: (builder) => ({
// //     getVehicleDetails: builder.mutation<VehicleAPIResponse, VehiclePostParams>({
// //       query: (postData) => ({
// //         url: 'admin/vehicle_details',
// //         method: 'POST',
// //         body: postData,  // <-- now dynamic
// //       }),
// //     }),
// //   }),
// // });

// // export const { useGetVehicleDetailsMutation } = apiSlice;


import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '', // You can add a fallback base URL
    prepareHeaders(headers) {
      return headers;
    },
  }),
  tagTypes: ["vehicle_details"],
  endpoints: () => ({}),
});

