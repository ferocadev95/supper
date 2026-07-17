// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useSession } from "next-auth/react";

// getCart pulls in firebaseAdmin (env at import time) — mock the whole module.
vi.mock("../server/actions/cart", () => ({
    getCart: vi.fn().mockResolvedValue([]),
    saveCart: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("next-auth/react", () => ({ useSession: vi.fn() }));

import { getCart } from "../server/actions/cart";
import cartReducer, { addToCart } from "../lib/redux/features/cart/cartSlice";
import CartSync from "./CartSync";
import { ProductData } from "../../types";

const getCartMock = vi.mocked(getCart);
const useSessionMock = vi.mocked(useSession);

const makeItem = (id: string, quantity = 1): ProductData =>
    ({
        _id: id,
        title: id,
        productType: "p",
        quantity,
        matureQuantity: 0,
        greenQuantity: 0,
        kgQuantity: 0,
        kgPrice: 10,
        pPrice: 5,
        gramsPrice: 1,
        rowprice: 0,
    }) as ProductData;

const makeStore = () => configureStore({ reducer: { cart: cartReducer } });

const authed = { data: { user: { id: "1", name: "Ana", email: "a@b.com" } }, status: "authenticated" } as never;
const guest = { data: null, status: "unauthenticated" } as never;

const renderWith = (store: ReturnType<typeof makeStore>) =>
    render(
        <Provider store={store}>
            <CartSync />
        </Provider>
    );

describe("CartSync", () => {
    beforeEach(() => {
        getCartMock.mockReset();
        getCartMock.mockResolvedValue([]);
    });
    afterEach(() => cleanup());

    it("replaces the local cart with the server cart on reload while authenticated", async () => {
        const store = makeStore();
        store.dispatch(addToCart(makeItem("stale-local")));
        getCartMock.mockResolvedValue([makeItem("from-server", 4)]);

        useSessionMock.mockReturnValue(authed);
        renderWith(store);

        await waitFor(() => {
            const ids = store.getState().cart.cartItems.map((i) => i._id);
            expect(ids).toEqual(["from-server"]);
        });
        expect(store.getState().cart.cartItems[0].quantity).toBe(4);
        expect(store.getState().cart.userInfo?.email).toBe("a@b.com");
    });

    it("merges the guest cart into the server cart on a fresh login", async () => {
        const store = makeStore();
        store.dispatch(addToCart(makeItem("guest-item"))); // qty 1, built as guest

        // First render as guest.
        useSessionMock.mockReturnValue(guest);
        const { rerender } = renderWith(store);

        // Then the user logs in; server returns its own cart.
        getCartMock.mockResolvedValue([makeItem("server-item", 2)]);
        useSessionMock.mockReturnValue(authed);
        rerender(
            <Provider store={store}>
                <CartSync />
            </Provider>
        );

        await waitFor(() => {
            const ids = store.getState().cart.cartItems.map((i) => i._id).sort();
            expect(ids).toEqual(["guest-item", "server-item"]);
        });
    });

    it("clears the local cart on logout", async () => {
        const store = makeStore();
        getCartMock.mockResolvedValue([makeItem("owned", 2)]);

        // Mount authenticated (server cart hydrates local).
        useSessionMock.mockReturnValue(authed);
        const { rerender } = renderWith(store);
        await waitFor(() => {
            expect(store.getState().cart.cartItems).toHaveLength(1);
        });

        // Log out.
        useSessionMock.mockReturnValue(guest);
        rerender(
            <Provider store={store}>
                <CartSync />
            </Provider>
        );

        await waitFor(() => {
            expect(store.getState().cart.cartItems).toHaveLength(0);
            expect(store.getState().cart.userInfo).toBeNull();
        });
    });
});
