import { adminDB } from "../../firebaseAdmin";
import { SLOT_CAPACITY, slotDocId } from "../lib/delivery";

/**
 * Cupo de una franja en una fecha.
 *
 * Vive aparte de la server action porque lo consultan dos sitios con dos
 * propósitos distintos: el carrito, para pintar la disponibilidad y habilitar
 * el botón, y `/api/checkout`, para no dejar pasar un pedido a una franja
 * llena aunque la petición no venga de nuestra interfaz. Tienen que aplicar la
 * misma regla, así que la regla se escribe una sola vez.
 */

export interface Reservation {
    clientId: string;
}

export interface SlotAvailability {
    reservations: Reservation[];
    /** El cliente ya tiene un pedido en esta misma franja y fecha. */
    clientHasReserved: boolean;
    isAvailable: boolean;
}

interface SlotData {
    date?: string;
    slot?: string;
    reservations?: Reservation[];
}

interface Props {
    clientId: string;
    deliveryDate: string;
    slot: string;
}

export const readSlotAvailability = async ({
    clientId,
    deliveryDate,
    slot,
}: Props): Promise<SlotAvailability> => {
    const slotRef = adminDB
        .collection("deliverySlots")
        .doc(slotDocId(deliveryDate, slot));

    // Se lee sin escribir: el documento lo crea la reserva, así que consultar
    // disponibilidad no deja rastro de franjas que nadie pidió.
    const snapshot = await slotRef.get();
    const data = (snapshot.data() as SlotData | undefined) ?? {};
    const reservations = data.reservations ?? [];

    const clientHasReserved = reservations.some(
        (reservation) => reservation.clientId === clientId
    );

    return {
        reservations,
        clientHasReserved,
        isAvailable: !clientHasReserved && reservations.length < SLOT_CAPACITY,
    };
};
