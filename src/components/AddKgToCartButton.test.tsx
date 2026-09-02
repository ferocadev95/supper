// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    render,
    screen,
    fireEvent,
    cleanup,
    waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("react-hot-toast", () => ({
    default: { success: vi.fn(), error: vi.fn() },
}));

// `/api/kg-input-validation` aplica el mismo rango que `isValidKgQuantity`;
// aquí se simula para probar ambas respuestas sin levantar el servidor.
const mockValidation = (ok: boolean) => {
    vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
            ok,
            json: async () => ({ message: "La cantidad ingresada es inválida." }),
        })
    );
};

import toast from "react-hot-toast";
import cartReducer from "../lib/redux/features/cart/cartSlice";
import AddKgToCartButton from "./AddKgToCartButton";
import MaturitySelect from "./MaturitySelect";
import { ProductData } from "../../types";

const makeItem = (overrides: Partial<ProductData> = {}): ProductData =>
    ({
        _id: "k1",
        title: "Plátano",
        productType: "kg",
        quantity: 0,
        matureQuantity: 0,
        greenQuantity: 0,
        kgQuantity: 0,
        kgPrice: 30,
        pPrice: 0,
        gramsPrice: 0,
        rowprice: 0,
        ...overrides,
    }) as ProductData;

const makeStore = () => configureStore({ reducer: { cart: cartReducer } });
const items = (store: ReturnType<typeof makeStore>) =>
    store.getState().cart.cartItems;

const renderWith = (
    store: ReturnType<typeof makeStore>,
    ui: React.ReactElement
) => render(<Provider store={store}>{ui}</Provider>);

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("AddKgToCartButton", () => {
    it("agrega la cantidad escrita en kg", async () => {
        mockValidation(true);
        const store = makeStore();
        renderWith(store, <AddKgToCartButton item={makeItem()} />);

        fireEvent.change(screen.getByLabelText("Cantidad en kilogramos"), {
            target: { value: "1.75" },
        });
        fireEvent.click(screen.getByText("Agregar al carrito"));

        await waitFor(() => expect(items(store)).toHaveLength(1));
        expect(items(store)[0].kgQuantity).toBe(1.75);
    });

    it("rechaza una cantidad inválida sin tocar el carrito", async () => {
        mockValidation(false);
        const store = makeStore();
        renderWith(store, <AddKgToCartButton item={makeItem()} />);

        fireEvent.change(screen.getByLabelText("Cantidad en kilogramos"), {
            target: { value: "0" },
        });
        fireEvent.click(screen.getByText("Agregar al carrito"));

        await waitFor(() => expect(toast.error).toHaveBeenCalled());
        expect(items(store)).toHaveLength(0);
    });

    it("no agrega nada con el campo vacío", async () => {
        mockValidation(false);
        const store = makeStore();
        renderWith(store, <AddKgToCartButton item={makeItem()} />);

        fireEvent.click(screen.getByText("Agregar al carrito"));

        await waitFor(() => expect(toast.error).toHaveBeenCalled());
        expect(items(store)).toHaveLength(0);
    });
});

describe("MaturitySelect", () => {
    const mkItem = makeItem({ _id: "m1", productType: "m-kg" });

    it("agrega al lado maduro por defecto", async () => {
        mockValidation(true);
        const store = makeStore();
        renderWith(store, <MaturitySelect item={mkItem} />);

        fireEvent.change(screen.getByLabelText("Cantidad en kilogramos"), {
            target: { value: "2" },
        });
        fireEvent.click(screen.getByText("Agregar al carrito"));

        await waitFor(() => expect(items(store)).toHaveLength(1));
        expect(items(store)[0].matureQuantity).toBe(2);
        expect(items(store)[0].greenQuantity).toBeFalsy();
    });

    it("agrega al lado verde cuando se selecciona Verde", async () => {
        mockValidation(true);
        const store = makeStore();
        renderWith(store, <MaturitySelect item={mkItem} />);

        fireEvent.click(screen.getByText("Verde"));
        fireEvent.change(screen.getByLabelText("Cantidad en kilogramos"), {
            target: { value: "1.5" },
        });
        fireEvent.click(screen.getByText("Agregar al carrito"));

        await waitFor(() => expect(items(store)).toHaveLength(1));
        expect(items(store)[0].greenQuantity).toBe(1.5);
        expect(items(store)[0].matureQuantity).toBeFalsy();
    });

    it("rechaza una cantidad inválida", async () => {
        mockValidation(false);
        const store = makeStore();
        renderWith(store, <MaturitySelect item={mkItem} />);

        fireEvent.change(screen.getByLabelText("Cantidad en kilogramos"), {
            target: { value: "500" },
        });
        fireEvent.click(screen.getByText("Agregar al carrito"));

        await waitFor(() => expect(toast.error).toHaveBeenCalled());
        expect(items(store)).toHaveLength(0);
    });
});
