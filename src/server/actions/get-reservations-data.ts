"use server";

import {
    readSlotAvailability,
    type Reservation,
} from "../delivery-slots";
import { isValidDeliveryDate, isValidSlot } from "../../lib/delivery";

interface Props {
    clientId: string;
    deliveryDate: string;
    selectedHour: string;
}

/**
 * Disponibilidad de una franja en una fecha, para el carrito.
 *
 * El modelo anterior guardaba un documento por franja (`hours/{franja}`) y lo
 * vaciaba cuando cambiaba el día, así que sólo podía representar "hoy". Con
 * entregas programadas hasta ocho días hábiles adelante cada par
 * (fecha, franja) necesita su propio documento: no hay nada que resetear,
 * porque un documento de una fecha pasada simplemente deja de consultarse.
 */
export const getReservationsData = async ({
    clientId,
    deliveryDate,
    selectedHour,
}: Props) => {
    if (!isValidDeliveryDate(deliveryDate) || !isValidSlot(selectedHour)) {
        // Una fecha fuera de rango no tiene cupo que consultar; se informa como
        // no disponible en vez de crear documentos basura.
        return {
            deliveryDate,
            selectedHour,
            reservations: [] as Reservation[],
            clientHasReserved: false,
            isAvailable: false,
        };
    }

    try {
        const availability = await readSlotAvailability({
            clientId,
            deliveryDate,
            slot: selectedHour,
        });

        return { deliveryDate, selectedHour, ...availability };
    } catch (error) {
        console.error(error);
        throw new Error(
            "Ocurrió un error al obtener los datos de las reservaciones."
        );
    }
};
