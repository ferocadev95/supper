import Link from "next/link";
import { ProductData } from "../../types";
import Image from "next/image";
import { urlFor } from "../sanity/lib/image";
import FormattedPrice from "./FormattedPrice";
import AddToCartButton from "./AddToCartButton";
import SeeProductButton from "./SeeProductButton";
import { Badge } from "./ui";

const ProductCard = ({ item }: { item: ProductData }) => {
    return (
        <div className="border-[1px] border-gray-300/50 rounded-2xl relative group overflow-hidden">
            {item?.seasonal && (
                <div className="absolute left-2 top-2">
                    <Badge>Temporada</Badge>
                </div>
            )}
            <Link href={`/producto/${item?.slug.current}`}>
                <Image
                    src={urlFor(item?.image).url()}
                    alt={item?.title}
                    width={500}
                    height={500}
                    loading="lazy"
                    className="w-full h-48 object-contain p-2 group-hover:scale-105 hoverEffect"
                />
            </Link>
            <div className="px-6 flex flex-col items-center gap-2">
                {item?.brand ? (
                    <p className="uppercase text-xs font-medium text-primaryGold mt-4">
                        {item.brand}
                    </p>
                ) : (
                    <p className="uppercase text-xs font-medium text-primaryGold mt-4">
                        Por definir
                    </p>
                )}
                <h2 className="text-base font-semibold text-black line-clamp-1">
                    {item?.title}
                </h2>
                <p className="text-center text-sm line-clamp-2 min-h-10">
                    {item?.description}
                </p>
                <div className="flex items-center gap-2 mb-5">
                    {item?.rowprice ? (
                        <>
                            {item?.productType === "kg" && (
                                <FormattedPrice
                                    amount={item?.kgPrice}
                                    className="text-black/60 line-through"
                                />
                            )}
                            {item?.productType === "m-kg" && (
                                <FormattedPrice
                                    amount={item?.kgPrice}
                                    className="text-black/60 line-through"
                                />
                            )}
                            {item?.productType === "p" && (
                                <FormattedPrice
                                    className="text-black/60 line-through"
                                    amount={item?.pPrice}
                                />
                            )}
                            {item?.productType === "100g" && (
                                <FormattedPrice
                                    className="text-black/60 line-through"
                                    amount={item?.gramsPrice}
                                />
                            )}
                            {item?.productType === "kg" && (
                                <FormattedPrice
                                    amount={
                                        item?.kgPrice - (item?.rowprice || 0)
                                    }
                                    className="text-green-900 font-bold"
                                />
                            )}
                            {item?.productType === "m-kg" && (
                                <FormattedPrice
                                    amount={
                                        item?.kgPrice - (item?.rowprice || 0)
                                    }
                                    className="text-green-900 font-bold"
                                />
                            )}
                            {item?.productType === "p" && (
                                <FormattedPrice
                                    className="text-green-900 font-bold"
                                    amount={
                                        item?.pPrice - (item?.rowprice || 0)
                                    }
                                />
                            )}
                            {item?.productType === "100g" && (
                                <FormattedPrice
                                    className="text-green-900 font-bold"
                                    amount={
                                        item?.gramsPrice - (item?.rowprice || 0)
                                    }
                                />
                            )}
                        </>
                    ) : item?.productType === "kg" ? (
                        <FormattedPrice
                            amount={item?.kgPrice}
                            className="text-green-900 font-bold"
                        />
                    ) : item?.productType === "p" ? (
                        <FormattedPrice
                            className="text-green-900 font-bold"
                            amount={item?.pPrice}
                        />
                    ) : item?.productType === "100g" ? (
                        <FormattedPrice
                            className="text-green-900 font-bold"
                            amount={item?.gramsPrice}
                        />
                    ) : item?.productType === "m-kg" ? (
                        <FormattedPrice
                            amount={item?.kgPrice}
                            className="text-green-900 font-bolc"
                        />
                    ) : null}
                    {item?.productType === "kg" ? (
                        <span className="text-sm font-medium">
                            <i>/Kg</i>
                        </span>
                    ) : item?.productType === "100g" ? (
                        <span className="text-sm font-medium">
                            <i>/100 gramos</i>
                        </span>
                    ) : item?.productType === "p" ? (
                        <span className="text-sm font-medium">
                            <i>/pieza</i>
                        </span>
                    ) : item?.productType === "m-kg" ? (
                        <span className="text-sm font-medium">
                            <i>/Kg</i>
                        </span>
                    ) : null}
                </div>
            </div>
            {item?.productType !== "p" ? (
                <SeeProductButton item={item} />
            ) : (
                <AddToCartButton item={item} />
            )}
        </div>
    );
};

export default ProductCard;
