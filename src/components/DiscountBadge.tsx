import { twMerge } from "tailwind-merge";
import { PriceFields, discountPercent } from "../lib/pricing";

interface Props {
    /** Campos de precio de la línea; el descuento sale de `rowprice`. */
    price: PriceFields;
    /** `true` muestra sólo el porcentaje (para tarjetas y listados). */
    compact?: boolean;
    className?: string;
}

/**
 * Recuadro sutil con el descuento ya calculado en porcentaje. No pinta nada
 * cuando el producto no tiene `rowprice`, así que puede colocarse siempre.
 */
const DiscountBadge = ({ price, compact = false, className }: Props) => {
    const percent = discountPercent(price);
    if (percent <= 0) return null;

    const formatted = percent.toLocaleString("es-MX", {
        maximumFractionDigits: 1,
    });

    return (
        <span
            className={twMerge(
                "inline-flex items-center whitespace-nowrap rounded-md border border-primaryGreen/30 bg-primaryGreen/10 px-2 py-0.5 text-xs font-semibold text-primaryGreenDark",
                className
            )}
        >
            -{formatted}%{compact ? "" : " de descuento"}
        </span>
    );
};

export default DiscountBadge;
