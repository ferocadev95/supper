"use client";

import { useDispatch, useSelector } from "react-redux";
import { StoreState } from "../../types";
import CartItem from "./CartItem";
import { resetCart } from "../lib/redux/features/cart/cartSlice";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import FormattedPrice from "./FormattedPrice";
import Button from "./Button";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { getReservationsData } from "../server/actions/get-reservations-data";
import { getCartPricing } from "../server/pricing";
import { PriceFields, computeCartTotals } from "../lib/pricing";

interface Props {
    session?: Session;
}

interface Reservation {
    clientId: string;
}

const CartContainer = ({ session }: Props) => {
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [shipping, setShipping] = useState<number>(0);
    const [zipCode, setZipCode] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [shippingMethod, setShippingMethod] = useState<
        "domicilio" | "pickup"
    >("domicilio");
    const [pickupLocation, setPickupLocation] = useState<"Bona" | "Parroquia">(
        "Bona"
    );
    const [selectedHour, setSelectedHour] = useState<string>("8:00-9:00");
    const [reservations, setReservations] = useState<Array<Reservation>>();
    const [clientHasReserved, setClientHasReserved] = useState<boolean>(false);
    const [pricing, setPricing] = useState<Record<string, PriceFields>>({});
    const { cartItems } = useSelector((state: StoreState) => state?.cart);
    const dispatch = useDispatch();

    // Canonical price for a line: fresh from Sanity if loaded, else the stored
    // snapshot as a fallback while it loads.
    const priceFor = (item: (typeof cartItems)[number]): PriceFields =>
        pricing[item._id] ?? item;

    // TODO: Possible validation
    const possibleHours = [
        { hour: "De 9:00 a 10:00 am", value: "9:00-10:00" },
        { hour: "De 10:00 a 11:00 am", value: "10:00-11:00" },
        { hour: "De 11:00 a 12:00 pm", value: "11:00-12:00" },
        { hour: "De 12:00 a 13:00 pm", value: "12:00-13:00" },
        { hour: "De 13:00 a 14:00 pm", value: "13:00-14:00" },
        { hour: "De 14:00 a 15:00 pm", value: "14:00-15:00" },
        { hour: "De 15:00 a 16:00 pm", value: "15:00-16:00" },
        { hour: "De 16:00 a 17:00 pm", value: "16:00-17:00" },
    ];
    // TODO: Change error handling from checkout for reserve if needed. This with the hours.

    const clientId = session?.user?.id;

    // Fetch fresh canonical prices from Sanity for the items in the cart, so the
    // displayed price tracks Sanity even if it changed after the item was added.
    useEffect(() => {
        const ids = cartItems.map((item) => item._id);
        if (ids.length === 0) {
            setPricing({});
            return;
        }
        getCartPricing(ids)
            .then(setPricing)
            .catch((error) =>
                console.error("Error fetching cart pricing", error)
            );
    }, [cartItems]);

    useEffect(() => {
        const { subtotal, shipping } = computeCartTotals(
            cartItems.map((item) => ({
                price: priceFor(item),
                quantities: item,
            }))
        );
        setTotalAmount(subtotal);
        setShipping(shipping);
        // priceFor depends on `pricing`; recompute when either changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartItems, pricing]);

    useEffect(() => {
        const fetchReservationsData = async () => {
            try {
                if (clientId) {
                    const data = await getReservationsData({
                        clientId,
                        selectedHour,
                    });
                    setClientHasReserved(data?.clientHasReserved);
                    setReservations(data?.reservations);
                }
            } catch (error) {
                console.error("Error fetching reservations data", error);
            }
        };

        fetchReservationsData();
    }, [clientId, selectedHour]);

    const handleResetCart = () => {
        const confirmed = window.confirm(
            "¿Estás seguro de limpiar el carrito? Todos los productos serán eliminados"
        );
        if (confirmed) {
            dispatch(resetCart());
            toast.success(
                "Todos los productos han sido eliminados del carrito"
            );
        }
    };

    const handleCheckout = async () => {
        const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // Only identity + quantities; prices are resolved server-side.
                lines: cartItems.map((item) => ({
                    _id: item._id,
                    quantity: item.quantity,
                    matureQuantity: item.matureQuantity,
                    greenQuantity: item.greenQuantity,
                    kgQuantity: item.kgQuantity,
                })),
                zipCode,
                shippingMethod,
                pickupLocation,
                selectedHour,
            }),
        });
        const { url, error } = await response.json();
        setError(error);

        if (url) {
            window.location.href = url;
        }
    };

    return (
        <div className="min-h-[70vh]">
            {cartItems?.length > 0 ? (
                <div className="pb-20">
                    <div className="w-full h-20 bg-[#f5f5f5] text-black hidden lg:grid grid-cols-5 place-content-center px-6 text-lg font-semibold">
                        <h2 className="col-span-2">Producto</h2>
                        <h2>Precio</h2>
                        <h2>Cantidad</h2>
                        <h2>Subtotal</h2>
                    </div>
                    <div className="mt-5">
                        {cartItems?.map((item) => (
                            <CartItem
                                key={item?._id}
                                cart={cartItems}
                                item={item}
                                price={priceFor(item)}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleResetCart}
                        className="py-3 px-10 bg-black hover:bg-black/60 hoverEffect text-white font-semibold uppercase mb-4 text-sm"
                    >
                        Limpiar carrito
                    </button>
                    <div className="max-w-7xl flex justify-end">
                        <div className="w-96 flex flex-col gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-right mb-5">
                                    Total del Carrito
                                </h1>
                                <div>
                                    <p className="flex items-center justify-between border-[1px] border-gray-300 border-b-0 py-1.5 px-4 text-lg font-medium">
                                        Subtotal{" "}
                                        <FormattedPrice amount={totalAmount} />
                                    </p>
                                    <p className="flex items-center justify-between border-[1px] border-gray-300 border-b-0 py-1.5 px-4 text-lg font-medium">
                                        Costo de envío{" "}
                                        <FormattedPrice amount={shipping} />
                                    </p>
                                    <p className="flex items-center justify-between border-[1px] border-gray-300 py-1.5 px-4 text-lg font-medium">
                                        Total{" "}
                                        <FormattedPrice
                                            amount={totalAmount + shipping}
                                        />
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-y-4 mb-4">
                                <p>Selecciona el método de envío:</p>
                                <div className="flex items-center gap-x-3">
                                    <button
                                        onClick={() => {
                                            setShippingMethod("domicilio");
                                        }}
                                        className={`px-6 py-3 font-semibold text-gray-700 border-[1px] rounded-md hoverEffect ${shippingMethod === "domicilio" ? "border-primaryBlue bg-blue-100" : "bg-gray-100 border-gray-300/50 hover:bg-gray-200"}`}
                                    >
                                        A Domicilio
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShippingMethod("pickup");
                                        }}
                                        className={`px-6 py-3 font-semibold border-[1px] rounded-md text-gray-700 hoverEffect ${shippingMethod === "pickup" ? "border-primaryBlue bg-blue-100" : "bg-gray-100 border-gray-300/50 hover:bg-gray-200"}`}
                                    >
                                        Pick & Go
                                    </button>
                                </div>
                            </div>
                            {shippingMethod === "domicilio" && (
                                <>
                                    <div>
                                        <p>Selecciona un horario:</p>
                                        <p className="text-gray-500 text-sm">
                                            Los pedidos se entregan al día hábil
                                            siguiente. Días de entrega: Lunes a
                                            Sábado. Horarios de entrega: 9:00 am
                                            a 17:00 pm.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 items-center ">
                                        {possibleHours.map((item) => (
                                            <button
                                                onClick={() => {
                                                    setSelectedHour(item.value);
                                                }}
                                                disabled={!session?.user}
                                                key={item.value}
                                                className={`px-3 py-1 border-[1px] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-300/50 disabled:text-gray-400 text-gray-700 hoverEffect font-semibold rounded-md ${selectedHour === item.value ? "border-green-500 bg-green-100" : "bg-gray-100 border-gray-300/50"}`}
                                            >
                                                {item.hour}
                                            </button>
                                        ))}
                                    </div>
                                    {session?.user && (
                                        <>
                                            {clientHasReserved ||
                                            (Array.isArray(reservations) &&
                                                reservations.length >= 2) ? (
                                                <p className="text-red-500">
                                                    Horario no disponible
                                                </p>
                                            ) : (
                                                <p className="text-green-500">
                                                    Horario disponible
                                                </p>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 items-center mb-2">
                                                <label htmlFor="zip-code">
                                                    Ingresa tu Código Postal:
                                                </label>
                                                <input
                                                    id="zip-code"
                                                    value={zipCode}
                                                    onChange={(e) =>
                                                        setZipCode(
                                                            e.target.value
                                                        )
                                                    }
                                                    type="number"
                                                    className="p-2 bg-gray-100 rounded-md border-gray-300/50 border-[1px] outline-none"
                                                    placeholder="Ej. 52793"
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                            {shippingMethod === "pickup" && (
                                <div className="flex flex-col gap-y-3 mb-4">
                                    <p>
                                        Lugar de recolección:
                                        <span className="text-sm text-gray-500 block">
                                            Los pedidos se entregan de de 9:00
                                            am a 17:00 pm. De Lunes a Sábado.
                                        </span>
                                    </p>
                                    <div className="flex items-center gap-x-3">
                                        <button
                                            onClick={() =>
                                                setPickupLocation("Bona")
                                            }
                                            disabled={!session?.user}
                                            className={`border-[1px] font-semibold disabled:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-300/50 px-4 py-3 rounded-md text-gray-700 hoverEffect ${pickupLocation === "Bona" ? "border-green-500 bg-green-100" : "bg-gray-100 border-gray-300/50 hover:bg-gray-200"}`}
                                        >
                                            Plaza Bona
                                        </button>
                                        <button
                                            onClick={() =>
                                                setPickupLocation("Parroquia")
                                            }
                                            disabled={!session?.user}
                                            className={`border-[1px] font-semibold disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-300/50 disabled:bg-gray-100 px-4 py-3 rounded-md text-gray-700 hoverEffect ${pickupLocation === "Parroquia" ? "border-green-500 bg-green-100" : "bg-gray-100 border-gray-300/50 hover:bg-gray-200"}`}
                                        >
                                            Parroquia de San Fernando
                                        </button>
                                    </div>
                                    <div>
                                        <span className="font-bold text-sm">
                                            Dirección:
                                        </span>
                                        {pickupLocation === "Bona" ? (
                                            <p className="text-gray-500 text-sm">
                                                Paleteria “La Parroquia” -
                                                Sucursal Plaza Bona. Av. Jorge
                                                Jiménez Cantú Mz 1 Lt 1, Bosque
                                                Esmeralda, CP 52930, Cdad. López
                                                Mateos, Estado de México.
                                            </p>
                                        ) : (
                                            <p className="text-gray-500 text-sm">
                                                Paleteria “La Parroquia” -
                                                Sucursal San Fernando. Av. Jorge
                                                Jiménez Cantu, Valle Escondido,
                                                Parroquia de San Fernando, CP
                                                52937, Cdad. López Mateos,
                                                Estado de México.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}
                            <Button
                                disabled={
                                    !session?.user ||
                                    (shippingMethod === "domicilio" &&
                                        (clientHasReserved ||
                                            (Array.isArray(reservations) &&
                                                reservations.length >= 2)))
                                }
                                className="py-3 px-8 disabled:bg-primaryRed/40"
                                onClick={handleCheckout}
                            >
                                Proceder al Pago
                            </Button>
                            {!session?.user && (
                                <p className="text-center text-xs font-medium text-red-400 -mt-3">
                                    Por favor inicia sesión para realizar el
                                    pago.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center justify-center py-20"
                >
                    <div className="max-w-[500px] p-4 py-8 bg-white flex flex-col gap-4 items-center rounded-2xl shadow-lg">
                        <h1 className="text-xl font-bold uppercase">
                            Tu carrito está vacío.
                        </h1>
                        <p className="text-sm text-center px-10 -mt-2">
                            Llena tu carrito ahora con las mejores frutas de
                            temporada, verduras y todo lo que puedas llenar tu
                            alacena con productos de la mejor calidad.
                        </p>
                        <Link
                            href={"/"}
                            className="bg-primaryRed text-white hover:bg-red-400 hoverEffect px-8 py-3 rounded-full font-semibold"
                        >
                            Comprar Ahora
                        </Link>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default CartContainer;
