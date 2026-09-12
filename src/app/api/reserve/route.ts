import { adminDB } from "../../../../firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { loadOrderSession } from "../../../server/order-session";
import {
    isBusinessDay,
    isValidSlot,
    slotDocId,
} from "../../../lib/delivery";

/**
 * Ocupa el cupo de la franja elegida, una vez pagado el pedido.
 *
 * Tanto la identidad como la fecha y la franja salen de la sesión: antes este
 * endpoint no pedía sesión y tomaba el `clientId` del cuerpo, así que
 * cualquiera podía llenar todos los horarios sin comprar nada.
 */
export const POST = async (req: NextRequest) => {
    try {
        const session = await auth();
        const email = session?.user?.email;
        const clientId = session?.user?.id;
        if (!email || !clientId) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { sessionId } = await req.json();
        if (!sessionId) {
            return NextResponse.json(
                { error: "Falta el identificador del pedido." },
                { status: 400 }
            );
        }

        const order = await loadOrderSession(sessionId, email);
        if (!order) {
            return NextResponse.json(
                { error: "No se encontró el pedido." },
                { status: 404 }
            );
        }
        if (!order.paid) {
            return NextResponse.json(
                { error: "El pedido no está pagado." },
                { status: 400 }
            );
        }

        // Un pedido de Pick & Go no ocupa franja de reparto. Se valida la forma
        // de la fecha, no que siga dentro de la ventana de ocho días: si el
        // cliente abre `/success` al día siguiente, el cupo que compró sigue
        // siendo suyo.
        if (
            !order.deliveryDate ||
            !isBusinessDay(order.deliveryDate) ||
            !isValidSlot(order.deliverySlot)
        ) {
            return NextResponse.json(
                { message: "El pedido no requiere reservación." },
                { status: 200 }
            );
        }

        const slotRef = adminDB
            .collection("deliverySlots")
            .doc(slotDocId(order.deliveryDate, order.deliverySlot));

        // `set` con merge en vez de `update`: el documento de una fecha nueva
        // todavía no existe y `update` fallaría.
        await slotRef.set(
            {
                date: order.deliveryDate,
                slot: order.deliverySlot,
                reservations: FieldValue.arrayUnion({ clientId }),
            },
            { merge: true }
        );

        return NextResponse.json(
            { message: "Reservación exitosa." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reserve error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Error al reservar",
            },
            { status: 500 }
        );
    }
};
