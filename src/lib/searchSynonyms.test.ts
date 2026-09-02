import { describe, expect, it } from "vitest";

import { normalizeText } from "./search";
import { SEARCH_SYNONYMS } from "./searchSynonyms";

const entries = Object.entries(SEARCH_SYNONYMS);

describe("SEARCH_SYNONYMS", () => {
  it("no está vacío", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it("guarda los términos ya normalizados", () => {
    // Una clave con acento o mayúscula nunca coincidiría con la consulta, que
    // llega normalizada. Es el error fácil al añadir entradas: "Plátano".
    const sinNormalizar = entries
      .map(([term]) => term)
      .filter((term) => normalizeText(term) !== term);

    expect(sinNormalizar).toEqual([]);
  });

  it("guarda los alias ya normalizados", () => {
    const sinNormalizar = entries.flatMap(([term, aliases]) =>
      aliases
        .filter((alias) => normalizeText(alias) !== alias)
        .map((alias) => `${term}: ${alias}`)
    );

    expect(sinNormalizar).toEqual([]);
  });

  it("no deja entradas sin alias", () => {
    const vacias = entries
      .filter(([, aliases]) => aliases.length === 0)
      .map(([term]) => term);

    expect(vacias).toEqual([]);
  });

  it("no repite un alias dentro de la misma entrada", () => {
    const duplicados = entries
      .filter(([, aliases]) => new Set(aliases).size !== aliases.length)
      .map(([term]) => term);

    expect(duplicados).toEqual([]);
  });

  it("no lista un término como alias de sí mismo", () => {
    const redundantes = entries
      .filter(([term, aliases]) => aliases.includes(term))
      .map(([term]) => term);

    expect(redundantes).toEqual([]);
  });
});
