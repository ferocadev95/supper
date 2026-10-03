"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { IoCloseCircle } from "react-icons/io5";
import { ProductData } from "../../types";
import { urlFor } from "../sanity/lib/image";
import FormattedPrice from "./FormattedPrice";
import MaturitySelect from "./MaturitySelect";
import AddKgToCartButton from "./AddKgToCartButton";
import PieceQuantitySelector from "./PieceQuantitySelector";

interface Props {
    item: ProductData;
    open: boolean;
    onClose: () => void;
}

const unitPrice = (item: ProductData) => {
    switch (item.productType) {
        case "p":
            return item.pPrice;
        case "100g":
            return item.gramsPrice;
        default:
            return item.kgPrice;
    }
};

const unitLabel = (item: ProductData) => {
    switch (item.productType) {
        case "p":
            return "/pieza";
        case "100g":
            return "/100 gramos";
        default:
            return "/Kg";
    }
};

const AddToCartModal = ({ item, open, onClose }: Props) => {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    if (!open) return null;

    const price = unitPrice(item);
    const titleId = `add-to-cart-title-${item._id}`;

    const options = () => {
        switch (item.productType) {
            case "p":
                return <PieceQuantitySelector item={item} onAdded={onClose} />;
            case "m-kg":
                return <MaturitySelect item={item} onAdded={onClose} />;
            case "kg":
            case "100g":
                return <AddKgToCartButton item={item} onAdded={onClose} />;
            default:
                return null;
        }
    };

    // Portal al body: el card tiene `overflow-hidden` y puede vivir dentro del
    // scroller horizontal, lo que recortaría el modal.
    return createPortal(
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
                <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    <IoCloseCircle className="text-3xl hover:text-primaryGold hoverEffect" />
                </button>
                <div className="flex items-center gap-4 pr-8">
                    <Image
                        src={urlFor(item?.image).url()}
                        alt={item?.title}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-contain shrink-0"
                    />
                    <div className="flex flex-col gap-1">
                        <h2 id={titleId} className="text-lg font-semibold">
                            {item?.title}
                        </h2>
                        <div className="flex items-center gap-2">
                            {item?.rowprice ? (
                                <>
                                    <FormattedPrice
                                        amount={price}
                                        className="text-black/60 line-through"
                                    />
                                    <FormattedPrice
                                        amount={price - item.rowprice}
                                        className="text-green-900 font-bold"
                                    />
                                </>
                            ) : (
                                <FormattedPrice
                                    amount={price}
                                    className="text-green-900 font-bold"
                                />
                            )}
                            <span className="text-sm font-medium">
                                <i>{unitLabel(item)}</i>
                            </span>
                        </div>
                        {item?.kgPerPiece && (
                            <p className="text-xs text-black/60">
                                Una pieza pesa aprox. {item.kgPerPiece} Kg.
                            </p>
                        )}
                    </div>
                </div>
                <div className="mt-4 flex flex-col gap-4">{options()}</div>
                <Link
                    href={`/producto/${item?.slug.current}`}
                    onClick={onClose}
                    className="block mt-4 text-center text-sm underline text-black/60 hover:text-primaryGold hoverEffect"
                >
                    Ver detalles del producto
                </Link>
            </motion.div>
        </div>,
        document.body
    );
};

export default AddToCartModal;
