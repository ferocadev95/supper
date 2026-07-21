"use server";

import { groq } from "next-sanity";
import { z } from "zod";
import { client } from "../sanity/lib/client";
import {
    PriceFields,
    ProductType,
    Quantities,
    StripeLineItem,
    computeCartTotals,
    computeLineSubtotal,
    toStripeLineItem,
} from "../lib/pricing";

/**
 * Server-side pricing: Sanity is the single source of truth for prices. The
 * client sends only identity (`_id`) + quantities; the server re-reads the
 * price from Sanity by `_id` and recomputes line items, shipping and total.
 * Prices/amounts coming from the client body are never trusted.
 */

/** What the client is allowed to send per line: identity + quantities. */
export interface SlimLine {
    _id: string;
    quantity?: number;
    matureQuantity?: number;
    greenQuantity?: number;
    kgQuantity?: number;
}

interface CanonicalProduct {
    _id: string;
    title: string;
    description?: string;
    productType: ProductType;
    pPrice: number;
    kgPrice: number;
    gramsPrice: number;
    rowprice: number;
}

export interface ResolvedItem extends CanonicalProduct {
    quantity: number;
    matureQuantity: number;
    greenQuantity: number;
    kgQuantity: number;
    subtotal: number;
}

export interface ResolvedOrder {
    stripeLineItems: StripeLineItem[];
    subtotal: number;
    shipping: number;
    total: number;
    resolvedItems: ResolvedItem[];
}

// `client` is configured with `useCdn: true`; force a fresh read so the price
// at charge time is never a stale CDN snapshot.
const freshClient = client.withConfig({ useCdn: false });

// Enforcement of the same limits the UI validation routes advertise.
const pieceSchema = z.number().min(1).max(200);
const kgSchema = z.number().min(0.1).max(100);
const kgSideSchema = z.number().min(0).max(100); // one maturity side may be 0

const validateQuantities = (productType: ProductType, line: SlimLine): void => {
    if (productType === "p") {
        if (!pieceSchema.safeParse(line.quantity).success) {
            throw new Error("Cantidad de piezas inválida.");
        }
    } else if (productType === "kg" || productType === "100g") {
        if (!kgSchema.safeParse(line.kgQuantity).success) {
            throw new Error("Cantidad en kg inválida.");
        }
    } else if (productType === "m-kg") {
        const mature = line.matureQuantity || 0;
        const green = line.greenQuantity || 0;
        if (
            !kgSideSchema.safeParse(mature).success ||
            !kgSideSchema.safeParse(green).success ||
            mature + green <= 0
        ) {
            throw new Error("Cantidad en kg inválida.");
        }
    }
};

/** Read the canonical (fresh) products for a set of ids, indexed by `_id`. */
export const fetchProductsByIds = async (
    ids: string[]
): Promise<Record<string, CanonicalProduct>> => {
    if (!ids.length) return {};
    const query = groq`*[_type == "product" && _id in $ids]{
        _id, title, description, productType, pPrice, kgPrice, gramsPrice, rowprice
    }`;
    const products: CanonicalProduct[] = await freshClient.fetch(query, { ids });
    return Object.fromEntries(products.map((p) => [p._id, p]));
};

/**
 * Resolve a client order against Sanity: validate quantities, reject missing
 * products, and recompute Stripe line items, subtotal, shipping and total from
 * canonical prices. `resolvedItems` carry the canonical prices for persistence.
 */
export const resolveOrder = async (
    lines: SlimLine[]
): Promise<ResolvedOrder> => {
    if (!Array.isArray(lines) || lines.length === 0) {
        throw new Error("El carrito está vacío.");
    }
    if (lines.some((l) => !l?._id)) {
        throw new Error("Una línea del carrito no tiene identificador de producto.");
    }

    const ids = lines.map((l) => l._id);
    const products = await fetchProductsByIds(ids);

    const resolvedItems: ResolvedItem[] = [];
    const stripeLineItems: StripeLineItem[] = [];

    for (const line of lines) {
        const product = products[line._id];
        if (!product) {
            throw new Error(`El producto ${line._id} ya no está disponible.`);
        }
        validateQuantities(product.productType, line);

        const price: PriceFields = {
            productType: product.productType,
            pPrice: product.pPrice,
            kgPrice: product.kgPrice,
            gramsPrice: product.gramsPrice,
            rowprice: product.rowprice || 0,
        };
        const quantities: Quantities = {
            quantity: line.quantity,
            matureQuantity: line.matureQuantity,
            greenQuantity: line.greenQuantity,
            kgQuantity: line.kgQuantity,
        };

        resolvedItems.push({
            ...product,
            rowprice: product.rowprice || 0,
            quantity: line.quantity || 0,
            matureQuantity: line.matureQuantity || 0,
            greenQuantity: line.greenQuantity || 0,
            kgQuantity: line.kgQuantity || 0,
            subtotal: computeLineSubtotal(price, quantities),
        });
        stripeLineItems.push(
            toStripeLineItem(price, quantities, {
                name: product.title,
                description: product.description,
            })
        );
    }

    const { subtotal, shipping, total } = computeCartTotals(
        resolvedItems.map((it) => ({ price: it, quantities: it }))
    );

    return { stripeLineItems, subtotal, shipping, total, resolvedItems };
};

/**
 * Fresh canonical price fields per `_id`, for the cart UI so that the displayed
 * price tracks Sanity even if it changed after the item was added to the cart.
 */
export const getCartPricing = async (
    ids: string[]
): Promise<Record<string, PriceFields>> => {
    const products = await fetchProductsByIds(ids);
    const result: Record<string, PriceFields> = {};
    for (const [id, p] of Object.entries(products)) {
        result[id] = {
            productType: p.productType,
            pPrice: p.pPrice,
            kgPrice: p.kgPrice,
            gramsPrice: p.gramsPrice,
            rowprice: p.rowprice || 0,
        };
    }
    return result;
};
