/**
 * Zonas de entrega por código postal.
 *
 * Fuente única para la página de zonas de entrega, el aviso del carrito y la
 * validación de `/api/checkout`: los códigos que se muestran al cliente son
 * exactamente los que el servidor acepta. Puro (sin imports de servidor), así
 * que se puede usar en ambos lados.
 *
 * El costo de envío y el umbral de envío gratis son fijos para todas las zonas
 * (`SHIPPING_COST` / `FREE_SHIPPING_THRESHOLD` en `pricing.ts`); lo único que
 * cambia por zona es el pedido mínimo.
 */

export type ZoneId = "principal" | "extendida";

export interface DeliveryZone {
    id: ZoneId;
    label: string;
    emoji: string;
    /** Subtotal mínimo (sin envío) para poder pagar un pedido en la zona. */
    minOrder: number;
    zipCodes: readonly string[];
}

export const DELIVERY_ZONES: readonly DeliveryZone[] = [
    {
        id: "principal",
        label: "Zona principal",
        emoji: "🟢",
        minOrder: 300,
        zipCodes: [
            "53100", "53119", "53120", "53125", "53126", "53129", "53300",
            "53309", "53310", "53329", "53339", "54020", "54026", "54050",
        ],
    },
    {
        id: "extendida",
        label: "Zona extendida",
        emoji: "🟡",
        minOrder: 500,
        zipCodes: [
            "52930", "52934", "52936", "52937", "52938", "52989", "53227",
            "53228", "53240", "53247", "53248", "53250", "53270", "53278",
            "53279", "53280", "53283", "53290", "53296", "53297", "53298",
            "54578",
        ],
    },
];

/** Zona a la que pertenece un código postal, o `null` si no hay cobertura. */
export const getZoneForZip = (zip: unknown): DeliveryZone | null => {
    if (typeof zip !== "string" && typeof zip !== "number") return null;
    const normalized = String(zip).trim();
    if (!/^\d{5}$/.test(normalized)) return null;
    return (
        DELIVERY_ZONES.find((zone) => zone.zipCodes.includes(normalized)) ??
        null
    );
};

export const WHATSAPP_NUMBER = "525610719284";

/** Enlace a WhatsApp, opcionalmente con un mensaje prellenado. */
export const whatsappUrl = (message?: string): string =>
    message
        ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
        : `https://wa.me/${WHATSAPP_NUMBER}`;

/** Mensaje prellenado para consultar cobertura de un CP fuera de zona. */
export const coverageInquiryUrl = (zip?: string): string =>
    whatsappUrl(
        zip
            ? `Hola, quisiera saber si pueden entregar en el código postal ${zip}.`
            : "Hola, quisiera saber si pueden entregar en mi código postal."
    );
