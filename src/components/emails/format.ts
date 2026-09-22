import type Stripe from "stripe";
import type { ResolvedItem } from "../../server/pricing";

export const money = (amount: number) =>
    amount.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    });

/** Misma manera de nombrar las cantidades que la tabla de "Mis Pedidos". */
export const describeQuantity = (item: ResolvedItem): string => {
    switch (item.productType) {
        case "p":
            return `${item.quantity} ${item.quantity === 1 ? "pieza" : "piezas"}`;
        case "m-kg":
            return [
                item.matureQuantity ? `${item.matureQuantity} kg maduro` : "",
                item.greenQuantity ? `${item.greenQuantity} kg verde` : "",
            ]
                .filter(Boolean)
                .join(" · ");
        case "kg":
        case "100g":
            return `${item.kgQuantity} kg`;
        default:
            return "";
    }
};

export const formatAddress = (
    address: Stripe.Address | null
): string | null => {
    if (!address) return null;
    const parts = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postal_code,
    ].filter(Boolean);
    return parts.length ? parts.join(", ") : null;
};
