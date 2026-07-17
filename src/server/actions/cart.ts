"use server";

import { adminDB } from "../../../firebaseAdmin";
import { auth } from "../../../auth";
import { ProductData } from "../../../types";

// Reads the authenticated user's cart from Firestore. Returns [] for guests.
// The email is always derived from the session, never trusted from the client.
export const getCart = async (): Promise<ProductData[]> => {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
        return [];
    }

    try {
        const userDoc = await adminDB.collection("usersInfo").doc(email).get();
        return (userDoc.data()?.cart as ProductData[]) ?? [];
    } catch (error) {
        console.error("Error reading cart from Firestore", error);
        return [];
    }
};

// Persists the authenticated user's cart to Firestore. No-op for guests.
// Firestore rejects `undefined` values, so items are sanitized via a JSON
// round-trip (which also guarantees plain, serializable objects).
export const saveCart = async (items: ProductData[]): Promise<void> => {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
        return;
    }

    try {
        const sanitized = JSON.parse(JSON.stringify(items ?? []));
        await adminDB
            .collection("usersInfo")
            .doc(email)
            .set({ cart: sanitized }, { merge: true });
    } catch (error) {
        console.error("Error saving cart to Firestore", error);
    }
};
