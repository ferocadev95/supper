import { NextRequest, NextResponse } from "next/server";
import {
    CategoryProductsResponse,
    isValidCategory,
} from "../../../lib/categoryRows";
import { getCategoryProductsData } from "../../../lib/getData";

const empty: CategoryProductsResponse = { products: [], hasMore: false };

export async function GET(request: NextRequest) {
    const categoria = request.nextUrl.searchParams.get("categoria");

    if (!isValidCategory(categoria)) {
        return NextResponse.json(empty, { status: 200 });
    }

    const rawOffset = Number(request.nextUrl.searchParams.get("offset"));
    const offset =
        Number.isInteger(rawOffset) && rawOffset > 0 ? rawOffset : 0;

    const data = await getCategoryProductsData(categoria, offset);

    return NextResponse.json<CategoryProductsResponse>(data);
}
