import { adminDB } from "../../../../firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { resolveOrder, SlimLine } from "../../../server/pricing";

export const POST = async (req: NextRequest) => {
    try {
        // Email comes from the session, never from the client body.
        const session = await auth();
        const email = session?.user?.email;
        if (!email) {
            return NextResponse.json(
                { success: false, message: "No autenticado" },
                { status: 401 }
            );
        }

        const reqBody = await req.json();
        const { id, lines, phoneNumber } = reqBody;

        if (!id || !Array.isArray(lines) || lines.length === 0) {
            return NextResponse.json(
                { success: false, message: "Pedido inválido" },
                { status: 400 }
            );
        }

        // Recompute amounts from Sanity — never trust a client-sent total.
        const { resolvedItems, subtotal, shipping, total } =
            await resolveOrder(lines as SlimLine[]);

        const orderItem = {
            // `amount` keeps its historical meaning (subtotal, shown as
            // "Monto Total" in Orders.tsx); `total` is the charged amount.
            amount: subtotal,
            subtotal,
            shipping,
            total,
            items: resolvedItems,
            phoneNumber: phoneNumber || null,
        };

        const userOrderReference = adminDB
            .collection("usersInfo")
            .doc(email)
            .collection("orders")
            .doc(id);

        // Add phoneNumber to the user's document if it doesn't already exist
        const userDocRef = adminDB.collection("usersInfo").doc(email);
        const userDocSnapshot = await userDocRef.get();
        if (!userDocSnapshot.exists || !userDocSnapshot.data()?.phoneNumber) {
            await userDocRef.set({ phoneNumber }, { merge: true });
        }

        const userDoc = await userOrderReference.get();
        if (!userDoc?.exists) {
            await userOrderReference.set({ email });
        }
        await userOrderReference.set({ value: orderItem }, { merge: true });

        return NextResponse.json(
            {
                success: true,
                message: "Order saved successfully",
                subtotal,
                shipping,
                total,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Save order error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Error",
            },
            { status: 500 }
        );
    }
};
