import { getOffersData } from "../lib/getData";
import { ProductData } from "../../types";
import ProductCard from "./ProductCard";
import Link from "next/link";

const OffersProductList = async () => {
    const products: ProductData[] = await getOffersData();

    return (
        <div className="flex flex-col gap-5 pt-5 pb-10">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-medium accent-bar">Las Mejores Ofertas</h2>
                <Link
                    href={"/productos"}
                    className="btn-outline font-medium px-4 py-2 rounded-full text-center"
                >
                    Ver Más
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {products?.map((item) => (
                    <ProductCard key={item?._id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default OffersProductList;
