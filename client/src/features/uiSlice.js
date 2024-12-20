import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchTerm: '',
  filters: {
    category: '',
  } 
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    }
  },
});

export const { 
  setSearchTerm, 
  setFilters, 
  clearFilters 
} = uiSlice.actions;
export default uiSlice.reducer;
