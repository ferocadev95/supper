import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { saveCart } from "../../server/actions/cart";
import {
    addToCart,
    addToCartFruitVegetableMature,
    addToCartFruitVegetableGreen,
    addToCartKgQuantity,
    addToCartBatch,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    resetCart,
} from "./features/cart/cartSlice";

export const cartSyncListener = createListenerMiddleware();

// Single write-through point: whenever the cart mutates AND the user is
// authenticated, persist the current cart to Firestore (debounced). `setCart`,
// `addUser` and `removeUser` are intentionally NOT matched here — `setCart`
// originates from the server, so writing it back would be redundant.
cartSyncListener.startListening({
    matcher: isAnyOf(
        addToCart,
        addToCartFruitVegetableMature,
        addToCartFruitVegetableGreen,
        addToCartKgQuantity,
        addToCartBatch,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        resetCart
    ),
    effect: async (_action, listenerApi) => {
        const state = listenerApi.getState() as RootState;

        // Guests persist via redux-persist (localStorage) only.
        if (!state.cart.userInfo?.email) {
            return;
        }

        // Debounce: cancel any in-flight run and coalesce rapid changes.
        listenerApi.cancelActiveListeners();
        await listenerApi.delay(500);

        const items = (listenerApi.getState() as RootState).cart.cartItems;
        await saveCart(items);
    },
});
