// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, screen, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import type { Session } from "next-auth";

// La bandera se lee al importar el módulo, así que apagarla obliga a un fichero
// propio: dentro de un mismo test no se puede reimportar `CartContainer` con
// otra configuración.
vi.mock("../lib/shipping", () => ({ PICKUP_ENABLED: false }));

// Server actions: en jsdom no hay servidor al que llamar, y el carrito sólo
// necesita que resuelvan para pintar.
vi.mock("../server/pricing", () => ({ getCartPricing: vi.fn(async () => ({})) }));
vi.mock("../server/actions/get-reservations-data", () => ({
    getReservationsData: vi.fn(async () => ({
        clientHasReserved: false,
        reservations: [],
    })),
}));
vi.mock("../sanity/lib/image", () => ({
    urlFor: () => ({ url: () => "https://example.test/img.png" }),
}));
vi.mock("react-hot-toast", () => ({
    default: { success: vi.fn(), error: vi.fn() },
}));

import cartReducer, {
    setCart,
} from "../lib/redux/features/cart/cartSlice";
import CartContainer from "./CartContainer";
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

// Se monta dentro de `act` porque el carrito arranca dos efectos asíncronos
// (precios canónicos y disponibilidad de horarios) que asientan estado.
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

afterEach(cleanup);

describe("CartContainer con el Pick & Go apagado", () => {
    it("no ofrece el selector de método de envío ni la recolección en sucursal", async () => {
        await renderCart();

        expect(
            screen.queryByRole("button", { name: /pick & go/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /a domicilio/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(/selecciona el método de envío/i)
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(/lugar de recolección/i)
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /plaza bona/i })
        ).not.toBeInTheDocument();
    });

    it("va directo a la entrega a domicilio: horarios y código postal", async () => {
        await renderCart();

        expect(screen.getByText(/selecciona un horario/i)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /de 9:00 a 10:00 am/i })
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText(/ingresa tu código postal/i)
        ).toBeInTheDocument();
    });
});
