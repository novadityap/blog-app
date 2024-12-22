import axiosBaseQuery from "@/app/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: axiosBaseQuery(),
  endpoints: builder => ({
    searchCategories: builder.query({
      query: (params = {}) => ({
        url: "/categories",
        method: "GET",
        params,
      }),
    }),
    listCategories: builder.query({
      query: () => ({
        url: "/categories/list",
        method: "GET",
      }),
    }),
    showCategory: builder.query({
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
    removeCategory: builder.mutation({
      query: id => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useSearchCategoriesQuery,
  useLazySearchCategoriesQuery,
  useListCategoriesQuery,
  useLazyListCategoriesQuery,
  useShowCategoryQuery,
  useLazyShowCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useRemoveCategoryMutation,
} = categoryApi;

export default categoryApi;