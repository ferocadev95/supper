import { PRODUCT_CATEGORIES, SEARCHABLE_BRANDS } from "../constants";

export interface SearchableProduct {
  title: string;
  brand?: string;
  productCategory?: string;
}

const BRAND_LABELS = new Map(
  SEARCHABLE_BRANDS.map(({ value, label }) => [value, label])
);
const CATEGORY_LABELS = new Map(
  PRODUCT_CATEGORIES.map(({ value, label }) => [value, label])
);

// Puntajes por tipo de coincidencia entre un token de la búsqueda y una
// palabra del campo. Se suman entre tokens, de ahí que la distancia entre
// niveles sea amplia.
const EXACT = 100;
const PREFIX = 70;
const INFLECTION = 60;
const SUBSTRING = 45;
const FUZZY_BASE = 35;
const FUZZY_PENALTY = 10;

// Para el caso inverso (el token contiene a la palabra): solo cuenta si la
// palabra ya es larga y el sufijo sobrante es corto. Así "chiles" coincide con
// "chile" pero "dedo" no coincide con el "de" de "Jugo de Manzana".
const MIN_INFLECTION_STEM = 4;
const MAX_INFLECTION_SUFFIX = 3;

// Un match en el título vale mucho más que uno en marca, y ese más que uno en
// categoría: buscar "chiles secos" debe traer primero el producto que lo lleva
// en el nombre, no los 40 de esa categoría.
const TITLE_WEIGHT = 1;
const BRAND_WEIGHT = 0.5;
const CATEGORY_WEIGHT = 0.3;

// Bonus para el producto cuyo título arranca con la búsqueda completa; levanta
// "Manzana Roja" sobre "Jugo de Manzana" al buscar "manz".
const TITLE_STARTS_WITH_QUERY = 30;

/**
 * Deja el texto comparable: sin acentos, en minúsculas y sin puntuación.
 *
 * La descomposición NFD separa la tilde en un carácter combinante propio, que
 * luego se descarta. Eso arrastra también la "ñ" a "n", lo cual es deseable
 * aquí: "jalapeno" debe encontrar "Jalapeño". Los guiones se vuelven espacios,
 * así que "frutas-y-verduras" y "Frutas y Verduras" acaban idénticos.
 */
export const normalizeText = (input: string): string =>
  input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const tokenize = (input: string): string[] => {
  const normalized = normalizeText(input);
  return normalized === "" ? [] : normalized.split(" ");
};

// Cuántos typos se toleran según lo largo del token. Las palabras cortas no
// admiten ninguno: con distancia 1, "pera" encontraría "papa".
const maxDistanceFor = (token: string): number => {
  if (token.length <= 3) return 0;
  if (token.length <= 6) return 1;
  return 2;
};

/**
 * Distancia de Levenshtein acotada. Devuelve Infinity en cuanto se sabe que el
 * resultado superará `max`, para no recorrer la matriz completa.
 */
const boundedLevenshtein = (a: string, b: string, max: number): number => {
  if (Math.abs(a.length - b.length) > max) return Infinity;
  if (a === b) return 0;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  let current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    let rowMin = i;

    for (let j = 1; j <= b.length; j++) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(substitution, previous[j] + 1, current[j - 1] + 1);
      rowMin = Math.min(rowMin, current[j]);
    }

    if (rowMin > max) return Infinity;

    const swap = previous;
    previous = current;
    current = swap;
  }

  const distance = previous[b.length];
  return distance > max ? Infinity : distance;
};

/**
 * Mejor puntaje del token contra las palabras del campo, sin ponderar.
 * `allowFuzzy` se reserva al título: en marca y categoría, de vocabulario
 * cerrado y peso bajo, tolerar typos solo añadiría ruido.
 */
const scoreField = (
  token: string,
  words: string[],
  allowFuzzy: boolean
): number => {
  let best = 0;

  for (const word of words) {
    if (word === token) return EXACT;

    if (word.startsWith(token)) {
      best = Math.max(best, PREFIX);
      continue;
    }

    // Plural o flexión: "chiles" contra el título "Chile Seco". Sin esto, esa
    // coincidencia solo llegaba por vía difusa y quedaba por debajo de un match
    // exacto de categoría, empatando el producto con toda su categoría.
    if (
      word.length >= MIN_INFLECTION_STEM &&
      token.length - word.length <= MAX_INFLECTION_SUFFIX &&
      token.startsWith(word)
    ) {
      best = Math.max(best, INFLECTION);
      continue;
    }

    if (word.includes(token)) {
      best = Math.max(best, SUBSTRING);
      continue;
    }

    if (allowFuzzy && best < FUZZY_BASE - FUZZY_PENALTY) {
      const distance = boundedLevenshtein(token, word, maxDistanceFor(token));
      if (distance !== Infinity && distance > 0) {
        best = Math.max(best, FUZZY_BASE - FUZZY_PENALTY * distance);
      }
    }
  }

  return best;
};

interface ProductIndex {
  title: string;
  titleWords: string[];
  brandWords: string[];
  categoryWords: string[];
}

// Indexa valor y etiqueta del campo. Sanity guarda "mrlucky", no "Mr. Lucky":
// sin la etiqueta, buscar la marca como se lee no encontraría nada.
const wordsFor = (
  value: string | undefined,
  labels: Map<string, string>
): string[] => {
  if (!value) return [];
  const label = labels.get(value);
  // Una marca fuera del mapa ("natural", "variado", o un valor viejo) no aporta
  // tokens; el producto se sigue buscando por título y categoría.
  if (label === undefined) return [];
  return Array.from(new Set(tokenize(`${value} ${label}`)));
};

const buildIndex = (product: SearchableProduct): ProductIndex => ({
  title: normalizeText(product.title ?? ""),
  titleWords: tokenize(product.title ?? ""),
  brandWords: wordsFor(product.brand, BRAND_LABELS),
  categoryWords: wordsFor(product.productCategory, CATEGORY_LABELS),
});

/**
 * Puntúa el producto contra los tokens. Devuelve 0 si algún token no encuentra
 * nada en ningún campo: la búsqueda es AND, para que "chile manzana" no
 * devuelva todos los chiles. Un token puede satisfacerse por cualquier campo,
 * así que "manzana verde valle" funciona (título + marca).
 */
const scoreProduct = (
  index: ProductIndex,
  tokens: string[],
  normalizedQuery: string
): number => {
  let total = 0;

  for (const token of tokens) {
    const best = Math.max(
      scoreField(token, index.titleWords, true) * TITLE_WEIGHT,
      scoreField(token, index.brandWords, false) * BRAND_WEIGHT,
      scoreField(token, index.categoryWords, false) * CATEGORY_WEIGHT
    );

    if (best === 0) return 0;
    total += best;
  }

  if (index.title.startsWith(normalizedQuery)) {
    total += TITLE_STARTS_WITH_QUERY;
  }

  return total;
};

/**
 * Filtra y ordena productos por relevancia, ignorando acentos y tolerando
 * typos en el título. Una búsqueda vacía devuelve la lista intacta.
 */
export const searchProducts = <T extends SearchableProduct>(
  products: T[],
  query: string
): T[] => {
  const tokens = tokenize(query);
  if (tokens.length === 0) return products;

  const normalizedQuery = normalizeText(query);

  return products
    .map((product) => ({
      product,
      score: scoreProduct(buildIndex(product), tokens, normalizedQuery),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.product.title.localeCompare(b.product.title, "es")
    )
    .map((entry) => entry.product);
};
