import { createSlice } from '@reduxjs/toolkit';

export const testSlice = createSlice({
  name: 'testState',
  initialState: { value: null },
  reducers: {
    setValue: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setValue } = testSlice.actions;
export default testSlice.reducer;

