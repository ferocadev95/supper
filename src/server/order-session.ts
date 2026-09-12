import Stripe from "stripe";

/**
 * Lectura verificada de la sesión de Stripe de un pedido.
 *
 * Los datos de entrega (fecha y franja) los fija `/api/checkout` al crear la
 * sesión, y Stripe es quien los custodia. Recuperarlos de aquí —en vez de
 * confiar en los parámetros de la URL de `/success`— significa que el cliente
 * no puede cambiar el día de su entrega después de pagar simplemente editando
 * la barra de direcciones.
 */

export interface OrderSessionDetails {
    deliveryDate: string | null;
    deliverySlot: string | null;
    shippingMethod: string | null;
    pickupLocation: string | null;
    /** Momento de la compra, en ISO. El pedido no guardaba ninguna fecha. */
    createdAt: string;
    phone: string | null;
    address: Stripe.Address | null;
    paid: boolean;
}

let stripeClient: Stripe | null = null;

export const getStripe = (): Stripe => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Missing Stripe Secret Key");
    }
    if (!stripeClient) {
        stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripeClient;
};

const sameEmail = (a?: string | null, b?: string | null) =>
    !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Devuelve los datos del pedido, o `null` si la sesión no existe o no
 * pertenece al usuario autenticado. Que el correo tenga que coincidir evita
 * que alguien pase el id de sesión de otra persona y lea (o reserve) por ella.
 */
export const loadOrderSession = async (
    sessionId: string,
    email: string
): Promise<OrderSessionDetails | null> => {
    let session: Stripe.Checkout.Session;
    try {
        session = await getStripe().checkout.sessions.retrieve(sessionId);
    } catch (error) {
        console.error("No se pudo recuperar la sesión de Stripe:", error);
        return null;
    }

    const sessionEmail =
        session.metadata?.email ||
        session.customer_details?.email ||
        session.customer_email;

    if (!sameEmail(sessionEmail, email)) return null;

    return {
        deliveryDate: session.metadata?.deliveryDate || null,
        deliverySlot: session.metadata?.schedule || null,
        shippingMethod: session.metadata?.shippingMethod || null,
        pickupLocation: session.metadata?.pickupLocation || null,
        createdAt: new Date(session.created * 1000).toISOString(),
        phone: session.customer_details?.phone || null,
        address: session.customer_details?.address || null,
        paid: session.payment_status === "paid",
    };
};
