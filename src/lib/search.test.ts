import { describe, expect, it } from "vitest";

import { normalizeText, searchProducts } from "./search";

const product = (
  title: string,
  brand: string,
  productCategory: string
) => ({ title, brand, productCategory });

const PLATANO = product("Plátano Macho", "natural", "frutas-y-verduras");
const JALAPENO = product("Chile Jalapeño", "generico", "chiles-secos");
const GUAJILLO = product("Chile Seco Guajillo", "generico", "chiles-secos");
const MANZANA = product("Manzana Roja", "natural", "frutas-y-verduras");
const JUGO = product("Jugo de Manzana", "generico", "abarrotes");
const PAPA = product("Papa Blanca", "natural", "frutas-y-verduras");
const ARROZ = product("Arroz", "verde valle", "granos-y-semillas");
const CACAHUATE = product("Cacahuate", "mrlucky", "frutos-secos-y-varios");
const SURTIDO = product("Surtido de Nueces", "variado", "frutos-secos-y-varios");
const BLUEBERRY = product("Blueberry", "natural", "frutas-y-verduras");
const ZARZAMORA = product("Zarzamora", "natural", "frutas-y-verduras");
const AGUACATE = product("Aguacate Hass", "natural", "frutas-y-verduras");
const EJOTE = product("Ejote", "natural", "frutas-y-verduras");
const PIMIENTO = product("Pimiento Rojo", "natural", "frutas-y-verduras");
const PIMIENTA = product("Pimienta Entera Chica", "generico", "condimentos-y-especias");
const FRIJOL = product("Frijol Negro", "generico", "granos-y-semillas");
const HUEVO = product("Docena de Huevo", "natural", "huevo");

const CATALOG = [
  PLATANO,
  JALAPENO,
  GUAJILLO,
  MANZANA,
  JUGO,
  PAPA,
  ARROZ,
  CACAHUATE,
  SURTIDO,
  BLUEBERRY,
  ZARZAMORA,
  AGUACATE,
  EJOTE,
  PIMIENTO,
  PIMIENTA,
  FRIJOL,
  HUEVO,
];

const titles = (query: string) =>
  searchProducts(CATALOG, query).map((p) => p.title);

describe("normalizeText", () => {
  it("quita acentos", () => {
    expect(normalizeText("Plátano")).toBe("platano");
  });

  it("normaliza la ñ a n, para que 'jalapeno' encuentre 'Jalapeño'", () => {
    expect(normalizeText("Jalapeño")).toBe("jalapeno");
  });

  it("baja a minúsculas y colapsa puntuación y espacios", () => {
    expect(normalizeText("  CAFÉ,   Molido ")).toBe("cafe molido");
  });

  it("convierte los guiones de los slugs en espacios", () => {
    expect(normalizeText("frutas-y-verduras")).toBe("frutas y verduras");
    expect(normalizeText("Mr. Lucky")).toBe("mr lucky");
  });

  it("devuelve cadena vacía si no queda nada buscable", () => {
    expect(normalizeText("   ---  ")).toBe("");
  });
});

describe("searchProducts — acentos", () => {
  it("encuentra un título acentuado escribiendo sin acento", () => {
    expect(titles("platano")).toContain("Plátano Macho");
  });

  it("también funciona escribiendo con acento", () => {
    expect(titles("plátano")).toContain("Plátano Macho");
  });

  it("encuentra 'Jalapeño' escribiendo 'jalapeno'", () => {
    expect(titles("jalapeno")).toContain("Chile Jalapeño");
  });

  it("ignora mayúsculas", () => {
    expect(titles("PLÁTANO")).toContain("Plátano Macho");
  });
});

describe("searchProducts — coincidencias en el título", () => {
  it("busca por prefijo, que GROQ `match` no soportaba", () => {
    const result = titles("manz");
    expect(result).toContain("Manzana Roja");
    expect(result).toContain("Jugo de Manzana");
  });

  it("prioriza el título que empieza con la búsqueda", () => {
    expect(titles("manz")[0]).toBe("Manzana Roja");
  });

  it("tolera un typo", () => {
    expect(titles("manzna")).toContain("Manzana Roja");
  });

  it("no confunde palabras cortas distintas", () => {
    expect(titles("pera")).not.toContain("Papa Blanca");
  });

  it("encuentra el singular escribiendo el plural", () => {
    expect(titles("chiles")).toEqual(
      expect.arrayContaining(["Chile Jalapeño", "Chile Seco Guajillo"])
    );
    expect(titles("manzanas")).toContain("Manzana Roja");
  });

  it("no trata una palabra corta del título como raíz de cualquier token", () => {
    // "Jugo de Manzana" contiene "de"; buscar "dedo" no debe alcanzarlo.
    expect(titles("dedo")).toEqual([]);
  });
});

