import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// 1. Define a type for the user
interface User {
  email: string;
  password: string;
}

// 2. Define the initial state type
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
export const loginUser = createAsyncThunk<User, User>(
  "auth/loginUser",
  async (credentials: { email: string; password: string }) => {
    // Here you can call your API
    console.log("Mock API Call:", credentials);
    return credentials;
  }
);
// 4. Initial state
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};
const loginSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state) => {
        state.loading = false;
        state.error = "Login failed";
      });
  },
});

export default loginSlice.reducer;
