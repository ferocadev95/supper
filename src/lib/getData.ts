import { ProductData } from "../../types";
import { client } from "../sanity/lib/client";
import {
  CATEGORY_ROW_PAGE_SIZE,
  CATEGORY_ROW_REVALIDATE_SECONDS,
  CategoryProductsResponse,
} from "./categoryRows";
import {
  bannerQuery,
  bestSellerQuery,
  categoriesQuery,
  categoryProductsQuery,
  offersQuery,
  productsQuery,
} from "./query";

export const revalidate = 0;

const getBannersData = async () => {
  const bannersData = await client.fetch(bannerQuery);
  return bannersData;
};

const getProductsData = async () => {
  const productsData = await client.fetch(productsQuery);
  return productsData;
};

const getBestSellersData = async () => {
  const bestSellersData = await client.fetch(bestSellerQuery);
  return bestSellersData;
};

const getOffersData = async () => {
  const offersData = await client.fetch(offersQuery);
  return offersData;
};

const getCategoriesData = async () => {
  const categoriesData = await client.fetch(categoriesQuery);
  return categoriesData;
};

const getCategoryProductsData = async (
  categoria: string,
  offset = 0,
): Promise<CategoryProductsResponse> => {
  const start = Math.max(0, offset);
  const end = start + CATEGORY_ROW_PAGE_SIZE + 1;

  const fetched = await client.fetch<ProductData[]>(
    categoryProductsQuery,
    { categoria, start, end },
    { next: { revalidate: CATEGORY_ROW_REVALIDATE_SECONDS } },
  );

  return {
    products: fetched.slice(0, CATEGORY_ROW_PAGE_SIZE),
    hasMore: fetched.length > CATEGORY_ROW_PAGE_SIZE,
  };
};

export {
  getBannersData,
  getProductsData,
  getBestSellersData,
  getOffersData,
  getCategoriesData,
  getCategoryProductsData,
};
