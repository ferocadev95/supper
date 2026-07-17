import { describe, it, expect } from "vitest";
import reducer, {
    addToCart,
    addToCartBatch,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    setCart,
    resetCart,
    addUser,
    removeUser,
} from "./cartSlice";
import { ProductData, UserInfo } from "../../../../../types";

// Minimal ProductData factory — only the fields the reducers touch matter.
const makeItem = (overrides: Partial<ProductData> = {}): ProductData =>
    ({
        _id: "p1",
        title: "Manzana",
        productType: "p",
        quantity: 0,
        matureQuantity: 0,
        greenQuantity: 0,
        kgQuantity: 0,
        kgPrice: 10,
        pPrice: 5,
        gramsPrice: 1,
        rowprice: 0,
        ...overrides,
    }) as ProductData;

const initial = () => ({ cartItems: [] as ProductData[], userInfo: null as UserInfo | null });

describe("cartSlice reducers", () => {
    it("addToCart inserts a new item with quantity 1", () => {
        const state = reducer(initial(), addToCart(makeItem()));
        expect(state.cartItems).toHaveLength(1);
        expect(state.cartItems[0].quantity).toBe(1);
    });

    it("addToCart increments quantity for an existing item", () => {
        let state = reducer(initial(), addToCart(makeItem()));
        state = reducer(state, addToCart(makeItem()));
        expect(state.cartItems).toHaveLength(1);
        expect(state.cartItems[0].quantity).toBe(2);
    });

    it("increase/decreaseQuantity adjust the matching item by _id", () => {
        let state = reducer(initial(), addToCart(makeItem()));
        state = reducer(state, increaseQuantity("p1"));
        expect(state.cartItems[0].quantity).toBe(2);
        state = reducer(state, decreaseQuantity("p1"));
        expect(state.cartItems[0].quantity).toBe(1);
    });

    it("removeFromCart drops the item with the given _id", () => {
        let state = reducer(initial(), addToCart(makeItem({ _id: "a" })));
        state = reducer(state, addToCart(makeItem({ _id: "b" })));
        state = reducer(state, removeFromCart("a"));
        expect(state.cartItems.map((i) => i._id)).toEqual(["b"]);
    });

    it("resetCart empties the cart but keeps userInfo", () => {
        let state = reducer(initial(), addUser({ id: "1", name: "Ana", email: "a@b.com" }));
        state = reducer(state, addToCart(makeItem()));
        state = reducer(state, resetCart());
        expect(state.cartItems).toHaveLength(0);
        expect(state.userInfo?.email).toBe("a@b.com");
    });

    describe("setCart (server wins on reload)", () => {
        it("replaces the whole cart with the server payload", () => {
            let state = reducer(initial(), addToCart(makeItem({ _id: "local" })));
            const serverItems = [makeItem({ _id: "server", quantity: 3 })];
            state = reducer(state, setCart(serverItems));
            expect(state.cartItems.map((i) => i._id)).toEqual(["server"]);
            expect(state.cartItems[0].quantity).toBe(3);
        });

        it("treats an empty payload as an empty cart", () => {
            let state = reducer(initial(), addToCart(makeItem()));
            state = reducer(state, setCart([]));
            expect(state.cartItems).toHaveLength(0);
        });
    });

    describe("addToCartBatch (merge semantics used on fresh login)", () => {
        it("sums quantities for items already present and appends new ones", () => {
            // Local guest cart.
            let state = reducer(initial(), addToCart(makeItem({ _id: "shared" }))); // qty 1
            // Merge in server cart: same item (qty 2) + a brand-new item.
            const serverCart = [
                makeItem({ _id: "shared", quantity: 2 }),
                makeItem({ _id: "server-only", quantity: 5 }),
            ];
            state = reducer(state, addToCartBatch(serverCart));

            const shared = state.cartItems.find((i) => i._id === "shared");
            const serverOnly = state.cartItems.find((i) => i._id === "server-only");
            expect(shared?.quantity).toBe(3); // 1 (local) + 2 (server)
            expect(serverOnly?.quantity).toBe(5);
            expect(state.cartItems).toHaveLength(2);
        });

        it("merges maturity and kg quantities as well", () => {
            let state = reducer(
                initial(),
                addToCartBatch([
                    makeItem({ _id: "m", productType: "m-kg", matureQuantity: 2, greenQuantity: 1 }),
                ])
            );
            state = reducer(
                state,
                addToCartBatch([
                    makeItem({ _id: "m", productType: "m-kg", matureQuantity: 3, greenQuantity: 4 }),
                ])
            );
            const item = state.cartItems.find((i) => i._id === "m");
            expect(item?.matureQuantity).toBe(5);
            expect(item?.greenQuantity).toBe(5);
        });
    });

    describe("auth slot (gate for the sync listener)", () => {
        it("addUser stores the user and removeUser clears it", () => {
            let state = reducer(initial(), addUser({ id: "1", name: "Ana", email: "a@b.com" }));
            expect(state.userInfo?.email).toBe("a@b.com");
            state = reducer(state, removeUser());
            expect(state.userInfo).toBeNull();
        });
    });
});
