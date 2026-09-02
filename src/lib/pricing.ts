import type { ProductData } from "../../types";

/**
 * Pure pricing math — shared by the UI (cart display) and the server
 * (checkout / saveorder). No imports from server/Sanity/firebase live here, so
 * this module can be bundled on the client and reused on the server, giving a
 * single definition of the formula: what is shown === what is charged.
 */

export const SHIPPING_COST = 50;
export const FREE_SHIPPING_THRESHOLD = 300;

/** Límites de una cantidad en kilogramos, compartidos por los campos de kg del
 *  carrito y de la página de producto, y por la revalidación del checkout. */
export const KG_MIN = 0.1;
export const KG_MAX = 100;

/**
 * Cantidad en kg válida para una línea `kg`/`100g`, o para un lado de `m-kg`
 * cuando `allowZero` (un lado puede ser 0 mientras el otro no lo sea).
 */
export const isValidKgQuantity = (kg: number, allowZero = false): boolean =>
    Number.isFinite(kg) && kg <= KG_MAX && (allowZero ? kg >= 0 : kg >= KG_MIN);

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

export const basePrice = (price: PriceFields): number => {
    switch (price.productType) {
        case "p":
            return price.pPrice || 0;
        case "100g":
            return price.gramsPrice || 0;
        case "kg":
        case "m-kg":
            return price.kgPrice || 0;
        default:
            return 0;
    }
};

export const discountPercent = (price: PriceFields): number => {
    const base = basePrice(price);
    const rowprice = price.rowprice || 0;
    if (base <= 0 || rowprice <= 0) return 0;
    return (rowprice / base) * 100;
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
 * Las líneas por peso se cobran en unidades de 10 g (`kg * 100`), y Stripe
 * exige que `quantity` sea un entero. En coma flotante `1.1 * 100` da
 * `110.00000000000001`, que la API rechaza con "Invalid integer" y deja el
 * pedido sin poder pagarse; `Math.round` elimina ese residuo sin mover importes
 * (comprobado contra Stripe en modo test: 1.1 kg a $30 cobra $33.00, igual que
 * el subtotal mostrado).
 */
const toStripeUnits = (kg: number | undefined): number =>
    Math.round((kg || 0) * 100);

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
        const quantity = toStripeUnits(q.kgQuantity);
        return {
            quantity,
            price: (price.gramsPrice / 10 - (price.rowprice / 100 || 0)) * quantity,
        };
    } else if (price.productType === "kg") {
        const quantity = toStripeUnits(q.kgQuantity);
        return {
            quantity,
            price: (price.kgPrice / 100 - (price.rowprice / 100 || 0)) * quantity,
        };
    } else if (price.productType === "m-kg") {
        const totalQuantity =
            toStripeUnits(q.matureQuantity) + toStripeUnits(q.greenQuantity);
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
