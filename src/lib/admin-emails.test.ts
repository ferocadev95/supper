import { describe, expect, it } from "vitest";
import { parseAdminEmails } from "./admin-emails";

describe("parseAdminEmails", () => {
    it("sin variable definida no hay destinatarios", () => {
        expect(parseAdminEmails(undefined)).toEqual([]);
        expect(parseAdminEmails("")).toEqual([]);
    });

    it("mantiene el formato antiguo de una sola dirección", () => {
        expect(parseAdminEmails("ventas@frutivida.mx")).toEqual([
            "ventas@frutivida.mx",
        ]);
    });

    it("separa por coma, punto y coma o espacios", () => {
        expect(parseAdminEmails("a@x.com, b@x.com;c@x.com  d@x.com")).toEqual([
            "a@x.com",
            "b@x.com",
            "c@x.com",
            "d@x.com",
        ]);
    });

    it("normaliza mayúsculas y quita duplicados", () => {
        expect(parseAdminEmails("A@x.com, a@X.com ")).toEqual(["a@x.com"]);
    });

    it("descarta entradas que no parecen correos", () => {
        expect(parseAdminEmails("a@x.com, no-es-correo, @x.com, b@x")).toEqual([
            "a@x.com",
        ]);
    });
});
