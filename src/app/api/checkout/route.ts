import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "../../../../auth";
import { resolveOrder, SlimLine } from "../../../server/pricing";
import { PICKUP_ENABLED } from "../../../lib/shipping";
import {
    SLOT_CAPACITY,
    isValidDeliveryDate,
    isValidSlot,
    todayISO,
} from "../../../lib/delivery";
import { readSlotAvailability } from "../../../server/delivery-slots";
import { getZoneForZip } from "../../../lib/zones";

export const POST = async (req: NextRequest) => {
    // Fecha de compra, en el calendario de CDMX. Antes se calculaba con la
    // zona del servidor, así que un pedido de la noche podía registrarse con
    // la fecha del día siguiente.
    const today = todayISO();

    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Missing Stripe Secret Key");
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    try {
        // Identity comes from the session, never from the client body.
        const session = await auth();
        const email = session?.user?.email;
        const clientId = session?.user?.id;
        if (!email || !clientId) {
            return NextResponse.json(
                { error: "Debes iniciar sesión para realizar el pago." },
                { status: 401 }
            );
        }

        const reqBody = await req.json();
        const {
            lines,
            zipCode,
            shippingMethod,
            pickupLocation,
            selectedHour,
            deliveryDate,
        } = reqBody;

        // La UI ya oculta el Pick & Go, pero una pestaña vieja o una llamada
        // directa podrían seguir mandando `pickup`.
        if (!PICKUP_ENABLED && shippingMethod !== "domicilio") {
            return NextResponse.json(
                {
                    error: "Pick & Go no está disponible por el momento. Selecciona entrega a domicilio.",
                },
                { status: 400 }
            );
        }

        if (!zipCode && !pickupLocation) {
            return NextResponse.json(
                {
                    error: "Hubo un problema con el proceso de checkout, por favor intenta de nuevo.",
                },
                {
                    status: 400,
                }
            );
        }

        // La zona decide el pedido mínimo; el envío es igual para todas.
        const zone = getZoneForZip(zipCode);

        if (shippingMethod === "domicilio" && !zone) {
            return NextResponse.json(
                {
                    error: "Lo sentimos 😢, el código postal que ha ingresado está fuera de nuestras zonas de entrega. Escríbenos por WhatsApp para revisar tu caso particular.",
                },
                { status: 400 }
            );
        }

        if (shippingMethod === "domicilio") {
            if (!selectedHour) {
                return NextResponse.json(
                    {
                        error: "Se requiere un horario para la entrega a domicilio.",
                    },
                    { status: 400 }
                );
            }

            if (!isValidSlot(selectedHour)) {
                return NextResponse.json(
                    { error: "Se ha seleccionado una hora inválida." },
                    { status: 400 }
                );
            }

            if (!deliveryDate) {
                return NextResponse.json(
                    {
                        error: "Se requiere una fecha para la entrega a domicilio.",
                    },
                    { status: 400 }
                );
            }

            // Se recalcula el rango aquí: la lista de días que vio el carrito
            // pudo quedar vieja en una pestaña abierta desde ayer, y sábados,
            // domingos y el mismo día nunca son entregables.
            if (!isValidDeliveryDate(deliveryDate)) {
                return NextResponse.json(
                    {
                        error: "La fecha de entrega seleccionada no está disponible. Vuelve a elegir un día.",
                    },
                    { status: 400 }
                );
            }

            // El cupo se comprueba también aquí, no sólo en el carrito: el
            // botón deshabilitado no detiene una llamada directa a la API ni
            // a dos clientes que eligen la última plaza a la vez. Es el
            // último punto antes de cobrar, así que es donde tiene que
            // rechazarse; después del pago ya no se puede decir que no.
            const availability = await readSlotAvailability({
                clientId,
                deliveryDate,
                slot: selectedHour,
            });

            if (availability.clientHasReserved) {
                return NextResponse.json(
                    {
                        error: "Ya tienes un pedido programado en ese horario. Elige otra franja u otro día.",
                    },
                    { status: 409 }
                );
            }

            if (availability.reservations.length >= SLOT_CAPACITY) {
                return NextResponse.json(
                    {
                        error: "Ese horario acaba de llenarse. Por favor elige otra franja u otro día.",
                    },
                    { status: 409 }
                );
            }
        }

        // Prices, line items and shipping are recomputed from Sanity — the
        // client's `lines` only carry `_id` + quantities.
        const { stripeLineItems, subtotal, shipping } = await resolveOrder(
            lines as SlimLine[]
        );

        // El mínimo se compara contra el subtotal recalculado en el servidor,
        // no contra el que mostró el carrito.
        if (shippingMethod === "domicilio" && zone && subtotal < zone.minOrder) {
            return NextResponse.json(
                {
                    error: `El pedido mínimo en ${zone.label} es de $${zone.minOrder}. Te faltan $${(zone.minOrder - subtotal).toFixed(2)}.`,
                },
                { status: 400 }
            );
        }

        const origin = req.headers.get("origin");

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: stripeLineItems,
            mode: "payment",
            locale: "es",
            phone_number_collection: {
                enabled: true,
            },
            success_url: `${origin}/success/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/cancel/?cancelled=true`,
            metadata: {
                email,
                pickupLocation,
                shippingMethod,
                // `date` es la fecha de compra y se conserva con ese
                // significado; `deliveryDate` es la que el cliente eligió para
                // recibir, en ISO para poder ordenarla y compararla.
                date: today,
                schedule: shippingMethod === "domicilio" ? selectedHour : null,
                deliveryDate:
                    shippingMethod === "domicilio" ? deliveryDate : null,
                // El CP validado contra las zonas. La dirección la captura
                // Stripe después; el panel compara ambos y marca el pedido
                // como "Requiere revisión" si no coinciden.
                zipCode: shippingMethod === "domicilio" ? zipCode : null,
            },
            shipping_address_collection: {
                allowed_countries: shippingMethod === "domicilio" ? ["MX"] : [],
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: {
                            amount: Math.round(shipping * 100),
                            currency: "mxn",
                        },
                        display_name: "Costo de envío",
                    },
                },
            ],
        });

        return NextResponse.json({ url: stripeSession?.url }, { status: 200 });
    } catch (error: unknown) {
        console.error("Checkout Error:", error);
        const message =
            error instanceof Error
                ? error.message
                : "Ha ocurrido un error durante el proceso de pago";
        return NextResponse.json({ error: message }, { status: 500 });
    }
};
