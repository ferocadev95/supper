import { describe, it, expect } from "vitest";
import {
    PriceFields,
    Quantities,
    computeLineSubtotal,
    computeCartTotals,
    toStripeLineItem,
    SHIPPING_COST,
    KG_MIN,
    KG_MAX,
    isValidKgQuantity,
    discountPercent,
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

    it("an empty cart has no shipping and no total", () => {
        expect(computeCartTotals([])).toEqual({
            subtotal: 0,
            shipping: 0,
            total: 0,
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

// Stripe rechaza `quantity` no entera con "Invalid integer", dejando el pedido
// sin poder pagarse. `1.1 * 100` en coma flotante da 110.00000000000001.
describe("toStripeLineItem: quantity siempre entera", () => {
    const trip = [1.1, 0.29, 4.6, 2.3, 8.7]; // kilajes que arrastran residuo

    it("kg y 100g redondean las unidades de 10 g", () => {
        for (const kg of trip) {
            for (const productType of ["kg", "100g"] as const) {
                const item = toStripeLineItem(
                    price({ productType, kgPrice: 30, gramsPrice: 3 }),
                    { kgQuantity: kg },
                    { name: "x" }
                );
                expect(Number.isInteger(item.quantity)).toBe(true);
            }
        }
    });

    it("m-kg redondea cada lado antes de sumarlos", () => {
        for (const kg of trip) {
            const item = toStripeLineItem(
                price({ productType: "m-kg", kgPrice: 30 }),
                { matureQuantity: kg, greenQuantity: 0.1 },
                { name: "x" }
            );
            expect(Number.isInteger(item.quantity)).toBe(true);
        }
    });

    it("no altera el importe: 1.1 kg a $30 sigue cobrando $33", () => {
        const p = price({ productType: "kg", kgPrice: 30 });
        const q = { kgQuantity: 1.1 };
        const item = toStripeLineItem(p, q, { name: "Plátano" });
        expect((item.price_data.unit_amount * item.quantity) / 100).toBeCloseTo(
            computeLineSubtotal(p, q)
        );
    });
});

describe("isValidKgQuantity", () => {
    it("acepta el rango [KG_MIN, KG_MAX]", () => {
        expect(isValidKgQuantity(KG_MIN)).toBe(true);
        expect(isValidKgQuantity(2.5)).toBe(true);
        expect(isValidKgQuantity(KG_MAX)).toBe(true);
    });

    it("rechaza por debajo del mínimo y por encima del máximo", () => {
        expect(isValidKgQuantity(0.05)).toBe(false);
        expect(isValidKgQuantity(KG_MAX + 0.1)).toBe(false);
    });

    it("rechaza 0 salvo que se permita explícitamente (un lado de m-kg)", () => {
        expect(isValidKgQuantity(0)).toBe(false);
        expect(isValidKgQuantity(0, true)).toBe(true);
    });

    it("rechaza negativos aunque se permita el 0", () => {
        expect(isValidKgQuantity(-1, true)).toBe(false);
    });

    it("rechaza entradas no numéricas", () => {
        expect(isValidKgQuantity(NaN)).toBe(false);
        expect(isValidKgQuantity(Infinity)).toBe(false);
    });
});

describe("discountPercent", () => {
    it("calcula el porcentaje sobre el precio de lista de cada tipo", () => {
        expect(
            discountPercent(price({ productType: "p", pPrice: 100, rowprice: 5 }))
        ).toBe(5);
        expect(
            discountPercent(
                price({ productType: "kg", kgPrice: 40, rowprice: 10 })
            )
        ).toBe(25);
        expect(
            discountPercent(
                price({ productType: "m-kg", kgPrice: 40, rowprice: 10 })
            )
        ).toBe(25);
        expect(
            discountPercent(
                price({ productType: "100g", gramsPrice: 20, rowprice: 1 })
            )
        ).toBe(5);
    });

    it("ignora los precios de otros tipos al elegir la base", () => {
        // Un producto por kg puede traer pPrice heredado de Sanity; la base
        // sigue siendo kgPrice.
        expect(
            discountPercent(
                price({
                    productType: "kg",
                    kgPrice: 50,
                    pPrice: 10,
                    rowprice: 5,
                })
            )
        ).toBe(10);
    });

    it("devuelve 0 sin descuento o sin precio base", () => {
        expect(discountPercent(price({ productType: "p", pPrice: 100 }))).toBe(0);
        expect(
            discountPercent(price({ productType: "p", pPrice: 0, rowprice: 5 }))
        ).toBe(0);
    });
});
