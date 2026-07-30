"use client";
import { useDispatch, useSelector } from "react-redux";
import {
    addToCart,
    decreaseQuantity,
    selectItemQuantityById,
} from "../lib/redux/features/cart/cartSlice";
import toast from "react-hot-toast";
import { ProductData } from "../../types";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { RootState } from "../lib/redux/store";

interface Props {
    item: ProductData;
    className?: string;
}

const AddQtyToCartButton = ({ item }: Props) => {
    const dispatch = useDispatch();
    const [disabled, setDisabled] = useState<boolean>(false);
    const itemQuantity = useSelector((state: RootState) =>
        selectItemQuantityById(state, item._id)
    );

    useEffect(() => {
        setDisabled(itemQuantity < -1);
    }, [itemQuantity]);

    const handleAdd = async () => {
        const response = await fetch("/api/quantity-validation", {
            method: "POST",
            body: JSON.stringify({ quantity: itemQuantity }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return;
        }
        dispatch(addToCart(item));
        toast.success(`${item?.title.substring(0, 12)} agregada al carrito`);
    };

    const handleMinus = () => {
        if (itemQuantity > 1) {
            dispatch(decreaseQuantity(item?._id));
            toast.success("Se ha restado una unidad del producto");
        }
    };

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={handleMinus}
                disabled={disabled}
                className={`w-6 h-6 bg-gray-100 text-sm flex items-center justify-center hover:bg-primaryGreen/10 border-[1px] border-gray-300  
                                    ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:border-primaryGold hoverEffect"}
                                `}
            >
                <FaMinus />
            </button>
            <p className="text-sm font-semibold">{itemQuantity}</p>
            <button
                onClick={handleAdd}
                className="w-6 h-6 bg-gray-100 text-sm flex items-center justify-center hover:bg-primaryGreen/10 cursor-pointer border-[1px] border-gray-300 hover:border-primaryGold hoverEffect"
            >
                <FaPlus />
            </button>
        </div>
    );
};

export default AddQtyToCartButton;
