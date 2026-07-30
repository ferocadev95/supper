"use client";

import {
    addToCartFruitVegetableGreen,
    addToCartFruitVegetableMature,
} from "../lib/redux/features/cart/cartSlice";
import { ProductData } from "../../types";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

interface Props {
    item: ProductData;
}

const MaturitySelect = ({ item }: Props) => {
    const [maturity, setMaturity] = useState<string>("maduro");
    const [quantity, setQuantity] = useState<string>("");
    const dispatch = useDispatch();

    const handleSelection = (selectedMaturity: string) => {
        setMaturity(selectedMaturity);
    };

    const matureQuantity = parseFloat(quantity);
    const greenQuantity = parseFloat(quantity);

    const handleAddToCart = async () => {
        const parsedQuantity = parseFloat(quantity);

        const response = await fetch("/api/kg-input-validation", {
            method: "POST",
            body: JSON.stringify({ quantity: parsedQuantity }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return;
        }

        setQuantity("");

        switch (maturity) {
            case "maduro":
                dispatch(
                    addToCartFruitVegetableMature({ item, matureQuantity })
                );
                break;
            case "verde":
                dispatch(addToCartFruitVegetableGreen({ item, greenQuantity }));
            default:
                break;
        }

        toast.success(`${item?.title.substring(0, 12)} añadido al carrito`);
    };

    return (
        <div className="mt-4 flex flex-col gap-5 border-t-[1px] py-4">
            <p>Por favor elija el punto de maduración deseado:</p>
            <div className="flex gap-x-3 items-center justify-start">
                <button
                    onClick={() => handleSelection("maduro")}
                    className={
                        maturity === "maduro"
                            ? "px-4 py-2 border-primaryGreen border-[1px] rounded-md bg-primaryGreen/10"
                            : "px-4 py-2 border-gray-300/50 border-[1px] rounded-md bg-gray-50 hover:bg-gray-200 hoverEffect"
                    }
                >
                    Maduro
                </button>
                <button
                    onClick={() => handleSelection("verde")}
                    className={
                        maturity === "verde"
                            ? "px-4 py-2 border-primaryGreen border-[1px] rounded-md bg-primaryGreen/10"
                            : "px-4 py-2 border-gray-300/50 border-[1px] rounded-md bg-gray-50 hover:bg-gray-200 hoverEffect"
                    }
                >
                    Verde
                </button>
            </div>
            <p>Por favor seleccione la cantidad de producto:</p>
            {/* // TODO: Make proper validation */}
            <input
                type="number"
                placeholder="Cantidad en Kilogramos (Kg)"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border-[1px] border-gray-300/50 rounded-md px-2 py-2"
            />
            <button
                onClick={handleAddToCart}
                className="btn-secondary rounded-full w-full py-3 font-bold tracking-wide"
            >
                Agregar al carrito
            </button>
        </div>
    );
};

export default MaturitySelect;
