// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import SearchInput from "./SearchInput";
import type { SearchSuggestion } from "../lib/liveSearch";

const replace = vi.fn();
const push = vi.fn();
let currentParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace, push }),
    useSearchParams: () => currentParams,
}));

// `next/image` exige configuración de loader que no aporta nada al test.
vi.mock("next/image", () => ({
    default: (props: Record<string, unknown>) => {
        const { src, alt } = props as { src: string; alt: string };
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt={alt} />;
    },
}));

const suggestion = (
    id: string,
    title: string,
    slug: string
): SearchSuggestion => ({
    _id: id,
    title,
    slug,
    brand: "natural",
    productCategory: "frutas-y-verduras",
    productType: "kg",
    kgPrice: 45,
    pPrice: 0,
    gramsPrice: 0,
    rowprice: 0,
    imageUrl: "https://cdn.sanity.io/images/x/y/manzana.png",
});

const ROJA = suggestion("1", "Manzana Roja", "manzana-roja");
const VERDE = suggestion("2", "Manzana Verde", "manzana-verde");

const respondWith = (results: SearchSuggestion[], total = results.length) =>
    vi.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ results, total }),
        })
    );

const typeQuery = (value: string) =>
    fireEvent.change(screen.getByRole("combobox"), { target: { value } });

/**
 * Salta la espera del debounce. Va envuelto en `act` porque entre que el timer
 * dispara y sale la petición hay un render intermedio: sin él, la consulta aún
 * no se ha hecho cuando vuelve el control al test.
 */
const skipDebounce = async () => {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
    });
};

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    replace.mockClear();
    push.mockClear();
    currentParams = new URLSearchParams();
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe("SearchInput", () => {
    it("muestra sugerencias mientras se escribe", async () => {
        vi.stubGlobal("fetch", respondWith([ROJA, VERDE]));
        render(<SearchInput />);

        typeQuery("manz");
        await skipDebounce();

        expect(await screen.findByText("Manzana Roja")).toBeInTheDocument();
        expect(screen.getByText("Manzana Verde")).toBeInTheDocument();
    });

    it("no consulta con menos caracteres de los mínimos", async () => {
        const fetchMock = respondWith([]);
        vi.stubGlobal("fetch", fetchMock);
        render(<SearchInput />);

        typeQuery("m");
        await skipDebounce();

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("cancela la consulta anterior al seguir escribiendo", async () => {
        const signals: AbortSignal[] = [];
        vi.stubGlobal(
            "fetch",
            vi.fn((_url: string, init: { signal: AbortSignal }) => {
                signals.push(init.signal);
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ results: [], total: 0 }),
                });
            })
        );
        render(<SearchInput />);

        typeQuery("manz");
        await skipDebounce();
        typeQuery("manzana");
        await skipDebounce();

        expect(signals).toHaveLength(2);
        expect(signals[0].aborted).toBe(true);
        expect(signals[1].aborted).toBe(false);
    });

    it("navega al producto al pulsar una sugerencia", async () => {
        vi.stubGlobal("fetch", respondWith([ROJA, VERDE]));
        render(<SearchInput />);

        typeQuery("manz");
        await skipDebounce();

        fireEvent.click(await screen.findByText("Manzana Roja"));

        expect(push).toHaveBeenCalledWith("/producto/manzana-roja");
        expect(replace).not.toHaveBeenCalled();
    });

    it("envía el formulario cuando no hay sugerencia resaltada", async () => {
        vi.stubGlobal("fetch", respondWith([ROJA]));
        currentParams = new URLSearchParams("categoria=frutas-y-verduras&page=3");
        render(<SearchInput />);

        typeQuery("manz");
        await skipDebounce();
        fireEvent.submit(screen.getByRole("combobox").closest("form")!);

        // Conserva los filtros activos y descarta la página, como antes.
        expect(replace).toHaveBeenCalledWith(
            "/productos?categoria=frutas-y-verduras&search=manz"
        );
    });

    it("Enter sobre la sugerencia resaltada abre ese producto", async () => {
        vi.stubGlobal("fetch", respondWith([ROJA, VERDE]));
        render(<SearchInput />);

        typeQuery("manz");
        await skipDebounce();
        await screen.findByText("Manzana Roja");

        const input = screen.getByRole("combobox");
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "ArrowDown" });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(push).toHaveBeenCalledWith("/producto/manzana-verde");
        expect(replace).not.toHaveBeenCalled();
    });

    it("Escape cierra el desplegable", async () => {
        vi.stubGlobal("fetch", respondWith([ROJA]));
        render(<SearchInput />);

        typeQuery("manz");
        await skipDebounce();
        await screen.findByText("Manzana Roja");

        fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });

        await waitFor(() =>
            expect(screen.queryByText("Manzana Roja")).not.toBeInTheDocument()
        );
    });

    it("ofrece ver el resto cuando hay más resultados que sugerencias", async () => {
        vi.stubGlobal("fetch", respondWith([ROJA, VERDE], 7));
        render(<SearchInput />);

        typeQuery("manz");
        await skipDebounce();

        fireEvent.click(await screen.findByText(/Ver los 7 resultados/));

        expect(replace).toHaveBeenCalledWith("/productos?search=manz");
    });

    it("avisa cuando la búsqueda no encuentra nada", async () => {
        vi.stubGlobal("fetch", respondWith([]));
        render(<SearchInput />);

        typeQuery("zzzz");
        await skipDebounce();

        expect(
            await screen.findByText("No se han encontrado productos.")
        ).toBeInTheDocument();
    });
});
