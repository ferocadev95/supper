import { useEffect, useState } from "react";

/**
 * Devuelve `value` con un retraso, reiniciando la espera en cada cambio. Se usa
 * para no consultar el servidor en cada pulsación: mientras el usuario sigue
 * escribiendo, el valor devuelto no se mueve.
 */
export const useDebouncedValue = <T,>(value: T, delay: number): T => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
};

export default useDebouncedValue;
