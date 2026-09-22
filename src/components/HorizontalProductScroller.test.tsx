// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import HorizontalProductScroller from "./HorizontalProductScroller";
import type { ProductData } from "../../types";

vi.mock("./ProductCard", () => ({
    default: ({ item }: { item: ProductData }) => <div>{item.title}</div>,
}));

let observerCallback: IntersectionObserverCallback | null = null;
const disconnect = vi.fn();

class FakeIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
    }
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = disconnect;
    takeRecords = () => [];
    root = null;
    rootMargin = "";
    thresholds = [];
}

class FakeResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

const triggerSentinel = () =>
    act(() => {
        observerCallback?.(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver
        );
    });

const product = (id: string, title: string): ProductData =>
    ({ _id: id, title }) as ProductData;

const scrollBy = vi.fn();

beforeEach(() => {
    observerCallback = null;
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    Element.prototype.scrollBy = scrollBy;
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
        configurable: true,
        value: 800,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
        configurable: true,
        value: 3000,
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    scrollBy.mockReset();
});

describe("HorizontalProductScroller", () => {
    it("pinta los productos que llegan del servidor", () => {
        render(
            <HorizontalProductScroller
                categoria="frutas-y-verduras"
                initialProducts={[product("1", "Manzana")]}
                initialHasMore={false}
            />
        );

        expect(screen.getByText("Manzana")).toBeInTheDocument();
    });

    it("añade el siguiente lote al llegar al final", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                products: [product("2", "Pera")],
                hasMore: false,
            }),
        });
        vi.stubGlobal("fetch", fetchMock);

        render(
            <HorizontalProductScroller
                categoria="frutas-y-verduras"
                initialProducts={[product("1", "Manzana")]}
                initialHasMore={true}
            />
        );

        triggerSentinel();

        expect(await screen.findByText("Pera")).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][0]).toContain(
            "categoria=frutas-y-verduras&offset=1"
        );
    });

    it("no pide más lotes cuando la categoría se agotó", () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        render(
            <HorizontalProductScroller
                categoria="abarrotes"
                initialProducts={[product("1", "Arroz")]}
                initialHasMore={false}
            />
        );

        triggerSentinel();

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("no duplica la petición si el centinela dispara dos veces", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ products: [], hasMore: false }),
        });
        vi.stubGlobal("fetch", fetchMock);

        render(
            <HorizontalProductScroller
                categoria="abarrotes"
                initialProducts={[product("1", "Arroz")]}
                initialHasMore={true}
            />
        );

        triggerSentinel();
        triggerSentinel();

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    });

    it("deshabilita la flecha izquierda al inicio y la derecha si no hay desplazamiento", () => {
        Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
            configurable: true,
            value: 800,
        });

        render(
            <HorizontalProductScroller
                categoria="abarrotes"
                initialProducts={[product("1", "Arroz")]}
                initialHasMore={false}
            />
        );

        expect(screen.getByLabelText("Ver productos anteriores")).toBeDisabled();
        expect(screen.getByLabelText("Ver más productos")).toBeDisabled();
    });

    it("habilita la flecha derecha cuando la tira desborda", () => {
        render(
            <HorizontalProductScroller
                categoria="abarrotes"
                initialProducts={[product("1", "Arroz")]}
                initialHasMore={false}
            />
        );

        expect(screen.getByLabelText("Ver más productos")).toBeEnabled();
    });

    it("desplaza la tira con la flecha derecha", () => {
        render(
            <HorizontalProductScroller
                categoria="abarrotes"
                initialProducts={[product("1", "Arroz")]}
                initialHasMore={false}
            />
        );

        fireEvent.click(screen.getByLabelText("Ver más productos"));

        expect(scrollBy).toHaveBeenCalledWith({
            left: 720,
            behavior: "smooth",
        });
    });
});
