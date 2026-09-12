// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import SearchInput from "./SearchInput";

// La bandera se lee al importar el módulo de configuración, así que apagarla
// obliga a un fichero propio: dentro de un mismo test no se puede reimportar
// `SearchInput` con otra configuración.
vi.mock("../lib/liveSearch", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../lib/liveSearch")>()),
    LIVE_SEARCH_ENABLED: false,
}));

const replace = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace, push }),
    useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/image", () => ({ default: () => null }));

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    replace.mockClear();
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe("SearchInput con la búsqueda en vivo apagada", () => {
    it("no consulta ni despliega sugerencias, pero sigue buscando por formulario", async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        render(<SearchInput />);

        const input = screen.getByRole("combobox");
        fireEvent.change(input, { target: { value: "manzana" } });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(300);
        });

        expect(fetchMock).not.toHaveBeenCalled();
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

        fireEvent.submit(input.closest("form")!);
        expect(replace).toHaveBeenCalledWith("/productos?search=manzana");
    });
});
