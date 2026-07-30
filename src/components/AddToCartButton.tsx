"use client";
import { twMerge } from "tailwind-merge";
import { useDispatch } from "react-redux";
import { addToCart } from "../lib/redux/features/cart/cartSlice";
import toast from "react-hot-toast";
import { ProductData } from "../../types";

interface Props {
    item: ProductData;
    className?: string;
}

const AddToCartButton = ({ item, className }: Props) => {
    const dispatch = useDispatch();
    const handleAddToCart = () => {
        dispatch(addToCart(item));
        toast.success(`${item?.title.substring(0, 12)} añadido al carrito`);
    };

    return (
        <button
            onClick={handleAddToCart}
            className={twMerge(
                "btn-secondary w-full py-2 font-bold tracking-wide",
                className
            )}
        >
            Agregar al carrito
        </button>
    );
};

export default AddToCartButton;
