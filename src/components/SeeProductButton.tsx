"use client";
import { twMerge } from "tailwind-merge";
import { ProductData } from "../../types";
import Link from "next/link";

interface Props {
    item: ProductData;
    className?: string;
}

const SeeProductButton = ({ item, className }: Props) => {
    return (
        <Link
            href={`/producto/${item?.slug.current}`}
            className={twMerge(
                "btn-secondary w-full py-2 font-bold tracking-wide",
                className
            )}
        >
            Ver producto
        </Link>
    );
};

export default SeeProductButton;
