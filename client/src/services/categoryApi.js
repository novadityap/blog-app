import axiosBaseQuery from "@/app/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    getCategories: builder.query({
      query: (params = {}) => ({
        url: "/categories",
        method: "GET",
        params,
      }),
    }),
    getCategoryById: builder.query({
      query: id => ({
        url: `/categories/${id}`,
        method: "GET",
      }),
    }),
    createCategory: builder.mutation({
      query: data => ({
        url: "/categories",
        method: "POST",
        data,
      }),
    }),
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        data,
      }),
    }),
    deleteCategory: builder.mutation({
      query: id => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useLazyGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;

export default categoryApi;