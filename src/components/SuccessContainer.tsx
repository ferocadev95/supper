"use client";

import { StoreState } from "../../types";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { resetCart } from "../lib/redux/features/cart/cartSlice";
import Loader from "./Loader";
import {
    HiCheckCircle,
    HiHome,
    HiInformationCircle,
    HiXCircle,
} from "react-icons/hi";
import Link from "next/link";
import FormattedPrice from "./FormattedPrice";
import { computeCartTotals } from "../lib/pricing";

const SuccessContainer = ({
    id,
    phoneNumber,
}: {
    id: string;
    phoneNumber?: string | null;
}) => {
    const { cartItems } = useSelector((state: StoreState) => state?.cart);
    const dispatch = useDispatch();
    const { data: session, status } = useSession();
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // Una vez que el servidor confirma el importe cobrado, ese valor manda: el
    // estimado local ya no puede volver a escribir sobre él.
    const serverTotalRef = useRef<boolean>(false);
    // El pedido se procesa una sola vez; `resetCart` vacía el carrito y volvía
    // a disparar el efecto, dejando la página en el loader para siempre.
    const processedRef = useRef<boolean>(false);

    // Local estimate shown before the server responds; the authoritative total
    // returned by /api/saveorder replaces it once the order is persisted.
    useEffect(() => {
        if (serverTotalRef.current || cartItems.length === 0) return;
        const { total } = computeCartTotals(
            cartItems.map((item) => ({ price: item, quantities: item }))
        );
        setTotalAmount(total);
    }, [cartItems]);

    // El método de envío, el día y la franja los resuelve el servidor leyendo
    // la sesión de Stripe: antes viajaban por la URL, donde el cliente podía
    // cambiarlos después de pagar.
    const handleReservation = async () => {
        try {
            const response = await fetch("/api/reserve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.erorr || "Error al reservar");
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    const handleSaveOrder = async () => {
        try {
            const response = await fetch("/api/saveorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: id,
                    // Only identity + quantities; the server recomputes amounts.
                    lines: cartItems.map((item) => ({
                        _id: item._id,
                        quantity: item.quantity,
                        matureQuantity: item.matureQuantity,
                        greenQuantity: item.greenQuantity,
                        kgQuantity: item.kgQuantity,
                    })),
                    phoneNumber,
                }),
            });
            const data = await response.json();
            if (data?.success) {
                // Reflect exactly what the server charged/saved.
                if (typeof data.total === "number") {
                    serverTotalRef.current = true;
                    setTotalAmount(data.total);
                }
                dispatch(resetCart());
            } else {
                throw new Error("Error al guardar el pedido");
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    useEffect(() => {
        const processOrder = async () => {
            if (processedRef.current) return;
            if (session?.user && cartItems?.length > 0) {
                processedRef.current = true;
                setLoading(true);
                try {
                    await handleReservation();
                    await handleSaveOrder();
                } catch (error) {
                    console.log(error);
                    setError(
                        "Ha habido un problema al procesar tu pedido en la base de datos, por favor comunícate con atención al cliente. Lamentamos los inconvenientes."
                    );
                } finally {
                    setLoading(false);
                }
            }
        };

        processOrder();
    }, [session?.user, cartItems?.length]);

    // Si la sesión ya se resolvió y no hay nada que procesar (por ejemplo al
    // recargar /success cuando el pedido ya se guardó y el carrito quedó
    // vacío), se muestra la confirmación en vez de dejar el loader girando.
    useEffect(() => {
        if (status === "loading" || processedRef.current) return;
        const timer = setTimeout(() => {
            if (!processedRef.current) setLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, [status, cartItems?.length]);

    return (
        <div>
            {loading ? (
                <div>
                    <Loader
                        title="El pedido está siendo procesado. Por favor espera..."
                        size={48}
                        color="#6b9a2e"
                    />
                </div>
            ) : (
                <div
                    className={`${error ? "from-red-100 to red-500" : "from-green-100 to-white"} bg-gradient-to-b flex items-center justify-center px-4 py-28 min-h-[70vh]`}
                >
                    <div className="max-w-md w-full space-y-8 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                    className={`w-32 h-32  rounded-full ${error ? "bg-red-100" : "bg-green-100"}`}
                                ></div>
                            </div>
                            <div className="relative">
                                {error ? (
                                    <HiXCircle className="mx-auto h-24 w-24 text-red-500" />
                                ) : (
                                    <HiCheckCircle className="mx-auto h-24 w-24 text-green-500" />
                                )}
                            </div>
                        </div>
                        <h2 className="mt-6 text-2xl md:text-3xl font-extrabold text-gray-900">
                            {error
                                ? "Hubo un error al registrar tu pedido. Por favor contacta a servicio a clientes."
                                : "¡Gracias por tu compra!"}
                        </h2>
                        <p className="text-sm mt-2 text-gray-600">
                            {error
                                ? "Hubo un error al registrar tu pedido. Por favor contacta a servicio a clientes."
                                : "Tu pedido se ha registrado correctamente. Si olvidaste agregar algún producto a tu compra, por favor contacta a servicio a clientes."}
                        </p>
                        <div className="mt-8 space-y-6">
                            <p className="text-base text-gray-700">
                                {error
                                    ? error
                                    : "Gracias por tu confianza. Hemos recibido la información de tu pedido y la estamos procesando. Recibirás un e-mail de confirmación dentro de los próximos minutos."}
                            </p>
                            {!error && totalAmount > 0 && (
                                <div className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-800">
                                    <span>Total pagado:</span>
                                    <FormattedPrice amount={totalAmount} />
                                </div>
                            )}
                            {!error && (
                                <div className="flex flex-wrap gap-4 items-center justify-center">
                                    <Link href={"/"}>
                                        <button className="btn-secondary px-4 py-2 rounded-full shadow-md hover:-translate-y-1">
                                            <HiHome className="mr-2 h-5 w-5" />
                                            Inicio
                                        </button>
                                    </Link>
                                    <Link href={"/pedidos"}>
                                        <button className="btn-primary px-4 py-2 rounded-full shadow-md hover:-translate-y-1">
                                            <HiInformationCircle className="mr-2 h-5 w-5" />
                                            Mis Pedidos
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="mt-10 flex justify-center space-x-4">
                            <div
                                className={`w-3 h-3 rounded-full ${error ? "bg-red-200" : "bg-green-200"}`}
                            ></div>
                            <div
                                className={`w-3 h-3 rounded-full ${error ? "bg-red-300" : "bg-green-300"}`}
                            ></div>
                            <div
                                className={`w-3 h-3 rounded-full ${error ? "bg-red-400" : "bg-green-400"}`}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuccessContainer;
