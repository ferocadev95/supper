/**
 * Fechas y franjas de entrega.
 *
 * Fuente única para el carrito y para la validación del servidor. Antes cada
 * lado tenía su propia lista de franjas y se habían desincronizado (la API
 * aceptaba una `17:00-18:00` que la UI nunca ofreció), así que todo lo que
 * define qué es una entrega válida vive aquí.
 *
 * Las fechas se manejan siempre como `YYYY-MM-DD` **del calendario de la Ciudad
 * de México**: es lo que el cliente eligió, no depende de dónde corra el
 * servidor ni de la zona del navegador del administrador, y al ser una cadena
 * ordenable se compara y se guarda sin ambigüedad.
 */

export const DELIVERY_TZ = "America/Mexico_City";

/** Cuántos días hábiles hacia adelante se pueden programar. */
export const MAX_BUSINESS_DAYS_AHEAD = 8;

/** Pedidos que caben en una misma franja de un mismo día. */
export const SLOT_CAPACITY = 2;

/**
 * Identificador del cupo en Firestore. Antes el cupo era global por franja, así
 * que un pedido del martes y uno del viernes a las 9:00 competían por el mismo
 * lugar; la fecha forma parte de la llave para que cada día tenga el suyo.
 */
export const slotDocId = (deliveryDate: string, slot: string): string =>
    `${deliveryDate}_${slot}`;

export interface DeliverySlot {
    value: string;
    label: string;
}

/** Las franjas que se ofrecen y las únicas que el checkout acepta. */
export const DELIVERY_SLOTS: readonly DeliverySlot[] = [
    { value: "9:00-10:00", label: "De 9:00 a 10:00 am" },
    { value: "10:00-11:00", label: "De 10:00 a 11:00 am" },
    { value: "11:00-12:00", label: "De 11:00 a 12:00 pm" },
    { value: "12:00-13:00", label: "De 12:00 a 13:00 pm" },
    { value: "13:00-14:00", label: "De 13:00 a 14:00 pm" },
    { value: "14:00-15:00", label: "De 14:00 a 15:00 pm" },
    { value: "15:00-16:00", label: "De 15:00 a 16:00 pm" },
    { value: "16:00-17:00", label: "De 16:00 a 17:00 pm" },
];

const MS_PER_DAY = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// `en-CA` con estas opciones produce exactamente `YYYY-MM-DD`.
const isoFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: DELIVERY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

const longFormatter = new Intl.DateTimeFormat("es-MX", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
});

const shortFormatter = new Intl.DateTimeFormat("es-MX", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
});

/**
 * Fecha ISO → milisegundos de la medianoche UTC de ese día. Toda la aritmética
 * se hace en UTC: la cadena ya es la fecha del calendario mexicano, así que no
 * hay que volver a aplicar una zona horaria (y en UTC no hay horario de verano
 * que mueva la duración de un día).
 */
const isoToUTC = (iso: string): number => {
    const [year, month, day] = iso.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
};

const utcToISO = (ms: number): string => {
    const date = new Date(ms);
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${date.getUTCFullYear()}-${month}-${day}`;
};

/**
 * Además del formato, comprueba que la fecha exista: `2026-02-31` pasa la
 * expresión regular pero `Date.UTC` la convertiría en marzo, así que se exige
 * que el viaje de ida y vuelta devuelva la misma cadena.
 */
export const isValidISODate = (iso: unknown): iso is string =>
    typeof iso === "string" &&
    ISO_DATE.test(iso) &&
    utcToISO(isoToUTC(iso)) === iso;

/** Hoy, en el calendario de la Ciudad de México. */
export const todayISO = (now: Date = new Date()): string =>
    isoFormatter.format(now);

/** Lunes a viernes. Sábado y domingo no son días de entrega. */
export const isBusinessDay = (iso: string): boolean => {
    if (!isValidISODate(iso)) return false;
    const weekday = new Date(isoToUTC(iso)).getUTCDay();
    return weekday >= 1 && weekday <= 5;
};

/**
 * Los días que el cliente puede elegir: los siguientes
 * `MAX_BUSINESS_DAYS_AHEAD` días hábiles. Empieza a contar en mañana, así que
 * el mismo día nunca aparece, y al filtrar por día hábil los fines de semana
 * quedan fuera por construcción.
 */
export const getDeliveryDates = (now: Date = new Date()): string[] => {
    const dates: string[] = [];
    let cursor = isoToUTC(todayISO(now));

    while (dates.length < MAX_BUSINESS_DAYS_AHEAD) {
        cursor += MS_PER_DAY;
        const iso = utcToISO(cursor);
        if (isBusinessDay(iso)) dates.push(iso);
    }

    return dates;
};

/** Una fecha vale si es una de las que la UI pudo ofrecer en este momento. */
export const isValidDeliveryDate = (
    iso: unknown,
    now: Date = new Date()
): iso is string =>
    isValidISODate(iso) && getDeliveryDates(now).includes(iso);

export const isValidSlot = (value: unknown): value is string =>
    typeof value === "string" &&
    DELIVERY_SLOTS.some((slot) => slot.value === value);

/** "martes, 15 de septiembre" — para correos y confirmaciones. */
export const formatDeliveryDate = (iso: string): string =>
    isValidISODate(iso) ? longFormatter.format(new Date(isoToUTC(iso))) : "";

/** "mar, 15 sept" — para los botones del carrito, donde el espacio es corto. */
export const formatDeliveryDateShort = (iso: string): string =>
    isValidISODate(iso) ? shortFormatter.format(new Date(isoToUTC(iso))) : "";

/** Etiqueta legible de una franja ("9:00-10:00" → "De 9:00 a 10:00 am"). */
export const slotLabel = (value: string): string =>
    DELIVERY_SLOTS.find((slot) => slot.value === value)?.label ?? value;
