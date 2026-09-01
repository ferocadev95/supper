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
