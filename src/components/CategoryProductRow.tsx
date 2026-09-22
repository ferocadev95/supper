import Link from "next/link";
import { categoryLabel } from "../lib/categoryRows";
import { getCategoryProductsData } from "../lib/getData";
import HorizontalProductScroller from "./HorizontalProductScroller";

const CategoryProductRow = async ({ categoria }: { categoria: string }) => {
    const { products, hasMore } = await getCategoryProductsData(categoria, 0);

    if (!products?.length) return null;

    return (
        <div className="flex flex-col gap-5 pt-5 pb-10">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-medium accent-bar">
                    {categoryLabel(categoria)}
                </h2>
                <Link
                    href={`/productos?categoria=${categoria}`}
                    className="btn-outline font-medium px-4 py-2 rounded-full text-center"
                >
                    Ver Más
                </Link>
            </div>
            <HorizontalProductScroller
                categoria={categoria}
                initialProducts={products}
                initialHasMore={hasMore}
            />
        </div>
    );
};

export default CategoryProductRow;
