import { describe, it, expect, vi, beforeEach } from "vitest";

// `firebaseAdmin` evalúa credenciales al importarse, así que se sustituye por
// un doble que sólo sabe devolver el documento de la franja consultada.
const get = vi.fn();
const doc = vi.fn(() => ({ get }));
const collection = vi.fn((_path: string) => ({ doc }));
vi.mock("../../firebaseAdmin", () => ({
    adminDB: { collection: (path: string) => collection(path) },
}));

import { readSlotAvailability } from "./delivery-slots";
import { SLOT_CAPACITY } from "../lib/delivery";

const givenReservations = (reservations?: { clientId: string }[]) => {
    get.mockResolvedValue({
        data: () => (reservations ? { reservations } : undefined),
    });
};

const read = () =>
    readSlotAvailability({
        clientId: "u1",
        deliveryDate: "2026-09-15",
        slot: "9:00-10:00",
    });

beforeEach(() => {
    vi.clearAllMocks();
});

describe("readSlotAvailability", () => {
    it("consulta el documento de esa fecha y esa franja", async () => {
        givenReservations([]);
        await read();

        expect(collection).toHaveBeenCalledWith("deliverySlots");
        // La fecha forma parte de la llave: es lo que impide que el martes y
        // el viernes a las 9:00 compartan cupo.
        expect(doc).toHaveBeenCalledWith("2026-09-15_9:00-10:00");
    });

    it("una franja sin documento está libre", async () => {
        givenReservations(undefined);

        await expect(read()).resolves.toEqual({
            reservations: [],
            clientHasReserved: false,
            isAvailable: true,
        });
    });

    it("sigue habiendo lugar con un solo pedido", async () => {
        givenReservations([{ clientId: "otro" }]);

        const availability = await read();
        expect(availability.isAvailable).toBe(true);
    });

    it("se cierra al llegar a la capacidad", async () => {
        givenReservations([{ clientId: "otro" }, { clientId: "tercero" }]);

        const availability = await read();
        expect(SLOT_CAPACITY).toBe(2);
        expect(availability.reservations).toHaveLength(SLOT_CAPACITY);
        expect(availability.isAvailable).toBe(false);
        expect(availability.clientHasReserved).toBe(false);
    });

    it("no deja al mismo cliente repetir franja aunque quede lugar", async () => {
        givenReservations([{ clientId: "u1" }]);

        const availability = await read();
        expect(availability.clientHasReserved).toBe(true);
        expect(availability.isAvailable).toBe(false);
    });

    it("no escribe nada al consultar", async () => {
        givenReservations([]);
        const slotRef = doc();
        await read();

        expect(slotRef).not.toHaveProperty("set");
        expect(get).toHaveBeenCalled();
    });
});
