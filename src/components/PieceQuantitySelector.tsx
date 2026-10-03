"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FaMinus, FaPlus } from "react-icons/fa6";
import {
    addToCartPieces,
    selectItemQuantityById,
} from "../lib/redux/features/cart/cartSlice";
import { RootState } from "../lib/redux/store";
import { ProductData } from "../../types";

interface Props {
    item: ProductData;
    /** Se invoca tras agregar al carrito (p. ej. para cerrar un modal). */
    onAdded?: () => void;
}

/**
 * Selector de piezas con estado local: a diferencia de `AddQtyToCartButton`,
 * el +/- no toca el carrito; sólo se agrega al confirmar con el botón.
 */
const PieceQuantitySelector = ({ item, onAdded }: Props) => {
    const dispatch = useDispatch();
    const [qty, setQty] = useState<number>(1);
    const cartQuantity = useSelector((state: RootState) =>
        selectItemQuantityById(state, item._id)
    );

    const disabled = qty <= 1;

    const handleAddToCart = async () => {
        // Se valida el total resultante en el carrito, no sólo lo elegido.
        const response = await fetch("/api/quantity-validation", {
            method: "POST",
            body: JSON.stringify({ quantity: cartQuantity + qty }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return;
        }

        dispatch(addToCartPieces({ item, quantity: qty }));
        toast.success(`${item?.title.substring(0, 12)} añadido al carrito`);
        setQty(1);
        onAdded?.();
    };

    return (
        <>
            <p>Selecciona la cantidad de piezas:</p>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    aria-label="Restar una pieza"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={disabled}
                    className={`w-8 h-8 bg-gray-100 text-sm flex items-center justify-center hover:bg-primaryGreen/10 border-[1px] border-gray-300
                                    ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:border-primaryGold hoverEffect"}
                                `}
                >
                    <FaMinus />
                </button>
                <p className="text-base font-semibold" aria-live="polite">
                    {qty}
                </p>
                <button
                    type="button"
                    aria-label="Sumar una pieza"
                    onClick={() => setQty((q) => q + 1)}
                    className="w-8 h-8 bg-gray-100 text-sm flex items-center justify-center hover:bg-primaryGreen/10 cursor-pointer border-[1px] border-gray-300 hover:border-primaryGold hoverEffect"
                >
                    <FaPlus />
                </button>
            </div>
            <button
                type="button"
                onClick={handleAddToCart}
                className="btn-secondary rounded-full w-full py-3 font-bold tracking-wide"
            >
                Agregar al carrito
            </button>
        </>
    );
};

export default PieceQuantitySelector;
