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

vi.mock("../sanity/lib/image", () => ({
    urlFor: () => ({ url: () => "/test.png" }),
}));

vi.mock("next/image", () => ({
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

const mockValidation = (ok: boolean) => {
    vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
            ok,
            json: async () => ({ message: "Error" }),
        })
    );
};

import toast from "react-hot-toast";
import cartReducer from "../lib/redux/features/cart/cartSlice";
import AddToCartModal from "./AddToCartModal";
import { ProductData } from "../../types";

const makeItem = (overrides: Partial<ProductData> = {}): ProductData =>
    ({
        _id: "p1",
        title: "Piña",
        slug: { current: "pina" },
        productType: "p",
        quantity: 0,
        matureQuantity: 0,
        greenQuantity: 0,
        kgQuantity: 0,
        kgPrice: 30,
        pPrice: 25,
        gramsPrice: 0,
        rowprice: 0,
        ...overrides,
    }) as ProductData;

const makeStore = () => configureStore({ reducer: { cart: cartReducer } });
const items = (store: ReturnType<typeof makeStore>) =>
    store.getState().cart.cartItems;

const renderModal = (
    item: ProductData,
    onClose = vi.fn(),
    store = makeStore()
) => {
    render(
        <Provider store={store}>
            <AddToCartModal item={item} open onClose={onClose} />
        </Provider>
    );
    return { store, onClose };
};

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("AddToCartModal", () => {
    it("no renderiza nada cerrado", () => {
        render(
            <Provider store={makeStore()}>
                <AddToCartModal item={makeItem()} open={false} onClose={vi.fn()} />
            </Provider>
        );
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("por pieza: agrega N piezas y cierra", async () => {
        mockValidation(true);
        const { store, onClose } = renderModal(makeItem());

        fireEvent.click(screen.getByLabelText("Sumar una pieza"));
        fireEvent.click(screen.getByLabelText("Sumar una pieza"));
        fireEvent.click(screen.getByText("Agregar al carrito"));

        await waitFor(() => expect(onClose).toHaveBeenCalled());
        expect(items(store)).toHaveLength(1);
        expect(items(store)[0].quantity).toBe(3);
    });

    it("por pieza: si la validación falla no agrega ni cierra", async () => {
        mockValidation(false);
        const { store, onClose } = renderModal(makeItem());

        fireEvent.click(screen.getByText("Agregar al carrito"));

        await waitFor(() => expect(toast.error).toHaveBeenCalled());
        expect(items(store)).toHaveLength(0);
        expect(onClose).not.toHaveBeenCalled();
    });

    it("por kg: muestra el campo de kilos y cierra al agregar", async () => {
        mockValidation(true);
        const { store, onClose } = renderModal(makeItem({ productType: "kg" }));

        fireEvent.change(screen.getByLabelText("Cantidad en kilogramos"), {
            target: { value: "1.5" },
        });
        fireEvent.click(screen.getByText("Agregar al carrito"));

        await waitFor(() => expect(onClose).toHaveBeenCalled());
        expect(items(store)[0].kgQuantity).toBe(1.5);
    });

    it("por kg con maduración: muestra Maduro/Verde", () => {
        renderModal(makeItem({ productType: "m-kg" }));
        expect(screen.getByText("Maduro")).toBeTruthy();
        expect(screen.getByText("Verde")).toBeTruthy();
    });

    it("cierra con Escape, con el fondo y con el botón X", () => {
        const { onClose } = renderModal(makeItem());

        fireEvent.keyDown(document, { key: "Escape" });
        fireEvent.click(screen.getByRole("dialog").parentElement!);
        fireEvent.click(screen.getByLabelText("Cerrar"));

        expect(onClose).toHaveBeenCalledTimes(3);
    });

    it("un clic dentro del modal no lo cierra", () => {
        const { onClose } = renderModal(makeItem());
        fireEvent.click(screen.getByRole("dialog"));
        expect(onClose).not.toHaveBeenCalled();
    });
});
