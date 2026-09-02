"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { isValidKgQuantity } from "../lib/pricing";
import KgQuantityInput from "./KgQuantityInput";

interface Props {
    /** Etiqueta corta a la izquierda, p. ej. "Maduro" / "Verde". */
    label?: string;
    /** Cantidad en kg actualmente guardada (fuente de verdad, viene de Redux). */
    value: number;
    /**
     * Se invoca sólo con una cantidad válida y distinta de `value`. Devolver
     * `false` rechaza el cambio y revierte el campo (p. ej. la guarda de
     * maduro + verde > 0).
     */
    onCommit: (kg: number) => void | boolean;
    /** Los lados de un `m-kg` pueden ser 0 mientras el otro no lo sea. */
    allowZero?: boolean;
}

/**
 * Cantidad en kg ligada a una línea del carrito. Confirma al salir del campo o
 * con Enter — no en cada tecla, para no disparar con valores intermedios como
 * "0.". Si lo escrito es inválido avisa y revierte a `value`, así el carrito
 * nunca queda en una cantidad que el checkout rechazaría.
 */
const CartKgQuantityInput = ({ label, value, onCommit, allowZero }: Props) => {
    const [draft, setDraft] = useState<string>(String(value ?? 0));
    const [lastValue, setLastValue] = useState<number>(value);

    // Resincroniza cuando el valor cambia desde fuera (p. ej. `setCart` al
    // iniciar sesión, donde gana el carrito del servidor). Se ajusta durante el
    // render en vez de en un efecto, que provocaría un render en cascada.
    if (value !== lastValue) {
        setLastValue(value);
        setDraft(String(value ?? 0));
    }

    const commit = () => {
        const kg = parseFloat(draft);

        if (!isValidKgQuantity(kg, allowZero)) {
            toast.error("La cantidad ingresada es inválida.");
            setDraft(String(value ?? 0));
            return;
        }

        if (kg === value) return;

        if (onCommit(kg) === false) {
            setDraft(String(value ?? 0));
        }
    };

    // La fila del carrito sí necesita etiqueta y unidad alrededor del campo;
    // el layout vive aquí para que el input siga siendo neutro en otros usos.
    return (
        <div className="flex items-center gap-2 text-sm font-semibold">
            {label && <span>{label}:</span>}
            <KgQuantityInput
                value={draft}
                onChange={setDraft}
                ariaLabel={
                    label ? `${label} en kilogramos` : "Cantidad en kilogramos"
                }
                onBlur={commit}
                onEnter={commit}
                className="w-20 py-1"
            />
            <span>Kg</span>
        </div>
    );
};

export default CartKgQuantityInput;
