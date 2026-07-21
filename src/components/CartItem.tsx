import { ImCross } from "react-icons/im";
import { ProductData } from "../../types";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "../sanity/lib/image";
import { useDispatch } from "react-redux";
import { removeFromCart } from "../lib/redux/features/cart/cartSlice";
import toast from "react-hot-toast";
import FormattedPrice from "./FormattedPrice";
import AddQtyToCartButton from "./AddQtyToCartButton";
import { PriceFields, computeLineSubtotal } from "../lib/pricing";

interface Props {
    cart: ProductData[];
    item: ProductData;
    // Canonical (fresh from Sanity) price fields for this line. Falls back to the
    // item's own stored fields while the fresh price is still loading.
    price?: PriceFields;
}

// Per-unit price shown in the "Precio" column, sourced from canonical prices.
const unitPrice = (price: PriceFields): number => {
    const rowprice = price.rowprice || 0;
    switch (price.productType) {
        case "p":
            return price.pPrice - rowprice;
        case "100g":
            return price.gramsPrice - rowprice;
        case "kg":
        case "m-kg":
        default:
            return price.kgPrice - rowprice;
    }
};

const CartItem = ({ item, price }: Props) => {
    const dispatch = useDispatch();
    const effectivePrice: PriceFields = price ?? item;

    return (
        <div className="w-full grid grid-cols-5 mb-4 border border-gray-200 py-2">
            <div className="flex col-span-5 md:col-span-2 items-center gap-4 ml-4">
                <ImCross
                    onClick={() => {
                        dispatch(removeFromCart(item?._id));
                        toast.success(
                            `${item?.title.substring(0, 12)}... eliminado del carrito`
                        );
                    }}
                    className="text-black hover:text-red-600 cursor-pointer hoverEffect"
                />
                <Link href={`/producto/${item?.slug.current}`}>
                    <Image
                        src={urlFor(item?.image).url()}
                        alt={item?.title}
                        width={200}
                        height={200}
                        className="w-32 object-contain"
                    />
                </Link>
                <h1 className="font-semibold">{`${item?.title.substring(0, 20)}`}</h1>
            </div>
            <div className="flex col-span-5 md:col-span-3 items-center justify-between py-4 md:py-0 px-4 lg:px-0">
                <p className="flex w-1/3 items-center text-lg font-semibold">
                    <FormattedPrice amount={unitPrice(effectivePrice)} />
                </p>
                <div className="w-1/3 flex items-center gap-6 text-lg">
                    {item?.productType === "p" && (
                        <>
                            <AddQtyToCartButton item={item} />
                        </>
                    )}
                    {item?.productType === "m-kg" && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-semibold">
                                <span>Maduro: </span>
                                {item?.matureQuantity
                                    ? item.matureQuantity
                                    : 0}{" "}
                                Kg
                            </p>
                            <p className="text-sm font-semibold">
                                <span>Verde: </span>
                                {item?.greenQuantity
                                    ? item.greenQuantity
                                    : 0}{" "}
                                Kg
                            </p>
                        </div>
                    )}
                    {item?.productType === "100g" && (
                        <p className="text-sm font-semibold">
                            {item?.kgQuantity} Kg
                        </p>
                    )}
                    {item?.productType === "kg" && (
                        <p className="text-sm font-semibold">
                            {item?.kgQuantity} kg
                        </p>
                    )}
                </div>
                <div className="w-1/3 flex items-center font-bold text-lg">
                    <FormattedPrice
                        amount={computeLineSubtotal(effectivePrice, item)}
                    />
                </div>
            </div>
        </div>
    );
};

export default CartItem;
