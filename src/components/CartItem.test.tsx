// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// `urlFor` builds a Sanity image URL from env config; the row only needs a string.
vi.mock("../sanity/lib/image", () => ({
    urlFor: () => ({ url: () => "https://example.test/img.png" }),
}));
vi.mock("react-hot-toast", () => ({
    default: { success: vi.fn(), error: vi.fn() },
}));

import toast from "react-hot-toast";
import cartReducer, {
    setCart,
    addToCartKgQuantity,
    addToCartFruitVegetableMature,
    addToCartFruitVegetableGreen,
} from "../lib/redux/features/cart/cartSlice";
import CartItem from "./CartItem";
import { ProductData } from "../../types";

const makeItem = (overrides: Partial<ProductData> = {}): ProductData =>
    ({
        _id: "p1",
        title: "Tomate saladet",
        slug: { current: "tomate-saladet" },
        image: { _type: "image" },
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

const renderRow = (store: ReturnType<typeof makeStore>, item: ProductData) =>
    render(
        <Provider store={store}>
            <CartItem cart={[item]} item={item} />
        </Provider>
    );

const line = (store: ReturnType<typeof makeStore>) =>
    store.getState().cart.cartItems[0];

/** Escribe en el input y confirma con blur, como haría la persona usuaria. */
const type = (input: HTMLElement, value: string) => {
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);
};

beforeEach(() => {
    vi.clearAllMocks();
});
afterEach(cleanup);

describe("CartItem: edición de cantidades por peso", () => {
    it("kg: escribir una cantidad válida actualiza el carrito", () => {
        const item = makeItem({ kgQuantity: 1 });
        const store = makeStore();
        store.dispatch(addToCartKgQuantity({ item, kgQuantity: 1 }));
        renderRow(store, line(store));

        type(screen.getByLabelText("Cantidad en kilogramos"), "2.5");

        expect(line(store).kgQuantity).toBe(2.5);
    });

    it("100g: usa el mismo input en kg", () => {
        const item = makeItem({
            _id: "g1",
            productType: "100g",
            gramsPrice: 4,
            kgQuantity: 0.5,
        });
        const store = makeStore();
        store.dispatch(addToCartKgQuantity({ item, kgQuantity: 0.5 }));
        renderRow(store, line(store));

        type(screen.getByLabelText("Cantidad en kilogramos"), "1.2");

        expect(line(store).kgQuantity).toBe(1.2);
    });

    it("rechaza cantidades fuera de rango y revierte el campo", () => {
        const item = makeItem({ kgQuantity: 2 });
        const store = makeStore();
        store.dispatch(addToCartKgQuantity({ item, kgQuantity: 2 }));
        renderRow(store, line(store));

        const input = screen.getByLabelText(
            "Cantidad en kilogramos"
        ) as HTMLInputElement;

        type(input, "150");
        expect(line(store).kgQuantity).toBe(2);
        expect(input.value).toBe("2");
        expect(toast.error).toHaveBeenCalled();

        type(input, "0");
        expect(line(store).kgQuantity).toBe(2);
        expect(input.value).toBe("2");
    });

    it("m-kg: maduro y verde se editan de forma independiente", () => {
        const item = makeItem({
            _id: "m1",
            productType: "m-kg",
            matureQuantity: 2,
            greenQuantity: 1,
        });
        const store = makeStore();
        store.dispatch(
            addToCartFruitVegetableMature({ item, matureQuantity: 2 })
        );
        store.dispatch(addToCartFruitVegetableGreen({ item, greenQuantity: 1 }));
        renderRow(store, line(store));

        type(screen.getByLabelText("Verde en kilogramos"), "3");

        expect(line(store).greenQuantity).toBe(3);
        expect(line(store).matureQuantity).toBe(2);
    });

    it("m-kg: un lado puede quedar en 0 mientras el otro no lo esté", () => {
        const item = makeItem({
            _id: "m1",
            productType: "m-kg",
            matureQuantity: 2,
            greenQuantity: 1,
        });
        const store = makeStore();
        store.dispatch(
            addToCartFruitVegetableMature({ item, matureQuantity: 2 })
        );
        store.dispatch(addToCartFruitVegetableGreen({ item, greenQuantity: 1 }));
        renderRow(store, line(store));

        type(screen.getByLabelText("Verde en kilogramos"), "0");

        expect(line(store).greenQuantity).toBe(0);
        expect(line(store).matureQuantity).toBe(2);
    });

    it("m-kg: impide dejar maduro y verde en 0 (el checkout lo rechazaría)", () => {
        const item = makeItem({
            _id: "m1",
            productType: "m-kg",
            matureQuantity: 0,
            greenQuantity: 1,
        });
        const store = makeStore();
        store.dispatch(
            addToCartFruitVegetableMature({ item, matureQuantity: 0 })
        );
        store.dispatch(addToCartFruitVegetableGreen({ item, greenQuantity: 1 }));
        renderRow(store, line(store));

        const green = screen.getByLabelText(
            "Verde en kilogramos"
        ) as HTMLInputElement;
        type(green, "0");

        expect(line(store).greenQuantity).toBe(1);
        expect(green.value).toBe("1");
        expect(toast.error).toHaveBeenCalled();
    });

    it("p: conserva el stepper de piezas y no muestra input en kg", () => {
        const item = makeItem({
            _id: "pz1",
            productType: "p",
            pPrice: 12,
            quantity: 3,
        });
        const store = makeStore();
        store.dispatch(setCart([item]));
        renderRow(store, line(store));

        expect(screen.queryByLabelText("Cantidad en kilogramos")).toBeNull();
        // El stepper de piezas lee la cantidad del store, no de las props.
        expect(screen.getByText("3")).toBeTruthy();
    });
});
