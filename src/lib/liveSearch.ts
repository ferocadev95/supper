import type { PriceFields } from "./pricing";

/**
 * Interruptores de la búsqueda en vivo del navbar.
 *
 * El desplegable de sugerencias pega a `/api/search` mientras el usuario
 * escribe, así que su coste crece con el tráfico. Todo lo que lo modera vive
 * aquí y se controla por variables de entorno: si con más usuarios empezara a
 * pesar, se apaga o se afloja **sin tocar código ni redesplegar**.
 *
 * Las variables son `NEXT_PUBLIC_` porque el cliente decide si vale la pena
 * pedir y el servidor decide si vale la pena responder, y ambos tienen que leer
 * exactamente el mismo valor. Se acceden como literal (`process.env.NOMBRE`)
 * porque Next sólo sustituye la variable si la ve escrita así.
 */

/**
 * Un producto tal como lo pinta el desplegable del navbar. Extiende
 * `PriceFields` para que `basePrice` y `DiscountBadge` lo acepten sin
 * adaptadores, y `slug`/`imageUrl` llegan ya resueltos desde GROQ.
 */
export interface SearchSuggestion extends PriceFields {
    _id: string;
    title: string;
    slug: string;
    brand?: string;
    productCategory?: string;
    imageUrl: string | null;
}

export interface SearchSuggestionsResponse {
    results: SearchSuggestion[];
    /** Resultados del ranking completo, no sólo los devueltos. */
    total: number;
}

/** Lee un entero positivo del entorno, cayendo al valor por defecto si no lo es. */
const positiveInt = (raw: string | undefined, fallback: number): number => {
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Interruptor general. Cualquier valor distinto de `"off"` deja la búsqueda en
 * vivo encendida, de modo que no definir la variable es el comportamiento
 * normal y `NEXT_PUBLIC_LIVE_SEARCH=off` es el freno de emergencia.
 *
 * Apagarla devuelve el buscador a lo de antes: el formulario sigue llevando a
 * `/productos?search=`, sólo desaparecen las sugerencias.
 */
export const LIVE_SEARCH_ENABLED = process.env.NEXT_PUBLIC_LIVE_SEARCH !== "off";

/**
 * Cuántos caracteres hacen falta para consultar. Subirlo recorta de golpe las
 * peticiones más caras y menos útiles: las de una o dos letras, que casan con
 * medio catálogo.
 */
export const LIVE_SEARCH_MIN_CHARS = positiveInt(
    process.env.NEXT_PUBLIC_LIVE_SEARCH_MIN_CHARS,
    2
);

/**
 * Espera antes de consultar, en milisegundos. Es la palanca más directa sobre
 * el número de peticiones por búsqueda: subirla agrupa más pulsaciones.
 */
export const LIVE_SEARCH_DEBOUNCE_MS = positiveInt(
    process.env.NEXT_PUBLIC_LIVE_SEARCH_DEBOUNCE_MS,
    250
);

/** Sugerencias visibles. Acota el tamaño de la respuesta, no el del ranking. */
export const LIVE_SEARCH_LIMIT = positiveInt(
    process.env.NEXT_PUBLIC_LIVE_SEARCH_LIMIT,
    6
);

/**
 * Segundos que se reutiliza el catálogo cacheado en el endpoint. Es lo que
 * evita una llamada a Sanity por ráfaga de tecleo; subirlo abarata el endpoint
 * a cambio de tardar más en reflejar cambios de precio o alta de productos.
 */
export const LIVE_SEARCH_REVALIDATE_SECONDS = positiveInt(
    process.env.NEXT_PUBLIC_LIVE_SEARCH_REVALIDATE_SECONDS,
    300
);
