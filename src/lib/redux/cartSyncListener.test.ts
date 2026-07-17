import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

// Mock the server action BEFORE importing anything that pulls it in, so the
// real module (and firebaseAdmin, which reads env at import time) never loads.
vi.mock("../../server/actions/cart", () => ({
    saveCart: vi.fn().mockResolvedValue(undefined),
    getCart: vi.fn().mockResolvedValue([]),
}));

import { saveCart } from "../../server/actions/cart";
import { cartSyncListener } from "./cartSyncListener";
import cartReducer, {
    addToCart,
    addUser,
    setCart,
} from "./features/cart/cartSlice";
import { ProductData } from "../../../types";

const saveCartMock = vi.mocked(saveCart);

const makeItem = (id = "p1"): ProductData =>
    ({
        _id: id,
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
    }) as ProductData;

const makeStore = () =>
    configureStore({
        reducer: { cart: cartReducer },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().prepend(cartSyncListener.middleware),
    });

const login = (store: ReturnType<typeof makeStore>) =>
    store.dispatch(addUser({ id: "1", name: "Ana", email: "a@b.com" }));

describe("cartSyncListener (single write-through point)", () => {
    beforeEach(() => {
        saveCartMock.mockClear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("does NOT persist for guests (no userInfo)", async () => {
        const store = makeStore();
        store.dispatch(addToCart(makeItem()));
        await vi.advanceTimersByTimeAsync(600);
        expect(saveCartMock).not.toHaveBeenCalled();
    });

    it("persists the current cart to Firestore for authenticated users", async () => {
        const store = makeStore();
        login(store);
        store.dispatch(addToCart(makeItem()));
        await vi.advanceTimersByTimeAsync(600);
        expect(saveCartMock).toHaveBeenCalledTimes(1);
        expect(saveCartMock).toHaveBeenCalledWith(
            expect.arrayContaining([expect.objectContaining({ _id: "p1", quantity: 1 })])
        );
    });

    it("debounces rapid mutations into a single write with the final state", async () => {
        const store = makeStore();
        login(store);
        store.dispatch(addToCart(makeItem())); // qty 1
        store.dispatch(addToCart(makeItem())); // qty 2
        store.dispatch(addToCart(makeItem())); // qty 3
        await vi.advanceTimersByTimeAsync(600);
        expect(saveCartMock).toHaveBeenCalledTimes(1);
        const persisted = saveCartMock.mock.calls[0][0];
        expect(persisted[0].quantity).toBe(3);
    });

    it("does NOT write back setCart (server-originated replacement)", async () => {
        const store = makeStore();
        login(store);
        store.dispatch(setCart([makeItem("server")]));
        await vi.advanceTimersByTimeAsync(600);
        expect(saveCartMock).not.toHaveBeenCalled();
    });
});
