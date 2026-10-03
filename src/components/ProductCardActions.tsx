"use client";
import { useCallback, useState } from "react";
import { ProductData } from "../../types";
import AddToCartModal from "./AddToCartModal";

interface Props {
    item: ProductData;
}

/**
 * Botón del ProductCard: abre el modal para elegir piezas o kg/maduración.
 * Separado para que `ProductCard` siga siendo un componente de servidor.
 */
const ProductCardActions = ({ item }: Props) => {
    const [open, setOpen] = useState(false);
    const handleClose = useCallback(() => setOpen(false), []);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="btn-secondary w-full py-2 font-bold tracking-wide"
            >
                Agregar al carrito
            </button>
            <AddToCartModal item={item} open={open} onClose={handleClose} />
        </>
    );
};

export default ProductCardActions;
