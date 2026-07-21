import type { ProductData } from "../../types";

/**
 * Pure pricing math — shared by the UI (cart display) and the server
 * (checkout / saveorder). No imports from server/Sanity/firebase live here, so
 * this module can be bundled on the client and reused on the server, giving a
 * single definition of the formula: what is shown === what is charged.
 */

export const SHIPPING_COST = 50;
export const FREE_SHIPPING_THRESHOLD = 300;

export type ProductType = ProductData["productType"];

/** The price-bearing fields — the server fills these from Sanity, never the client. */
export interface PriceFields {
    productType: ProductType;
    pPrice: number;
    kgPrice: number;
    gramsPrice: number;
    rowprice: number;
}

/** The client-provided quantities for a line. */
export interface Quantities {
    quantity?: number;
    matureQuantity?: number;
    greenQuantity?: number;
    kgQuantity?: number;
}

export interface CartLine {
    price: PriceFields;
    quantities: Quantities;
}

export interface StripeLineItem {
    quantity: number;
    price_data: {
        currency: "mxn";
        unit_amount: number;
        product_data: {
            name: string;
            description?: string;
        };
    };
}

/**
 * Canonical per-line subtotal in pesos. This is the formula from
 * `CartContainer` — which already matched exactly what `/api/checkout` charged
 * for every product type, including `rowprice`.
 */
export const computeLineSubtotal = (
    price: PriceFields,
    q: Quantities
): number => {
    const rowprice = price.rowprice || 0;
    switch (price.productType) {
        case "p":
            return (price.pPrice - rowprice) * (q.quantity || 0);
        case "kg":
            return (q.kgQuantity || 0) * (price.kgPrice - rowprice);
        case "100g":
            return (q.kgQuantity || 0) * (price.gramsPrice * 10 - rowprice);
        case "m-kg":
            return (
                ((q.matureQuantity || 0) + (q.greenQuantity || 0)) *
                (price.kgPrice - rowprice)
            );
        default:
            return 0;
    }
};

/** Subtotal + shipping rule (free over the threshold) + total. */
export const computeCartTotals = (
    lines: CartLine[]
): { subtotal: number; shipping: number; total: number } => {
    const subtotal = lines.reduce(
        (acc, { price, quantities }) =>
            acc + computeLineSubtotal(price, quantities),
        0
    );
    const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    return { subtotal, shipping, total: subtotal + shipping };
};

/**
 * Ported verbatim from the previous `/api/checkout` `quantitySelect`, so the
 * amounts Stripe receives are unchanged; the only difference is that the prices
 * now come from Sanity instead of the client body.
 */
const quantitySelect = (
    price: PriceFields,
    q: Quantities
): { quantity: number; price: number } => {
    if (price.productType === "p") {
        return {
            quantity: q.quantity || 0,
            price: (price.pPrice - (price.rowprice || 0)) * (q.quantity || 0),
        };
    } else if (price.productType === "100g") {
        const quantity = (q.kgQuantity || 0) * 100;
        return {
            quantity,
            price: (price.gramsPrice / 10 - (price.rowprice / 100 || 0)) * quantity,
        };
    } else if (price.productType === "kg") {
        const quantity = (q.kgQuantity || 0) * 100;
        return {
            quantity,
            price: (price.kgPrice / 100 - (price.rowprice / 100 || 0)) * quantity,
        };
    } else if (price.productType === "m-kg") {
        const totalQuantity =
            (q.matureQuantity || 0) * 100 + (q.greenQuantity || 0) * 100;
        const totalPrice =
            (price.kgPrice / 100 - (price.rowprice / 100 || 0)) * totalQuantity;
        return { quantity: totalQuantity, price: totalPrice };
    }
    return { quantity: 0, price: 0 };
};

/** Build a single Stripe line item from canonical prices + client quantities. */
export const toStripeLineItem = (
    price: PriceFields,
    q: Quantities,
    meta: { name: string; description?: string }
): StripeLineItem => {
    const { quantity, price: linePrice } = quantitySelect(price, q);
    return {
        quantity,
        price_data: {
            currency: "mxn",
            unit_amount: Math.round((linePrice * 100) / quantity || 1),
            product_data: {
                name: meta.name,
                description: meta.description,
            },
        },
    };
};
