import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import FormattedPrice from "./FormattedPrice";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "../lib/pricing";
import { coverageInquiryUrl, getZoneForZip } from "../lib/zones";

interface Props {
    zipCode: string;
    /** Subtotal del carrito; sin él sólo se informa la zona y sus reglas. */
    subtotal?: number;
    /** Muestra el enlace a la página de zonas (en la propia página sobra). */
    showZonesLink?: boolean;
}

/**
 * Lo que el cliente necesita saber de su código postal: si hay cobertura, en
 * qué zona cae, el pedido mínimo y cuánto le falta para pagar o para el envío
 * gratis. Fuera de zona, lo manda a WhatsApp con el CP ya escrito.
 */
const ZipCoverageNotice = ({ zipCode, subtotal, showZonesLink = true }: Props) => {
    const zip = zipCode.trim();
    // Hasta tener los 5 dígitos no hay nada que decir: evita marcar "sin
    // cobertura" mientras el usuario todavía está escribiendo.
    if (zip.length < 5) return null;

    const zone = getZoneForZip(zip);

    if (!zone) {
        return (
            <div className="rounded-md border-[1px] border-red-200 bg-red-50 p-3 text-sm flex flex-col gap-2">
                <p className="font-semibold text-red-700">
                    Aún no tenemos cobertura registrada en el código postal{" "}
                    {zip}.
                </p>
                <p className="text-gray-700">
                    Escríbenos por WhatsApp y revisamos si es posible realizar
                    tu entrega.
                </p>
                <a
                    href={coverageInquiryUrl(zip)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600 hoverEffect"
                >
                    <FaWhatsapp className="text-lg" />
                    Consultar por WhatsApp
                </a>
                {showZonesLink && (
                    <Link
                        href="/zonas-de-entrega"
                        className="text-primaryGreen underline font-medium"
                    >
                        Ver zonas de entrega
                    </Link>
                )}
            </div>
        );
    }

    const missingForMin =
        subtotal !== undefined ? zone.minOrder - subtotal : 0;
    const missingForFree =
        subtotal !== undefined ? FREE_SHIPPING_THRESHOLD - subtotal : 0;

    return (
        <div className="rounded-md border-[1px] border-primaryGreen/40 bg-primaryGreen/10 p-3 text-sm flex flex-col gap-1">
            <p className="font-semibold text-primaryGreenDark">
                {zone.emoji} ¡Sí entregamos en tu zona! Tu código postal está en{" "}
                {zone.label}.
            </p>
            <p className="text-gray-700">
                Pedido mínimo: <FormattedPrice amount={zone.minOrder} /> ·
                Envío: <FormattedPrice amount={SHIPPING_COST} /> · Envío GRATIS
                desde <FormattedPrice amount={FREE_SHIPPING_THRESHOLD} />
            </p>
            {subtotal !== undefined &&
                (missingForMin > 0 ? (
                    <p className="font-semibold text-red-600">
                        Te faltan <FormattedPrice amount={missingForMin} /> para
                        alcanzar el pedido mínimo de tu zona.
                    </p>
                ) : missingForFree > 0 ? (
                    <p className="font-medium text-gray-800">
                        Agrega <FormattedPrice amount={missingForFree} /> más y
                        tu envío es GRATIS.
                    </p>
                ) : (
                    <p className="font-semibold text-primaryGreenDark">
                        🎉 ¡Tu envío es GRATIS!
                    </p>
                ))}
        </div>
    );
};

export default ZipCoverageNotice;
