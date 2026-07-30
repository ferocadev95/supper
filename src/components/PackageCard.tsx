"use client";

import { useState } from "react";
import Image from "next/image";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
// import FormattedPrice from "./FormattedPrice";
import { Package, ProductData } from "../../types";
import { urlFor } from "../sanity/lib/image";
import { useDispatch } from "react-redux";
// import { getProductData } from "../server/actions/get-product-data";
import toast from "react-hot-toast";
import {
    // addToCart,
    addToCartBatch,
} from "../lib/redux/features/cart/cartSlice";
import { getPackagesData } from "../server/actions/get-packages-data";

interface Props {
    packages: Package[];
}

export default function PackageCard({ packages }: Props) {
    const [expandedCards, setExpandedCards] = useState<{
        [key: string]: boolean;
    }>({});

    const dispatch = useDispatch();

    const handleAddToCart = async (packageId: string) => {
        const packageData = (await getPackagesData(packageId).then((data) => {
            return data?.items;
        })) as ProductData[];

        dispatch(addToCartBatch(packageData));
        toast.success("Paquete agregado al carrito");
    };

    const toggleExpand = (id: string) => {
        setExpandedCards((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <div className="flex flex-col gap-6">
            {packages.map((item) => (
                <div
                    key={item._id}
                    className="border border-gray-200 max-screen-2xl rounded-2xl w-full mx-auto overflow-hidden transition-all duration-300 ease-in-out hover:shadow-md"
                >
                    <div className="flex items-center p-4 flex-col gap-y-1 sm:flex-row">
                        <Image
                            src={urlFor(item.image).url()}
                            alt={item.name}
                            width={150}
                            height={150}
                            className="rounded-md object-cover"
                        />
                        <div className="ml-4 flex-grow">
                            <h2 className="text-center sm:text-left text-2xl font-semibold">
                                {item.name}
                            </h2>
                            <p className="text-base text-gray-500 line-clamp-1">
                                {item.description}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                handleAddToCart(item.dbId);
                            }}
                            className="btn-secondary mr-4 px-6 py-2 rounded-full"
                        >
                            Agregar al carrito
                        </button>
                        {/* <span className="text-lg font-bold">
                            <FormattedPrice
                                amount={item.price}
                                className="font-bold text-xl text-green-900"
                            />
                        </span> */}
                    </div>

                    {expandedCards[item._id] && (
                        <div className="px-4 pb-4 text-base">
                            <strong>Contenido del Paquete:</strong>
                            <ul className="list-disc list-inside pl-4">
                                {item.included.map((item, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div
                        className="py-2 flex justify-center border-t border-gray-300/50 cursor-pointer bg-gray-100"
                        onClick={() => toggleExpand(item._id)}
                    >
                        {expandedCards[item._id] ? (
                            <div className="flex items-center gap-x-2">
                                <span className="text-sm font-semibold tracking-wide">
                                    Ocultar contenido
                                </span>
                                <FaChevronDown className="w-5 h-5 text-gray-400" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-x-2">
                                <span className="text-sm font-semibold tracking-wide">
                                    Ver contenido
                                </span>
                                <FaChevronUp className="w-5 h-5 text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
