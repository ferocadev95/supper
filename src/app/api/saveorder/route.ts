import { adminDB } from "../../../../firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { resolveOrder, SlimLine } from "../../../server/pricing";
import { loadOrderSession } from "../../../server/order-session";
import {
    sendNewOrderAdminEmail,
    sendOrderConfirmationEmail,
} from "../../../lib/send-email";

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

        // Los datos de entrega salen de la sesión de Stripe, no del cliente:
        // es lo que se cobró y lo único que no se puede alterar desde el
        // navegador después de pagar.
        const order = await loadOrderSession(id, email);
        if (!order) {
            return NextResponse.json(
                { success: false, message: "No se encontró el pedido." },
                { status: 404 }
            );
        }

        // Recompute amounts from Sanity — never trust a client-sent total.
        const { resolvedItems, subtotal, shipping, total } =
            await resolveOrder(lines as SlimLine[]);

        const phone = phoneNumber || order.phone || null;

        const orderItem = {
            // `amount` keeps its historical meaning (subtotal, shown as
            // "Monto Total" in Orders.tsx); `total` is the charged amount.
            amount: subtotal,
            subtotal,
            shipping,
            total,
            items: resolvedItems,
            phoneNumber: phone,
            // Fechas del pedido: hasta ahora el documento no guardaba ninguna,
            // así que no se podía ni ordenar el historial ni saber cuándo se
            // entrega.
            createdAt: order.createdAt,
            deliveryDate: order.deliveryDate,
            deliverySlot: order.deliverySlot,
            shippingMethod: order.shippingMethod,
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
            await userDocRef.set({ phoneNumber: phone }, { merge: true });
        }

        const userDoc = await userOrderReference.get();
        if (!userDoc?.exists) {
            await userOrderReference.set({ email });
        }
        // Se lee antes de escribir para no reenviar el correo si el cliente
        // recarga `/success` con el carrito todavía lleno.
        const alreadyNotified = Boolean(userDoc?.data()?.value?.emailSentAt);
        const adminsAlreadyNotified = Boolean(
            userDoc?.data()?.value?.adminEmailSentAt
        );
        await userOrderReference.set({ value: orderItem }, { merge: true });

        if (!adminsAlreadyNotified) {
            try {
                const sent = await sendNewOrderAdminEmail({
                    orderId: id,
                    customerEmail: email,
                    items: resolvedItems,
                    subtotal,
                    shipping,
                    total,
                    deliveryDate: order.deliveryDate,
                    deliverySlot: order.deliverySlot,
                    shippingMethod: order.shippingMethod,
                    pickupLocation: order.pickupLocation,
                    address: order.address,
                    phoneNumber: phone,
                });
                if (sent) {
                    await userOrderReference.set(
                        {
                            value: {
                                adminEmailSentAt: new Date().toISOString(),
                            },
                        },
                        { merge: true }
                    );
                }
            } catch (error) {
                console.error(
                    "Error enviando el aviso de venta a administradores:",
                    error
                );
            }
        }

        if (!alreadyNotified) {
            // El pedido ya está guardado: un fallo del proveedor de correo no
            // puede convertir una compra buena en un error para el cliente.
            try {
                await sendOrderConfirmationEmail({
                    to: email,
                    orderId: id,
                    items: resolvedItems,
                    subtotal,
                    shipping,
                    total,
                    deliveryDate: order.deliveryDate,
                    deliverySlot: order.deliverySlot,
                    shippingMethod: order.shippingMethod,
                    pickupLocation: order.pickupLocation,
                    address: order.address,
                    phoneNumber: phone,
                });
                await userOrderReference.set(
                    { value: { emailSentAt: new Date().toISOString() } },
                    { merge: true }
                );
            } catch (error) {
                console.error(
                    "Error enviando la confirmación del pedido:",
                    error
                );
            }
        }

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
