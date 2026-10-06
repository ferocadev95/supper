"use client";

import { useState } from "react";
import ZipCoverageNotice from "./ZipCoverageNotice";

/** Buscador de cobertura para la página de zonas de entrega. */
const ZipChecker = () => {
    const [zipCode, setZipCode] = useState<string>("");

    return (
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-md border-[1px] border-gray-200">
            <label htmlFor="zip-checker" className="font-semibold text-lg">
                ¿Llegamos a tu domicilio? Escribe tu código postal:
            </label>
            <input
                id="zip-checker"
                value={zipCode}
                onChange={(e) =>
                    setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))
                }
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                placeholder="Ej. 53100"
                className="p-3 bg-gray-100 rounded-md border-gray-300/50 border-[1px] outline-none text-lg max-w-xs"
            />
            <ZipCoverageNotice zipCode={zipCode} showZonesLink={false} />
        </div>
    );
};

export default ZipChecker;
