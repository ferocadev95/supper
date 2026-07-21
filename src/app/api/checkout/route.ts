import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "../../../../auth";
import { resolveOrder, SlimLine } from "../../../server/pricing";

const predefinedHours = [
    "9:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00",
    "17:00-18:00",
];

export const POST = async (req: NextRequest) => {
    const allowedZipCodes = [
        "52930",
        "52934",
        "52936",
        "52937",
        "52938",
        "52989",
        "54578",
    ];
    const today = new Date().toLocaleDateString("es-MX").split("T")[0];

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
        const { lines, zipCode, shippingMethod, pickupLocation, selectedHour } =
            reqBody;

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

        if (
            shippingMethod === "domicilio" &&
            !allowedZipCodes.includes(zipCode)
        ) {
            return NextResponse.json(
                {
                    error: "Lo sentimos 😢, el código postal que ha ingresado está fuera de nuestro alcance. Contacta a servicio a cliente para revisar tu caso particular.",
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

            if (!predefinedHours.includes(selectedHour)) {
                return NextResponse.json(
                    { error: "Se ha seleccionado una hora inválida." },
                    { status: 400 }
                );
            }
        }

        // Prices, line items and shipping are recomputed from Sanity — the
        // client's `lines` only carry `_id` + quantities.
        const { stripeLineItems, shipping } = await resolveOrder(
            lines as SlimLine[]
        );

        const origin = req.headers.get("origin");

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: stripeLineItems,
            mode: "payment",
            locale: "es",
            phone_number_collection: {
                enabled: true,
            },
            success_url: `${origin}/success/?session_id={CHECKOUT_SESSION_ID}&client_id=${clientId}&shipping_method=${shippingMethod}&selected_hour=${selectedHour}`,
            cancel_url: `${origin}/cancel/?cancelled=true`,
            metadata: {
                email,
                pickupLocation,
                shippingMethod,
                date: today,
                schedule: shippingMethod === "domicilio" ? selectedHour : null,
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
