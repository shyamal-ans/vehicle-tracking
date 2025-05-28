// import { testSlice } from '@/slices/testSlice';
// import { configureStore } from '@reduxjs/toolkit';

// export const store = configureStore({
//   reducer: {
//     testState: testSlice.reducer,
//   },
// });

// export type AppDispatch = typeof store.dispatch;
// export type RootState = ReturnType<typeof store.getState>;


import { apiSlice } from '@/slices/apiSlice';
import { testSlice } from '@/slices/testSlice';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    testState: testSlice.reducer,
    [apiSlice.reducerPath]: apiSlice.reducer,  // Add api reducer here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware), // Add api middleware here
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
