import { describe, it, expect } from "vitest";
import {
    PriceFields,
    Quantities,
    computeLineSubtotal,
    computeCartTotals,
    toStripeLineItem,
    SHIPPING_COST,
} from "./pricing";

const price = (overrides: Partial<PriceFields>): PriceFields => ({
    productType: "p",
    pPrice: 0,
    kgPrice: 0,
    gramsPrice: 0,
    rowprice: 0,
    ...overrides,
});

describe("computeLineSubtotal", () => {
    it("p: (pPrice - rowprice) * quantity", () => {
        expect(
            computeLineSubtotal(price({ productType: "p", pPrice: 5 }), {
                quantity: 3,
            })
        ).toBe(15);
        expect(
            computeLineSubtotal(
                price({ productType: "p", pPrice: 5, rowprice: 1 }),
                { quantity: 3 }
            )
        ).toBe(12);
    });

    it("kg: kgQuantity * (kgPrice - rowprice)", () => {
        expect(
            computeLineSubtotal(price({ productType: "kg", kgPrice: 10 }), {
                kgQuantity: 2,
            })
        ).toBe(20);
        expect(
            computeLineSubtotal(
                price({ productType: "kg", kgPrice: 10, rowprice: 2 }),
                { kgQuantity: 2 }
            )
        ).toBe(16);
    });

    it("100g: kgQuantity * (gramsPrice*10 - rowprice)", () => {
        expect(
            computeLineSubtotal(price({ productType: "100g", gramsPrice: 3 }), {
                kgQuantity: 2,
            })
        ).toBe(60);
        expect(
            computeLineSubtotal(
                price({ productType: "100g", gramsPrice: 3, rowprice: 5 }),
                { kgQuantity: 2 }
            )
        ).toBe(50);
    });

    it("m-kg: (mature + green) * (kgPrice - rowprice)", () => {
        expect(
            computeLineSubtotal(price({ productType: "m-kg", kgPrice: 10 }), {
                matureQuantity: 1,
                greenQuantity: 2,
            })
        ).toBe(30);
        expect(
            computeLineSubtotal(
                price({ productType: "m-kg", kgPrice: 10, rowprice: 2 }),
                { matureQuantity: 1, greenQuantity: 2 }
            )
        ).toBe(24);
    });
});

describe("computeCartTotals (shipping rule)", () => {
    const line = (subtotalTarget: number) => ({
        price: price({ productType: "p", pPrice: subtotalTarget }),
        quantities: { quantity: 1 } as Quantities,
    });

    it("charges shipping below the threshold", () => {
        expect(computeCartTotals([line(100)])).toEqual({
            subtotal: 100,
            shipping: SHIPPING_COST,
            total: 150,
        });
    });

    it("charges shipping at exactly the threshold (300 is not > 300)", () => {
        expect(computeCartTotals([line(300)])).toEqual({
            subtotal: 300,
            shipping: SHIPPING_COST,
            total: 350,
        });
    });

    it("free shipping above the threshold", () => {
        expect(computeCartTotals([line(301)])).toEqual({
            subtotal: 301,
            shipping: 0,
            total: 301,
        });
    });
});

describe("toStripeLineItem (verbatim charge math)", () => {
    it("p: unit_amount is the per-piece price in cents", () => {
        const item = toStripeLineItem(
            price({ productType: "p", pPrice: 5, rowprice: 1 }),
            { quantity: 3 },
            { name: "Manzana" }
        );
        expect(item.quantity).toBe(3);
        expect(item.price_data.unit_amount).toBe(400); // (5-1)*100
    });

    it("kg: scales quantity by 100 and matches the pesos subtotal", () => {
        const p = price({ productType: "kg", kgPrice: 10 });
        const q = { kgQuantity: 2 };
        const item = toStripeLineItem(p, q, { name: "Tomate" });
        // Charged pesos = unit_amount(cents) * quantity / 100.
        const chargedPesos =
            (item.price_data.unit_amount * item.quantity) / 100;
        expect(chargedPesos).toBeCloseTo(computeLineSubtotal(p, q));
    });
});
