import { describe, it, expect } from "vitest";
import { DELIVERY_ZONES, coverageInquiryUrl, getZoneForZip } from "./zones";

describe("getZoneForZip", () => {
    it("zona principal: mínimo $300", () => {
        const zone = getZoneForZip("53100");
        expect(zone?.id).toBe("principal");
        expect(zone?.minOrder).toBe(300);
    });

    it("zona extendida: mínimo $500", () => {
        const zone = getZoneForZip("53227");
        expect(zone?.id).toBe("extendida");
        expect(zone?.minOrder).toBe(500);
    });

    it("conserva los CPs que ya se aceptaban antes", () => {
        for (const zip of ["52934", "52937", "54578"]) {
            expect(getZoneForZip(zip)?.id).toBe("extendida");
        }
    });

    it("tolera espacios y números", () => {
        expect(getZoneForZip(" 54050 ")?.id).toBe("principal");
        expect(getZoneForZip(53298)?.id).toBe("extendida");
    });

    it("sin cobertura o formato inválido devuelve null", () => {
        expect(getZoneForZip("01000")).toBeNull();
        expect(getZoneForZip("5310")).toBeNull();
        expect(getZoneForZip("")).toBeNull();
        expect(getZoneForZip(undefined)).toBeNull();
    });

    it("ningún CP está en dos zonas", () => {
        const all = DELIVERY_ZONES.flatMap((zone) => zone.zipCodes);
        expect(new Set(all).size).toBe(all.length);
    });
});

describe("coverageInquiryUrl", () => {
    it("prellena el CP en el mensaje de WhatsApp", () => {
        expect(coverageInquiryUrl("01000")).toContain("01000");
        expect(coverageInquiryUrl("01000")).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    });
});
