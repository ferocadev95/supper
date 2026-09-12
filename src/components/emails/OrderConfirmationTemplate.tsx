import {
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Row,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import type Stripe from "stripe";
import type { ResolvedItem } from "../../server/pricing";
import { formatDeliveryDate, slotLabel } from "../../lib/delivery";

export interface OrderConfirmationTemplateProps {
    orderId: string;
    items: ResolvedItem[];
    subtotal: number;
    shipping: number;
    total: number;
    deliveryDate: string | null;
    deliverySlot: string | null;
    shippingMethod: string | null;
    pickupLocation: string | null;
    address: Stripe.Address | null;
    phoneNumber: string | null;
}

const money = (amount: number) =>
    amount.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    });

/** Misma manera de nombrar las cantidades que la tabla de "Mis Pedidos". */
const describeQuantity = (item: ResolvedItem): string => {
    switch (item.productType) {
        case "p":
            return `${item.quantity} ${item.quantity === 1 ? "pieza" : "piezas"}`;
        case "m-kg":
            return [
                item.matureQuantity ? `${item.matureQuantity} kg maduro` : "",
                item.greenQuantity ? `${item.greenQuantity} kg verde` : "",
            ]
                .filter(Boolean)
                .join(" · ");
        case "kg":
        case "100g":
            return `${item.kgQuantity} kg`;
        default:
            return "";
    }
};

const formatAddress = (address: Stripe.Address | null): string | null => {
    if (!address) return null;
    const parts = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postal_code,
    ].filter(Boolean);
    return parts.length ? parts.join(", ") : null;
};

export function OrderConfirmationTemplate({
    orderId,
    items,
    subtotal,
    shipping,
    total,
    deliveryDate,
    deliverySlot,
    shippingMethod,
    pickupLocation,
    address,
    phoneNumber,
}: Readonly<OrderConfirmationTemplateProps>): React.ReactElement {
    const isPickup = shippingMethod === "pickup";
    const formattedDate = deliveryDate ? formatDeliveryDate(deliveryDate) : "";
    const formattedAddress = formatAddress(address);

    return (
        <Html>
            <Head />
            <Preview>
                {formattedDate
                    ? `Tu pedido llega el ${formattedDate}`
                    : "Confirmación de tu pedido"}
            </Preview>
            <Tailwind>
                <Heading className="mx-0 my-[30px] p-0 text-center text-3xl font-bold text-black">
                    🍅 ¡Gracias por tu compra! 🍅
                </Heading>
                <Text className="text-center text-base text-black">
                    Recibimos tu pedido y ya lo estamos preparando.
                </Text>

                <Section className="my-[24px] rounded-lg bg-[#f3f7ec] p-[16px]">
                    <Heading
                        as="h2"
                        className="m-0 mb-[8px] text-lg font-semibold text-[#4c711e]"
                    >
                        {isPickup ? "Tu recolección" : "Tu entrega"}
                    </Heading>
                    {formattedDate ? (
                        <Text className="m-0 text-base capitalize text-black">
                            {formattedDate}
                        </Text>
                    ) : null}
                    {deliverySlot ? (
                        <Text className="m-0 text-base text-black">
                            {slotLabel(deliverySlot)}
                        </Text>
                    ) : null}
                    {isPickup && pickupLocation ? (
                        <Text className="m-0 text-sm text-gray-600">
                            Lugar de recolección: {pickupLocation}
                        </Text>
                    ) : null}
                    {!isPickup && formattedAddress ? (
                        <Text className="m-0 text-sm text-gray-600">
                            {formattedAddress}
                        </Text>
                    ) : null}
                    {phoneNumber ? (
                        <Text className="m-0 text-sm text-gray-600">
                            Tel. {phoneNumber}
                        </Text>
                    ) : null}
                </Section>

                <Heading
                    as="h2"
                    className="mb-[8px] text-lg font-semibold text-black"
                >
                    Productos
                </Heading>
                <Section>
                    {items.map((item) => (
                        <Row key={item._id} className="mb-[4px]">
                            <Column>
                                <Text className="m-0 text-sm text-black">
                                    {item.title}
                                </Text>
                                <Text className="m-0 text-xs text-gray-500">
                                    {describeQuantity(item)}
                                </Text>
                            </Column>
                            <Column align="right">
                                <Text className="m-0 text-sm text-black">
                                    {money(item.subtotal)}
                                </Text>
                            </Column>
                        </Row>
                    ))}
                </Section>

                <Hr className="my-[16px] border-gray-300" />

                <Section>
                    <Row>
                        <Column>
                            <Text className="m-0 text-sm text-gray-600">
                                Subtotal
                            </Text>
                        </Column>
                        <Column align="right">
                            <Text className="m-0 text-sm text-gray-600">
                                {money(subtotal)}
                            </Text>
                        </Column>
                    </Row>
                    <Row>
                        <Column>
                            <Text className="m-0 text-sm text-gray-600">
                                Costo de envío
                            </Text>
                        </Column>
                        <Column align="right">
                            <Text className="m-0 text-sm text-gray-600">
                                {money(shipping)}
                            </Text>
                        </Column>
                    </Row>
                    <Row>
                        <Column>
                            <Text className="m-0 text-base font-bold text-black">
                                Total
                            </Text>
                        </Column>
                        <Column align="right">
                            <Text className="m-0 text-base font-bold text-black">
                                {money(total)}
                            </Text>
                        </Column>
                    </Row>
                </Section>

                <Hr className="my-[16px] border-gray-300" />

                <Text className="text-center text-xs text-gray-500">
                    Pedido {orderId.slice(-10)}. Si algo no coincide, por favor 
                    contacta a servicio a clientes.
                </Text>
            </Tailwind>
        </Html>
    );
}
