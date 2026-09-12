import { describe, it, expect } from "vitest";
import {
    DELIVERY_SLOTS,
    MAX_BUSINESS_DAYS_AHEAD,
    formatDeliveryDate,
    getDeliveryDates,
    isBusinessDay,
    isValidDeliveryDate,
    isValidISODate,
    isValidSlot,
    slotLabel,
    todayISO,
} from "./delivery";

// Mediodía UTC de un día concreto: lejos de cualquier frontera de día en CDMX,
// para que el "hoy" del test no dependa de la hora a la que se ejecute.
const at = (iso: string) => new Date(`${iso}T12:00:00Z`);

describe("todayISO", () => {
    it("usa el calendario de la Ciudad de México, no el del servidor", () => {
        // 03:30 UTC del día 12 son las 21:30 del día 11 en CDMX: para el
        // cliente todavía es día 11, y esa es la fecha que manda.
        expect(todayISO(new Date("2026-09-12T03:30:00Z"))).toBe("2026-09-11");
    });
});

describe("isValidISODate", () => {
    it("acepta una fecha real en formato YYYY-MM-DD", () => {
        expect(isValidISODate("2026-09-15")).toBe(true);
    });

    it("rechaza fechas que no existen aunque tengan el formato correcto", () => {
        expect(isValidISODate("2026-02-31")).toBe(false);
        expect(isValidISODate("2026-13-01")).toBe(false);
    });

    it("rechaza otros formatos y valores no textuales", () => {
        expect(isValidISODate("15/09/2026")).toBe(false);
        expect(isValidISODate("")).toBe(false);
        expect(isValidISODate(undefined)).toBe(false);
        expect(isValidISODate(20260915)).toBe(false);
    });
});

describe("isBusinessDay", () => {
    it("es cierto de lunes a viernes", () => {
        expect(isBusinessDay("2026-09-14")).toBe(true); // lunes
        expect(isBusinessDay("2026-09-11")).toBe(true); // viernes
    });

    it("es falso en sábado y domingo", () => {
        expect(isBusinessDay("2026-09-12")).toBe(false); // sábado
        expect(isBusinessDay("2026-09-13")).toBe(false); // domingo
    });
});

describe("getDeliveryDates", () => {
    it("ofrece exactamente los siguientes 8 días hábiles", () => {
        const dates = getDeliveryDates(at("2026-09-09")); // miércoles
        expect(dates).toEqual([
            "2026-09-10",
            "2026-09-11",
            "2026-09-14",
            "2026-09-15",
            "2026-09-16",
            "2026-09-17",
            "2026-09-18",
            "2026-09-21",
        ]);
        expect(dates).toHaveLength(MAX_BUSINESS_DAYS_AHEAD);
    });

    it("nunca incluye el día de hoy", () => {
        const today = "2026-09-14";
        expect(getDeliveryDates(at(today))).not.toContain(today);
    });

    it("nunca incluye sábados ni domingos", () => {
        expect(getDeliveryDates(at("2026-09-09")).every(isBusinessDay)).toBe(
            true
        );
    });

    it("desde un viernes, el primer día disponible es el lunes", () => {
        expect(getDeliveryDates(at("2026-09-11"))[0]).toBe("2026-09-14");
    });

    it("desde el fin de semana, el primer día disponible también es el lunes", () => {
        expect(getDeliveryDates(at("2026-09-12"))[0]).toBe("2026-09-14"); // sábado
        expect(getDeliveryDates(at("2026-09-13"))[0]).toBe("2026-09-14"); // domingo
    });

    it("cruza el cambio de año sin romperse", () => {
        expect(getDeliveryDates(at("2026-12-30"))).toEqual([
            "2026-12-31",
            "2027-01-01",
            "2027-01-04",
            "2027-01-05",
            "2027-01-06",
            "2027-01-07",
            "2027-01-08",
            "2027-01-11",
        ]);
    });
});

describe("isValidDeliveryDate", () => {
    const now = at("2026-09-09"); // miércoles

    it("acepta el primer y el último día del rango", () => {
        expect(isValidDeliveryDate("2026-09-10", now)).toBe(true);
        expect(isValidDeliveryDate("2026-09-21", now)).toBe(true);
    });

    it("rechaza hoy, el pasado y lo que va más allá del rango", () => {
        expect(isValidDeliveryDate("2026-09-09", now)).toBe(false); // hoy
        expect(isValidDeliveryDate("2026-09-08", now)).toBe(false); // ayer
        expect(isValidDeliveryDate("2026-09-22", now)).toBe(false); // 9.º hábil
    });

    it("rechaza fines de semana dentro del rango", () => {
        expect(isValidDeliveryDate("2026-09-12", now)).toBe(false); // sábado
        expect(isValidDeliveryDate("2026-09-13", now)).toBe(false); // domingo
    });

    it("rechaza basura sin lanzar", () => {
        expect(isValidDeliveryDate("mañana", now)).toBe(false);
        expect(isValidDeliveryDate(null, now)).toBe(false);
        expect(isValidDeliveryDate("2026-09-31", now)).toBe(false);
    });
});

describe("franjas", () => {
    it("ofrece 8 franjas de 9:00 a 17:00", () => {
        expect(DELIVERY_SLOTS).toHaveLength(8);
        expect(DELIVERY_SLOTS[0].value).toBe("9:00-10:00");
        expect(DELIVERY_SLOTS[DELIVERY_SLOTS.length - 1].value).toBe(
            "16:00-17:00"
        );
    });

    it("sólo acepta franjas de la lista", () => {
        expect(isValidSlot("9:00-10:00")).toBe(true);
        // Esta franja la aceptaba la API vieja aunque la UI jamás la ofreció.
        expect(isValidSlot("17:00-18:00")).toBe(false);
        expect(isValidSlot("")).toBe(false);
        expect(isValidSlot(undefined)).toBe(false);
    });

    it("traduce una franja a su etiqueta", () => {
        expect(slotLabel("13:00-14:00")).toBe("De 13:00 a 14:00 pm");
    });
});

describe("formatDeliveryDate", () => {
    it("escribe la fecha en español sin correrse de día", () => {
        expect(formatDeliveryDate("2026-09-15")).toBe("martes, 15 de septiembre");
    });

    it("devuelve cadena vacía si la fecha no es válida", () => {
        expect(formatDeliveryDate("no-es-fecha")).toBe("");
    });
});
