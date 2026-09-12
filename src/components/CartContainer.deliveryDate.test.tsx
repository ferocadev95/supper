// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import type { Session } from "next-auth";

vi.mock("../lib/shipping", () => ({ PICKUP_ENABLED: false }));
vi.mock("../server/pricing", () => ({
    getCartPricing: vi.fn(async () => ({})),
}));

interface ReservationArgs {
    clientId: string;
    deliveryDate: string;
    selectedHour: string;
}

const getReservationsData = vi.fn(async (_args: ReservationArgs) => ({
    clientHasReserved: false,
    reservations: [],
    isAvailable: true,
}));
vi.mock("../server/actions/get-reservations-data", () => ({
    getReservationsData: (args: ReservationArgs) => getReservationsData(args),
}));
vi.mock("../sanity/lib/image", () => ({
    urlFor: () => ({ url: () => "https://example.test/img.png" }),
}));
vi.mock("react-hot-toast", () => ({
    default: { success: vi.fn(), error: vi.fn() },
}));

import cartReducer, { setCart } from "../lib/redux/features/cart/cartSlice";
import CartContainer from "./CartContainer";
import {
    MAX_BUSINESS_DAYS_AHEAD,
    formatDeliveryDateShort,
    getDeliveryDates,
} from "../lib/delivery";
import { ProductData } from "../../types";

const item = {
    _id: "p1",
    title: "Tomate saladet",
    slug: { current: "tomate-saladet" },
    image: { _type: "image" },
    productType: "kg",
    quantity: 0,
    matureQuantity: 0,
    greenQuantity: 0,
    kgQuantity: 2,
    kgPrice: 30,
    pPrice: 0,
    gramsPrice: 0,
    rowprice: 60,
} as unknown as ProductData;

const session = { user: { id: "u1", email: "a@b.test" } } as unknown as Session;

const renderCart = async () => {
    const store = configureStore({ reducer: { cart: cartReducer } });
    store.dispatch(setCart([item]));
    await act(async () => {
        render(
            <Provider store={store}>
                <CartContainer session={session} />
            </Provider>
        );
    });
};

const dayButton = (iso: string) =>
    screen.getByRole("button", {
        name: new RegExp(formatDeliveryDateShort(iso), "i"),
    });

beforeEach(() => {
    getReservationsData.mockClear();
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("CartContainer: día de entrega", () => {
    it("ofrece los siguientes días hábiles y preselecciona el primero", async () => {
        await renderCart();
        const dates = getDeliveryDates();

        expect(
            screen.getByText(/selecciona el día de entrega/i)
        ).toBeInTheDocument();
        dates.forEach((date) => expect(dayButton(date)).toBeInTheDocument());

        // El primer día disponible arranca marcado, así que el carrito nunca
        // manda al checkout una fecha vacía.
        expect(dayButton(dates[0]).className).toContain("border-primaryGreen");
        expect(dayButton(dates[1]).className).not.toContain(
            "border-primaryGreen"
        );
    });

    it("anuncia que se entrega de lunes a viernes, hasta 8 días hábiles", async () => {
        await renderCart();

        expect(screen.getByText(/lunes a\s+viernes/i)).toBeInTheDocument();
        expect(screen.getByText(/8 días hábiles/i)).toBeInTheDocument();
        expect(screen.queryByText(/sábado/i)).not.toBeInTheDocument();
    });

    it("consulta la disponibilidad del día elegido, no sólo de la franja", async () => {
        await renderCart();
        const dates = getDeliveryDates();

        expect(getReservationsData).toHaveBeenLastCalledWith({
            clientId: "u1",
            deliveryDate: dates[0],
            selectedHour: "9:00-10:00",
        });

        await act(async () => {
            fireEvent.click(dayButton(dates[2]));
        });

        await waitFor(() =>
            expect(getReservationsData).toHaveBeenLastCalledWith({
                clientId: "u1",
                deliveryDate: dates[2],
                selectedHour: "9:00-10:00",
            })
        );
        expect(dayButton(dates[2]).className).toContain("border-primaryGreen");
    });

    it("manda al checkout el día y la franja seleccionados", async () => {
        const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => ({
            json: async () => ({ url: null, error: null }),
        }));
        vi.stubGlobal("fetch", fetchMock);

        await renderCart();
        const dates = getDeliveryDates();

        await act(async () => {
            fireEvent.click(dayButton(dates[3]));
            fireEvent.click(
                screen.getByRole("button", { name: /de 13:00 a 14:00 pm/i })
            );
        });
        await act(async () => {
            fireEvent.click(
                screen.getByRole("button", { name: /proceder al pago/i })
            );
        });

        expect(fetchMock).toHaveBeenCalledWith(
            "/api/checkout",
            expect.objectContaining({ method: "POST" })
        );
        const body = JSON.parse(
            String(fetchMock.mock.calls[0][1].body)
        );
        expect(body.deliveryDate).toBe(dates[3]);
        expect(body.selectedHour).toBe("13:00-14:00");
    });

    it("bloquea el pago cuando la franja ya está llena", async () => {
        getReservationsData.mockResolvedValueOnce({
            clientHasReserved: false,
            reservations: [{ clientId: "a" }, { clientId: "b" }],
            isAvailable: false,
        } as never);

        await renderCart();

        expect(screen.getByText(/horario no disponible/i)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /proceder al pago/i })
        ).toBeDisabled();
    });

    it("permite pagar cuando la franja tiene lugar", async () => {
        await renderCart();

        expect(screen.getByText(/horario disponible/i)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /proceder al pago/i })
        ).toBeEnabled();
    });

    it("ofrece exactamente 8 opciones de día", async () => {
        await renderCart();
        const dates = getDeliveryDates();
        expect(dates).toHaveLength(MAX_BUSINESS_DAYS_AHEAD);
        expect(
            dates.filter((date) => dayButton(date)).length
        ).toBe(MAX_BUSINESS_DAYS_AHEAD);
    });
});
