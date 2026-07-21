import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the Sanity client BEFORE importing the module under test, so no real
// network call (and no env evaluation from `../sanity/env`) happens.
const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
vi.mock("../sanity/lib/client", () => ({
    client: { withConfig: () => ({ fetch: fetchMock }) },
}));

import { resolveOrder, getCartPricing } from "./pricing";

const canonicalApple = {
    _id: "apple",
    title: "Manzana",
    description: "Fresca",
    productType: "p" as const,
    pPrice: 100,
    kgPrice: 0,
    gramsPrice: 0,
    rowprice: 0,
};

describe("resolveOrder (server is the source of truth for prices)", () => {
    beforeEach(() => fetchMock.mockReset());

    it("ignores prices the client tries to smuggle in and uses Sanity's", async () => {
        fetchMock.mockResolvedValue([canonicalApple]);

        // A tampered line claiming pPrice: 1 (as the old checkout would trust).
        const tampered = { _id: "apple", quantity: 2, pPrice: 1 } as never;
        const { resolvedItems, subtotal, stripeLineItems } = await resolveOrder([
            tampered,
        ]);

        expect(resolvedItems[0].pPrice).toBe(100); // canonical, not 1
        expect(subtotal).toBe(200); // 100 * 2, not 2
        expect(stripeLineItems[0].price_data.unit_amount).toBe(10000); // 100 pesos
    });

    it("computes shipping from the recomputed subtotal", async () => {
        fetchMock.mockResolvedValue([canonicalApple]);
        const { shipping, total } = await resolveOrder([
            { _id: "apple", quantity: 2 },
        ]);
        expect(shipping).toBe(50); // subtotal 200 <= 300
        expect(total).toBe(250);
    });

    it("rejects a line whose product no longer exists in Sanity", async () => {
        fetchMock.mockResolvedValue([]); // nothing found
        await expect(
            resolveOrder([{ _id: "ghost", quantity: 1 }])
        ).rejects.toThrow();
    });

    it("rejects an out-of-range quantity", async () => {
        fetchMock.mockResolvedValue([canonicalApple]);
        await expect(
            resolveOrder([{ _id: "apple", quantity: 500 }])
        ).rejects.toThrow();
    });

    it("rejects an empty order", async () => {
        await expect(resolveOrder([])).rejects.toThrow();
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe("getCartPricing", () => {
    beforeEach(() => fetchMock.mockReset());

    it("returns only canonical price fields keyed by _id", async () => {
        fetchMock.mockResolvedValue([canonicalApple]);
        const pricing = await getCartPricing(["apple"]);
        expect(pricing.apple).toEqual({
            productType: "p",
            pPrice: 100,
            kgPrice: 0,
            gramsPrice: 0,
            rowprice: 0,
        });
    });
});
