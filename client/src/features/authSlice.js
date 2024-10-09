import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: '',
  currentUser: {
    id: '',
    username: '',
    email: '',
    avatar: '',
  },
  roles: [],
  permissions: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = {
        ...state.currentUser,
        ...action.payload,
      }
    },
    setRoles: (state, action) => {
      state.roles = action.payload;
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload;
    },
    clearAuth: state => {
      state.token = initialState.token;
      state.currentUser = initialState.currentUser;
      state.roles = initialState.roles;
      state.permissions = initialState.permissions;
    },
  },
});

export const { 
  setToken, 
  setCurrentUser, 
  setRoles,
  setPermissions,
  clearAuth 
} = authSlice.actions;
export default authSlice.reducer;
