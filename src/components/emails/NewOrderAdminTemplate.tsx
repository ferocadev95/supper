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
import { describeQuantity, formatAddress, money } from "./format";

export interface NewOrderAdminTemplateProps {
    orderId: string;
    customerEmail: string;
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

export function NewOrderAdminTemplate({
    orderId,
    customerEmail,
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
}: Readonly<NewOrderAdminTemplateProps>): React.ReactElement {
    const isPickup = shippingMethod === "pickup";
    const formattedDate = deliveryDate ? formatDeliveryDate(deliveryDate) : "";
    const formattedAddress = formatAddress(address);

    return (
        <Html>
            <Head />
            <Preview>
                {`Nueva venta de ${money(total)} · ${customerEmail}`}
            </Preview>
            <Tailwind>
                <Heading className="mx-0 my-[24px] p-0 text-center text-2xl font-bold text-black">
                    🛒 Nueva venta
                </Heading>
                <Text className="text-center text-base text-black">
                    {money(total)} · {customerEmail}
                </Text>

                <Section className="my-[24px] rounded-lg bg-[#f3f7ec] p-[16px]">
                    <Heading
                        as="h2"
                        className="m-0 mb-[8px] text-lg font-semibold text-[#4c711e]"
                    >
                        {isPickup ? "Recolección" : "Entrega"}
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
                </Section>

                <Heading
                    as="h2"
                    className="mb-[8px] text-lg font-semibold text-black"
                >
                    Cliente
                </Heading>
                <Section>
                    <Text className="m-0 text-sm text-black">
                        {customerEmail}
                    </Text>
                    {phoneNumber ? (
                        <Text className="m-0 text-sm text-black">
                            Tel. {phoneNumber}
                        </Text>
                    ) : null}
                </Section>

                <Heading
                    as="h2"
                    className="mb-[8px] mt-[16px] text-lg font-semibold text-black"
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
                    Pedido {orderId}
                </Text>
            </Tailwind>
        </Html>
    );
}
