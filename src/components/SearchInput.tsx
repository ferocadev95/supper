"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { CiSearch } from "react-icons/ci";
import FormattedPrice from "./FormattedPrice";
import DiscountBadge from "./DiscountBadge";
import { basePrice, unitLabel } from "../lib/pricing";
import useDebouncedValue from "../lib/useDebouncedValue";
import {
    LIVE_SEARCH_DEBOUNCE_MS,
    LIVE_SEARCH_ENABLED,
    LIVE_SEARCH_MIN_CHARS,
    SearchSuggestion,
    SearchSuggestionsResponse,
} from "../lib/liveSearch";

/** Ninguna sugerencia resaltada; `Enter` envía el formulario. */
const NO_SELECTION = -1;

/** Resultados recibidos junto a la consulta que los generó. */
interface Matches {
    query: string;
    results: SearchSuggestion[];
    /** Resultados del ranking completo, no sólo los devueltos. */
    total: number;
}

const NO_MATCHES: Matches = { query: "", results: [], total: 0 };

const SearchInput = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultSearchQuery = searchParams.get("search") ?? "";

    // El input pasa a controlado: el desplegable necesita leer lo escrito en
    // cada pulsación, no sólo al enviar.
    const [query, setQuery] = useState(defaultSearchQuery);
    // Los resultados guardan la consulta que los produjo. Así se sabe si lo que
    // hay en memoria corresponde a lo que el usuario tiene escrito ahora, sin
    // necesidad de un estado aparte para "cargando".
    const [matches, setMatches] = useState<Matches>(NO_MATCHES);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(NO_SELECTION);

    const containerRef = useRef<HTMLDivElement>(null);
    // `SearchInput` se monta dos veces a la vez (cabecera de escritorio y menú
    // móvil), así que los ids no pueden ser fijos: `aria-controls` y
    // `aria-activedescendant` apuntarían a la otra instancia.
    const baseId = useId();
    const inputId = `${baseId}-search`;
    const listboxId = `${baseId}-suggestions`;
    const optionId = (index: number) => `${baseId}-option-${index}`;

    const trimmedQuery = query.trim();
    const debouncedQuery = useDebouncedValue(
        trimmedQuery,
        LIVE_SEARCH_DEBOUNCE_MS
    );
    const shouldQuery =
        LIVE_SEARCH_ENABLED && debouncedQuery.length >= LIVE_SEARCH_MIN_CHARS;

    useEffect(() => {
        if (!shouldQuery) return;

        // Cancela la consulta anterior, para que una respuesta lenta no pise a
        // otra más reciente al volver fuera de orden.
        const controller = new AbortController();

        fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
            signal: controller.signal,
        })
            .then((response) =>
                response.ok
                    ? (response.json() as Promise<SearchSuggestionsResponse>)
                    : Promise.reject(new Error("search request failed"))
            )
            .then(({ results, total }) =>
                setMatches({ query: debouncedQuery, results, total })
            )
            .catch(() => {
                // Abortar es el caso normal al seguir escribiendo; un fallo real
                // deja el desplegable vacío en vez de romper el buscador, que
                // sigue funcionando por formulario.
                if (controller.signal.aborted) return;
                setMatches({ query: debouncedQuery, results: [], total: 0 });
            });

        return () => controller.abort();
    }, [debouncedQuery, shouldQuery]);

    // Cerrar al pulsar fuera. `pointerdown` y no `blur` para que el clic sobre
    // una sugerencia llegue a ejecutarse.
    useEffect(() => {
        if (!isOpen) return;

        const onPointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [isOpen]);

    // Mientras lo recibido no corresponda a lo escrito, la consulta sigue en
    // curso: no hay sugerencias que mostrar todavía.
    const isLoading = shouldQuery && matches.query !== debouncedQuery;
    const { results: suggestions, total } = isLoading ? NO_MATCHES : matches;

    const hasQuery = trimmedQuery.length >= LIVE_SEARCH_MIN_CHARS;
    const showDropdown = LIVE_SEARCH_ENABLED && isOpen && hasQuery;
    const showEmptyState = showDropdown && !isLoading && total === 0;
    const showAllResults = showDropdown && total > suggestions.length;

    /** Navega a la lista de resultados conservando los filtros activos. */
    const goToResults = (searchQuery: string) => {
        // URLSearchParams codifica el término (`&`, `#` y `+` rompían la URL) y
        // conserva los filtros activos, que antes se perdían al buscar.
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
            params.set("search", searchQuery);
        } else {
            params.delete("search");
        }
        params.delete("page");

        setIsOpen(false);
        router.replace(`/productos?${params.toString()}`);
    };

    const goToProduct = (suggestion: SearchSuggestion) => {
        setIsOpen(false);
        router.push(`/producto/${suggestion.slug}`);
    };

    const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        goToResults(trimmedQuery);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setIsOpen(false);
            setActiveIndex(NO_SELECTION);
            return;
        }

        if (e.key === "Enter") {
            // Con una sugerencia resaltada, `Enter` es el atajo a ese producto;
            // sin ella cae en el submit de siempre.
            if (isOpen && activeIndex !== NO_SELECTION) {
                e.preventDefault();
                goToProduct(suggestions[activeIndex]);
            }
            return;
        }

        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        if (suggestions.length === 0) return;

        e.preventDefault();
        setIsOpen(true);
        setActiveIndex((current) => {
            const step = e.key === "ArrowDown" ? 1 : -1;
            // Recorre en círculo partiendo del inicio o del final según la
            // dirección, así la primera flecha ya selecciona algo.
            const next = current + step;
            if (next < 0) return suggestions.length - 1;
            if (next >= suggestions.length) return 0;
            return next;
        });
    };

    return (
        <div
            ref={containerRef}
            className="flex-1 inline-flex h-12 relative min-w-[300px]"
        >
            <CiSearch className="text-lg absolute left-2.5 mt-3.5 text-primaryGold z-10" />
            <form onSubmit={onSubmit} className="flex items-center w-full">
                <input
                    type="search"
                    name="search"
                    id={inputId}
                    autoComplete="off"
                    placeholder="Buscar productos..."
                    className="pl-8 pr-8 w-full border-black/30 border-[1px] py-3 rounded-full outline-none"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setActiveIndex(NO_SELECTION);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={onKeyDown}
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                        showDropdown && activeIndex !== NO_SELECTION
                            ? optionId(activeIndex)
                            : undefined
                    }
                />
                <button
                    type="submit"
                    className="btn-primary absolute right-0 px-3.5 py-1.5 mr-1.5 text-sm font-medium top-2 rounded-full"
                >
                    Buscar
                </button>
            </form>

            {showDropdown && (
                // z-[60] porque la cabecera que lo contiene ya es `sticky z-50`.
                <div className="absolute top-full left-0 z-[60] mt-2 w-full overflow-hidden rounded-2xl border-[1px] border-gray-300/50 bg-white shadow-lg">
                    <ul
                        id={listboxId}
                        role="listbox"
                        aria-label="Sugerencias de productos"
                        className="max-h-[60vh] overflow-y-auto"
                    >
                        {suggestions.map((item, index) => {
                            const price =
                                basePrice(item) - (item.rowprice || 0);
                            const unit = unitLabel(item.productType);

                            return (
                                <li
                                    key={item._id}
                                    id={optionId(index)}
                                    role="option"
                                    aria-selected={index === activeIndex}
                                >
                                    <button
                                        type="button"
                                        onClick={() => goToProduct(item)}
                                        onMouseEnter={() =>
                                            setActiveIndex(index)
                                        }
                                        className={`flex w-full items-center gap-3 px-3 py-2 text-left hoverEffect ${
                                            index === activeIndex
                                                ? "bg-gray-100"
                                                : "bg-white"
                                        }`}
                                    >
                                        {item.imageUrl && (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                width={48}
                                                height={48}
                                                loading="lazy"
                                                className="h-12 w-12 shrink-0 rounded-md object-contain"
                                            />
                                        )}
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-black">
                                                {item.title}
                                            </span>
                                            {item.brand && (
                                                <span className="block truncate text-xs font-medium uppercase text-primaryGold">
                                                    {item.brand}
                                                </span>
                                            )}
                                        </span>
                                        <span className="flex shrink-0 flex-col items-end gap-1">
                                            <span className="whitespace-nowrap">
                                                <FormattedPrice
                                                    amount={price}
                                                    className="text-sm text-green-900 font-bold"
                                                />
                                                {unit && (
                                                    <span className="ml-1 text-xs font-medium">
                                                        <i>{unit}</i>
                                                    </span>
                                                )}
                                            </span>
                                            <DiscountBadge
                                                price={item}
                                                compact
                                            />
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    {isLoading && (
                        <p className="px-3 py-3 text-sm text-black/60">
                            Buscando...
                        </p>
                    )}

                    {showEmptyState && (
                        <p className="px-3 py-3 text-sm text-black/60">
                            No se han encontrado productos.
                        </p>
                    )}

                    {showAllResults && (
                        <button
                            type="button"
                            onClick={() => goToResults(trimmedQuery)}
                            className="block w-full border-t-[1px] border-gray-300/50 px-3 py-2.5 text-left text-sm font-medium text-primaryGreen hover:bg-gray-100 hoverEffect"
                        >
                            Ver los {total} resultados de &quot;{trimmedQuery}
                            &quot;
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchInput;
