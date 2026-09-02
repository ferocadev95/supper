"use client";

import { addToCartKgQuantity } from "../lib/redux/features/cart/cartSlice";
import { ProductData } from "../../types";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import KgQuantityInput from "./KgQuantityInput";

interface Props {
    item: ProductData;
}

const AddKgToCartButton = ({ item }: Props) => {
    const dispatch = useDispatch();
    const [kgQuantity, setKgQuantity] = useState<string>("");

    const handleAddToCart = async () => {
        const parsedQuantity = parseFloat(kgQuantity);

        const response = await fetch("/api/kg-input-validation", {
            method: "POST",
            body: JSON.stringify({ quantity: parsedQuantity }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return;
        }

        setKgQuantity("");

        dispatch(addToCartKgQuantity({ item, kgQuantity: parsedQuantity }));

        toast.success(`${item?.title.substring(0, 12)} añadido al carrito`);
    };
    return (
        <>
            <p>Por favor seleccione la cantidad de producto:</p>
            {/* // TODO: Make proper validation with a form */}
            <KgQuantityInput
                value={kgQuantity}
                onChange={setKgQuantity}
                onEnter={handleAddToCart}
                placeholder="Cantidad en Kilogramos (Kg)"
            />
            <button
                onClick={handleAddToCart}
                className="btn-secondary rounded-full w-full py-3 font-bold tracking-wide"
            >
                Agregar al carrito
            </button>
        </>
    );
};

export default AddKgToCartButton;
