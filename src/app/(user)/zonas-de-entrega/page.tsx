import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import FormattedPrice from "../../../components/FormattedPrice";
import ZipChecker from "../../../components/ZipChecker";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "../../../lib/pricing";
import { DELIVERY_ZONES, coverageInquiryUrl } from "../../../lib/zones";

export const metadata = {
    title: "Zonas de entrega | Fruti Vida",
    description:
        "Consulta si tenemos cobertura en tu código postal, el pedido mínimo y el costo de envío.",
};

const steps = [
    "Agrega tus productos al carrito.",
    "Ingresa tu código postal.",
    "Nuestro sistema verificará automáticamente si tenemos cobertura en tu zona.",
    "Te mostrará el pedido mínimo y el costo de envío correspondiente, si aplica.",
    "Completa tu pedido y recibe tus productos directamente en tu domicilio.",
];

const ZonasDeEntregaPage = () => {
    return (
        <div className="p-8 w-full max-w-screen-xl mx-auto flex flex-col gap-y-8">
            <section className="flex flex-col gap-y-3">
                <h1 className="font-bold text-3xl">🚚 Zonas de entrega Fruti Vida</h1>
                <p>
                    Realizamos entregas de frutas, verduras, abarrotes y
                    productos de calidad directamente hasta tu domicilio.
                </p>
                <p>
                    Para conocer si contamos con cobertura, ingresa tu código
                    postal al realizar tu pedido. El sistema te indicará
                    automáticamente la zona de entrega y las condiciones
                    correspondientes.
                </p>
            </section>

            <ZipChecker />

            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {DELIVERY_ZONES.map((zone) => (
                    <div
                        key={zone.id}
                        className="flex flex-col gap-3 rounded-2xl border-[1px] border-gray-200 p-5"
                    >
                        <h2 className="font-bold text-2xl">
                            {zone.emoji} {zone.label}
                        </h2>
                        <ul className="flex flex-col gap-1">
                            <li>
                                Pedido mínimo:{" "}
                                <FormattedPrice amount={zone.minOrder} />
                            </li>
                            <li>
                                Costo de envío:{" "}
                                <FormattedPrice amount={SHIPPING_COST} />
                            </li>
                            <li>
                                En pedidos de{" "}
                                <FormattedPrice amount={FREE_SHIPPING_THRESHOLD} />{" "}
                                o más, el envío es{" "}
                                <span className="font-bold text-primaryGreen">
                                    GRATIS
                                </span>
                                .
                            </li>
                        </ul>
                        <p className="font-semibold">
                            Códigos postales con cobertura:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {zone.zipCodes.map((zip) => (
                                <span
                                    key={zip}
                                    className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium"
                                >
                                    {zip}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            <section className="flex flex-col gap-y-3">
                <h2 className="font-bold text-2xl">📍 ¿Cómo funciona?</h2>
                <ol className="list-decimal pl-6 flex flex-col gap-1">
                    {steps.map((step) => (
                        <li key={step}>{step}</li>
                    ))}
                </ol>
            </section>

            <section className="flex flex-col gap-y-3">
                <h2 className="font-bold text-2xl">
                    🛒 Compra desde la comodidad de tu casa
                </h2>
                <p>
                    En Fruti Vida seleccionamos nuestros productos buscando
                    ofrecer calidad, frescura y buen servicio.
                </p>
                <p>
                    Si tu código postal no aparece dentro de nuestras zonas de
                    cobertura, contáctanos por WhatsApp para revisar tu caso
                    específico y consultar si es posible realizar la entrega.
                </p>
                <div className="flex flex-wrap gap-3">
                    <a
                        href={coverageInquiryUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600 hoverEffect"
                    >
                        <FaWhatsapp className="text-xl" />
                        Consultar por WhatsApp
                    </a>
                    <Link href="/productos" className="btn-primary px-6 py-3 rounded-full">
                        Comenzar a comprar
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default ZonasDeEntregaPage;
