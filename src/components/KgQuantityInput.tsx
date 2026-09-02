"use client";

import { twMerge } from "tailwind-merge";

interface Props {
    /** Texto del campo. Se controla desde el padre para poder vaciarlo. */
    value: string;
    onChange: (value: string) => void;
    /** Nombre accesible; por defecto describe un campo de cantidad en kg. */
    ariaLabel?: string;
    placeholder?: string;
    onBlur?: () => void;
    /** Se invoca al presionar Enter. */
    onEnter?: () => void;
    className?: string;
}

/**
 * Campo de cantidad en kilogramos. Es sólo el input, sin envoltorio ni layout,
 * para que herede el ancho de donde se monte igual que antes de extraerlo.
 * No valida ni despacha: sirve tanto para el alta desde la página de producto
 * (se confirma con el botón) como para la edición en el carrito
 * (`CartKgQuantityInput`, que confirma al salir del campo).
 */
const KgQuantityInput = ({
    value,
    onChange,
    ariaLabel = "Cantidad en kilogramos",
    placeholder,
    onBlur,
    onEnter,
    className,
}: Props) => (
    <input
        type="number"
        inputMode="decimal"
        // Sin `step`, el navegador asume 1 y marca como inválido cualquier
        // decimal — justo lo normal en un campo de kilos.
        step="any"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) {
                e.preventDefault();
                onEnter();
            }
        }}
        className={twMerge(
            "border-[1px] border-gray-300/50 rounded-md px-2 py-2",
            className
        )}
    />
);

export default KgQuantityInput;
