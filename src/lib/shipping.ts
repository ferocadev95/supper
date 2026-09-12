/**
 * Interruptor del Pick & Go (recolección en sucursal).
 *
 * Por el momento el servicio no se ofrece, así que el valor por defecto —no
 * definir la variable— es **apagado**: el carrito sólo muestra entrega a
 * domicilio y `/api/checkout` rechaza cualquier otro método. `on` lo reactiva
 * sin tocar código, porque toda la implementación de pickup sigue en su sitio,
 * únicamente detrás de esta bandera.
 *
 * La variable es `NEXT_PUBLIC_` porque el cliente decide si enseña la opción y
 * el servidor decide si acepta el pedido, y ambos tienen que leer exactamente
 * el mismo valor: así una pestaña vieja o una llamada directa a la API tampoco
 * pueden colar un pedido de pickup. Se accede como literal
 * (`process.env.NOMBRE`) porque Next sólo sustituye la variable si la ve
 * escrita así.
 */
export const PICKUP_ENABLED = process.env.NEXT_PUBLIC_PICKUP === "on";
