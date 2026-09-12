import { NextRequest, NextResponse } from "next/server";
import { groq } from "next-sanity";
import { client } from "../../../sanity/lib/client";
import { SEARCH_FETCH_LIMIT, searchProducts } from "../../../lib/search";
import {
    LIVE_SEARCH_ENABLED,
    LIVE_SEARCH_LIMIT,
    LIVE_SEARCH_MIN_CHARS,
    LIVE_SEARCH_REVALIDATE_SECONDS,
    SearchSuggestion,
    SearchSuggestionsResponse,
} from "../../../lib/liveSearch";

// Proyección deliberadamente estrecha: el resto del proyecto usa `{...}`, que
// arrastra descripción, cantidades y niveles de maduración. Aquí sólo hacen
// falta los campos que puntúan (título, marca, categoría) y los que se pintan.
const SUGGESTION_PROJECTION = groq`{
    _id,
    title,
    brand,
    productCategory,
    productType,
    kgPrice,
    pPrice,
    gramsPrice,
    rowprice,
    "slug": slug.current,
    "imageUrl": image.asset->url
}`;

const CATALOG_QUERY = groq`*[_type == "product"] ${SUGGESTION_PROJECTION}|order(_createdAt asc) [0...${SEARCH_FETCH_LIMIT}]`;

const empty: SearchSuggestionsResponse = { results: [], total: 0 };

/**
 * Sugerencias para la búsqueda en vivo del navbar.
 *
 * El ranking es el mismo `searchProducts` que usa la página de productos, así
 * que lo que se ve mientras se escribe coincide con lo que sale al enviar el
 * formulario. A diferencia de la página, no aplica los filtros de categoría o
 * marca activos: las sugerencias buscan sobre todo el catálogo a propósito.
 */
export async function GET(request: NextRequest) {
    // El cliente ya no consulta con la bandera apagada; esto cierra la puerta
    // también para pestañas viejas y para quien llame al endpoint a mano.
    if (!LIVE_SEARCH_ENABLED) {
        return NextResponse.json(empty, { status: 200 });
    }

    const query = (request.nextUrl.searchParams.get("q") ?? "").trim();
    if (query.length < LIVE_SEARCH_MIN_CHARS) {
        return NextResponse.json(empty, { status: 200 });
    }

    // Sin cache, cada pulsación traería el catálogo entero de Sanity. Con él,
    // el coste por búsqueda se reduce a rankear en memoria.
    const candidates = await client.fetch<SearchSuggestion[]>(
        CATALOG_QUERY,
        {},
        { next: { revalidate: LIVE_SEARCH_REVALIDATE_SECONDS } }
    );

    const ranked = searchProducts(candidates, query);

    return NextResponse.json<SearchSuggestionsResponse>({
        results: ranked.slice(0, LIVE_SEARCH_LIMIT),
        total: ranked.length,
    });
}
