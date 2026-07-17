"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import {
    addUser,
    removeUser,
    setCart,
    addToCartBatch,
    resetCart,
} from "../lib/redux/features/cart/cartSlice";
import { getCart } from "../server/actions/cart";

// Bridges NextAuth session <-> Redux cart so that, for authenticated users,
// Firestore is the source of truth:
//   - Reload while logged in  -> server cart REPLACES local (server wins).
//   - Fresh login (guest -> auth) -> local guest cart is MERGED into the server
//     cart (reuses addToCartBatch semantics); the sync listener then persists
//     the merged result to Firestore.
//   - Logout -> clear the local view (Firestore keeps the cart for next login).
const CartSync = () => {
    const { data: session, status } = useSession();
    const dispatch = useDispatch();
    const prevStatus = useRef(status);

    useEffect(() => {
        if (status === "loading") return;

        let cancelled = false;

        const sync = async () => {
            if (status === "authenticated" && session?.user?.email) {
                // Arm the sync listener before any cart-mutating dispatch.
                dispatch(
                    addUser({
                        id: session.user.id ?? "",
                        name: session.user.name ?? "",
                        email: session.user.email,
                    })
                );

                const serverItems = await getCart();
                if (cancelled) return;

                if (prevStatus.current === "unauthenticated") {
                    // Fresh login: merge guest cart into the server cart.
                    dispatch(addToCartBatch(serverItems));
                } else {
                    // Reload while already logged in: server wins.
                    dispatch(setCart(serverItems));
                }
            } else if (status === "unauthenticated") {
                dispatch(removeUser());
                if (prevStatus.current === "authenticated") {
                    // Logout: clear the local view only.
                    dispatch(resetCart());
                }
            }

            if (!cancelled) {
                prevStatus.current = status;
            }
        };

        sync();

        return () => {
            cancelled = true;
        };
    }, [status, session?.user?.email, session?.user?.id, session?.user?.name, dispatch]);

    return null;
};

export default CartSync;
