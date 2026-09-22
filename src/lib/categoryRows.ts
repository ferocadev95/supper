import { ProductData } from "../../types";
import { PRODUCT_CATEGORIES } from "../constants";

export const HOME_CATEGORY_ROWS = ["frutas-y-verduras", "abarrotes"];

export const CATEGORY_ROW_PAGE_SIZE = 12;

export const CATEGORY_ROW_REVALIDATE_SECONDS = 300;

export interface CategoryProductsResponse {
    products: ProductData[];
    hasMore: boolean;
}

export const isValidCategory = (value: string | null): value is string =>
    !!value && PRODUCT_CATEGORIES.some((category) => category.value === value);

export const categoryLabel = (value: string): string =>
    PRODUCT_CATEGORIES.find((category) => category.value === value)?.label ??
    value;