describe("searchProducts — marca y categoría", () => {
  it("encuentra por marca", () => {
    expect(titles("verde valle")).toEqual(["Arroz"]);
  });

  it("encuentra por la etiqueta de la marca, no solo por el valor guardado", () => {
    // En Sanity la marca se guarda como "mrlucky".
    expect(titles("mr lucky")).toEqual(["Cacahuate"]);
  });

  it("encuentra por categoría", () => {
    expect(titles("chiles secos")).toEqual(
      expect.arrayContaining(["Chile Jalapeño", "Chile Seco Guajillo"])
    );
  });

  it("un match de título gana a uno de categoría", () => {
    expect(titles("chiles secos")[0]).toBe("Chile Seco Guajillo");
  });

  it("combina campos con semántica AND", () => {
    expect(titles("arroz verde valle")).toEqual(["Arroz"]);
  });
});

describe("searchProducts — valores que no son marcas", () => {
  it("'natural' no arrastra todas las frutas y verduras", () => {
    expect(titles("natural")).toEqual([]);
  });

  it("'variado' no arrastra los productos de relleno", () => {
    expect(titles("variado")).toEqual([]);
  });

  it("esos productos siguen siendo buscables por título", () => {
    expect(titles("platano")).toContain("Plátano Macho");
    expect(titles("surtido")).toContain("Surtido de Nueces");
  });

  it("y por categoría", () => {
    expect(titles("frutas y verduras")).toContain("Plátano Macho");
  });

  it("'generico' sí se indexa como marca", () => {
    expect(titles("generico")).toEqual(
      expect.arrayContaining(["Chile Jalapeño", "Jugo de Manzana"])
    );
  });
});

describe("searchProducts — sinónimos en inglés", () => {
  it("encuentra el producto buscándolo en inglés", () => {
    expect(titles("avocado")).toContain("Aguacate Hass");
    expect(titles("eggs")).toContain("Docena de Huevo");
  });

  it("acepta el singular y el plural del alias", () => {
    expect(titles("blueberry")).toContain("Blueberry");
    expect(titles("blueberries")).toContain("Blueberry");
  });

  it("acepta alias de varias palabras", () => {
    expect(titles("green beans")).toEqual(["Ejote"]);
  });

  it("también funciona del español al español", () => {
    // "moras" es como se pide la zarzamora.
    expect(titles("moras")).toContain("Zarzamora");
  });

  it("prefiere la frase más larga del diccionario", () => {
    // "moras" por su cuenta lleva a la zarzamora, pero "moras azules" es el
    // blueberry. Gana la frase completa.
    expect(titles("moras azules")).toEqual(["Blueberry"]);
  });

  it("distingue los dos 'pepper' del catálogo", () => {
    // Los dos productos salen en ambas búsquedas —"pimiento" y "pimienta" se
    // parecen demasiado para que el fuzzy los separe—, pero cada consulta
    // pone primero el suyo, que es lo que importa.
    expect(titles("pepper")[0]).toBe("Pimiento Rojo");
    expect(titles("black pepper")[0]).toBe("Pimienta Entera Chica");
  });

  it("compone un alias por palabra cuando la frase no está en el diccionario", () => {
    // "black beans" no es una entrada: se resuelve como negro + frijol.
    expect(titles("black beans")).toEqual(["Frijol Negro"]);
  });

  it("no rompe la búsqueda en español", () => {
    expect(titles("aguacate")).toContain("Aguacate Hass");
    expect(titles("huevo")).toContain("Docena de Huevo");
  });

  it("un match literal gana a uno por sinónimo", () => {
    const catalogo = [
      { title: "Mermelada de Mora Azul" },
      { title: "Mermelada de Blueberry" },
    ];

    expect(searchProducts(catalogo, "blueberry")[0].title).toBe(
      "Mermelada de Blueberry"
    );
  });

  it("mantiene la semántica AND con sinónimos", () => {
    expect(titles("avocado manzana")).toEqual([]);
  });

  it("combina un sinónimo del título con la marca literal", () => {
    expect(titles("rice verde valle")).toEqual(["Arroz"]);
  });

  it("un token sin sinónimo y sin coincidencia sigue descartando", () => {
    expect(titles("avocado xyz")).toEqual([]);
  });
});

describe("searchProducts — semántica AND y casos borde", () => {
  it("exige que todos los tokens coincidan en algún campo", () => {
    expect(titles("chile manzana")).toEqual([]);
  });

  it("devuelve vacío si nada coincide", () => {
    expect(titles("xyz")).toEqual([]);
  });

  it("devuelve el catálogo intacto con una búsqueda vacía", () => {
    expect(searchProducts(CATALOG, "")).toEqual(CATALOG);
    expect(searchProducts(CATALOG, "   ")).toEqual(CATALOG);
  });

  it("no lanza con productos sin marca ni categoría", () => {
    const parcial = [{ title: "Limón" }];
    expect(searchProducts(parcial, "limon")).toEqual(parcial);
  });

  it("no lanza con una marca desconocida y busca solo por título", () => {
    const desconocida = [
      { title: "Café Molido", brand: "marca-nueva", productCategory: "abarrotes" },
    ];
    expect(searchProducts(desconocida, "cafe")).toHaveLength(1);
    expect(searchProducts(desconocida, "marca nueva")).toEqual([]);
  });
});
