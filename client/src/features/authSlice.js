import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    token: '',
    currentUser: {},
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setisAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    clearAuth: (state) => {
      state.token = '';
      state.currentUser = {};
      state.isAuthenticated = false;
    },
  },
});

export const { 
  setToken, 
  setCurrentUser, 
  setisAuthenticated,
  clearAuth
} = authSlice.actions;
export default authSlice.reducer;
