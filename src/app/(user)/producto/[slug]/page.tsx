import { groq } from "next-sanity";
import { ProductData } from "../../../../../types";
import Image from "next/image";

import Container from "../../../../components/Container";
import { client } from "../../../../sanity/lib/client";
import { urlFor } from "../../../../sanity/lib/image";
import ProductCard from "../../../../components/ProductCard";
import FormattedPrice from "../../../../components/FormattedPrice";
import MaturitySelect from "../../../../components/MaturitySelect";
import AddKgToCartButton from "../../../../components/AddKgToCartButton";
import AddQtyToCartButton from "../../../../components/AddQtyToCartButton";

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

const SingleProductPage = async ({ params }: Props) => {
    const { slug } = await params;
    const productQuery = groq`*[_type == "product" && slug.current == $slug][0] {
    ...}`;

    const product: ProductData = await client.fetch(productQuery, { slug });
    const bestSellerProductPageQuery = groq`*[_type == "product" && slug.current != $slug && bestseller == true] {...} | order(_createdAt asc)[0...4]`;
    const bestSellerData: ProductData[] = await client.fetch(
        bestSellerProductPageQuery,
        { slug }
    );

    const addToCartOptions = (item: ProductData) => {
        switch (item.productType) {
            case "m-kg":
                return (
                    <>
                        <MaturitySelect item={item} />
                    </>
                );
            case "p":
                return (
                    <>
                        <p>Selecciona la cantidad de piezas:</p>
                        <AddQtyToCartButton item={item} />
                    </>
                );
            case "100g":
                return (
                    <>
                        <AddKgToCartButton item={item} />
                    </>
                );
            case "kg":
                return (
                    <>
                        <AddKgToCartButton item={item} />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Container className="my-10">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 h-full p-4">
                <div className="h-full xl:col-span-2 bg-gray-100 rounded-2xl border-[1px] border-gray-300/50 max-h-[450px]">
                    <Image
                        src={urlFor(product?.image).url()}
                        alt={product?.title}
                        width={500}
                        height={500}
                        className="w-full h-full object-contain"
                    />
                </div>
                <div className="w-full xl:col-span-3 xl:p-14 flex flex-col gap-6 justify-center">
                    <div className="flex flex-col gap-5">
                        <h2 className="text-3xl md:text-4xl font-semibold">
                            {product?.title}
                        </h2>
                        <div className="flex items-center gap-3">
                            {product?.rowprice ? (
                                <>
                                    <p className="text-lg font-normal text-gray-500 line-through">
                                        {product?.productType === "kg" && (
                                            <FormattedPrice
                                                amount={product.kgPrice}
                                            />
                                        )}
                                        {product?.productType === "m-kg" && (
                                            <FormattedPrice
                                                amount={product.kgPrice}
                                            />
                                        )}
                                        {product?.productType === "p" && (
                                            <FormattedPrice
                                                amount={product.pPrice}
                                            />
                                        )}
                                        {product?.productType === "100g" && (
                                            <FormattedPrice
                                                amount={product.gramsPrice}
                                            />
                                        )}
                                    </p>
                                    {product?.productType === "kg" && (
                                        <FormattedPrice
                                            amount={
                                                product?.kgPrice -
                                                product?.rowprice
                                            }
                                            className="text-lg font-bold text-green-900"
                                        />
                                    )}
                                    {product?.productType === "m-kg" && (
                                        <FormattedPrice
                                            amount={
                                                product?.kgPrice -
                                                product?.rowprice
                                            }
                                            className="text-lg font-bold text-green-900"
                                        />
                                    )}
                                    {product.productType === "p" && (
                                        <FormattedPrice
                                            amount={
                                                product?.pPrice -
                                                product?.rowprice
                                            }
                                            className="text-lg font-bold text-green-900"
                                        />
                                    )}
                                    {product.productType === "100g" && (
                                        <FormattedPrice
                                            amount={
                                                product?.gramsPrice -
                                                product?.rowprice
                                            }
                                            className="text-lg font-bold text-green-900"
                                        />
                                    )}
                                    {product?.productType === "kg" && (
                                        <span className="text-sm font-medium">
                                            <i>/Kg</i>
                                        </span>
                                    )}
                                    {product?.productType === "m-kg" && (
                                        <span className="text-sm font-medium">
                                            <i>/Kg</i>
                                        </span>
                                    )}
                                    {product?.productType === "p" && (
                                        <span className="text-sm font-medium">
                                            <i>/Pieza</i>
                                        </span>
                                    )}
                                    {product?.productType === "100g" && (
                                        <span className="text-sm font-medium">
                                            <i>/100 gramos</i>
                                        </span>
                                    )}
                                    <p>
                                        Ahorraste en este producto{" "}
                                        <span className="bg-primaryGold font-semibold text-sm text-primaryDark rounded-full px-3 py-1">
                                            {(
                                                (product?.rowprice /
                                                    (product?.pPrice ||
                                                        product?.kgPrice ||
                                                        product?.gramsPrice)) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </span>
                                    </p>
                                </>
                            ) : (
                                <>
                                    {product?.productType === "p" && (
                                        <FormattedPrice
                                            amount={product?.pPrice}
                                            className="text-lg font-bold text-green-900"
                                        />
                                    )}
                                    {product?.productType === "kg" && (
                                        <FormattedPrice
                                            amount={product?.kgPrice}
                                            className="text-lg font-bold text-green-900"
                                        />
                                    )}
                                    {product?.productType === "m-kg" && (
                                        <FormattedPrice
                                            amount={product?.kgPrice}
                                            className="text-lg font-bold text-green-900"
                                        />
                                    )}
                                    {product?.productType === "100g" && (
                                        <FormattedPrice
                                            amount={product?.gramsPrice}
                                            className="text-lg font-bold text-green-900"
                                        />
                                    )}
                                    {product?.productType === "kg" && (
                                        <span className="text-sm font-medium">
                                            <i>/Kg</i>
                                        </span>
                                    )}
                                    {product?.productType === "m-kg" && (
                                        <span className="text-sm font-medium">
                                            <i>/Kg</i>
                                        </span>
                                    )}
                                    {product?.productType === "p" && (
                                        <span className="text-sm font-medium">
                                            <i>/Pieza</i>
                                        </span>
                                    )}
                                    {product?.productType === "100g" && (
                                        <span className="text-sm font-medium">
                                            <i>/100 gramos</i>
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                        <p className="text-black/60 text-sm tracking-wide">
                            {product?.description}
                        </p>
                        {product?.kgPerPiece && (
                            <div>
                                <p className="font-bold text-sm">
                                    Una pieza de este producto pesa aprox.{" "}
                                    {product.kgPerPiece} Kg.
                                </p>
                            </div>
                        )}
                        {addToCartOptions(product)}
                        <p className="font-normal text-sm">
                            <span className="font-base font-medium">
                                Categoría:{" "}
                            </span>
                            {product?.productCategory}
                        </p>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-xl md:text-2xl py-5 font-medium">
                    Otros productos que podrían interesarte
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {bestSellerData?.map((item) => (
                        <ProductCard key={item?._id} item={item} />
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default SingleProductPage;
