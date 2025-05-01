import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchTerm: '',
  filters: {} 
};

const querySlice = createSlice({
  name: 'query',
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
} = querySlice.actions;
export default querySlice.reducer;
