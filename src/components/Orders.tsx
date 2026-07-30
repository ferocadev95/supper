"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { collection, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../firebase";
import { ProductData } from "../../types";
import {
  Badge,
  Card,
  CardConent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui";
import FormattedPrice from "./FormattedPrice";
import Button from "./Button";
import { AnimatePresence, motion } from "framer-motion";
// import { useDispatch } from "react-redux";
// import { addToCartBatch } from "../lib/redux/features/cart/cartSlice";
// import toast from "react-hot-toast";

interface Order {
  id: string;
  value: {
    amount: number;
    items: ProductData[];
    shipping: number;
  };
}

const Orders = () => {
  const { data: session } = useSession();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleDetails = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const [ordersSnapshot, loading] = useCollection(
    session &&
      query(
        collection(db, "usersInfo", session?.user?.email as string, "orders"),
      ),
  );

  const orders = ordersSnapshot?.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];

  // const dispatch = useDispatch();
  //
  // const handleAddToCart = (cartItems: ProductData[]) => {
  //   dispatch(addToCartBatch(cartItems));
  //   toast.success("Pedido agregado al carrito");
  // };

  return (
    <div className="flex flex-col gap-y-5 mt-5">
      {loading ? (
        <div className="flex flex-col flex-1 space-y-6 overflow-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-full py-20 rounded-md shrink-0 animate-pulse bg-zinc-400"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {orders?.length ? (
            orders?.map((item) => (
              <div key={item?.id}>
                <Card
                  className={
                    expandedOrderId === item.id ? "border-primaryGold/30" : ""
                  }
                >
                  <CardHeader>
                    <CardTitle>
                      ID del Pedido:{" "}
                      <span className="text-base tracking-wide">
                        {item?.id.slice(-10)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardConent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-black/60">
                          Monto Total
                        </p>

                        <FormattedPrice
                          amount={item?.value?.amount}
                          className="text-lg font-semibold"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black/60">
                          Estatus de Pago
                        </p>
                        <Badge variant="success">Pagado</Badge>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={() => toggleDetails(item.id)}
                          className="md:max-w-52"
                        >
                          {expandedOrderId === item.id
                            ? "Esconder detalles"
                            : "Mostrar detalles"}
                        </Button>
                      </div>
                      {/* <Button onClick={() => handleAddToCart(item.value.items)}> */}
                      {/*   Agregar artículos al carrito */}
                      {/* </Button> */}
                    </div>
                  </CardConent>
                  <AnimatePresence>
                    {expandedOrderId === item?.id && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                        }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="border-0 border-t rounded-none">
                          <CardHeader>
                            <CardTitle>Productos</CardTitle>
                          </CardHeader>
                          <CardConent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nombre</TableHead>
                                  <TableHead className="text-center">
                                    Precio
                                  </TableHead>
                                  <TableHead>Cantidad</TableHead>
                                  <TableHead className="text-right">
                                    Subtotal
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {item?.value?.items?.map(
                                  (product: ProductData) => (
                                    <TableRow key={product?._id}>
                                      <TableCell>{product?.title}</TableCell>
                                      <TableCell className="text-center">
                                        {product?.productType === "kg" && (
                                          <FormattedPrice
                                            amount={
                                              product?.kgPrice -
                                              (product?.rowprice || 0)
                                            }
                                          />
                                        )}
                                        {product?.productType === "p" && (
                                          <FormattedPrice
                                            amount={
                                              product?.pPrice -
                                              (product?.rowprice || 0)
                                            }
                                          />
                                        )}
                                        {product?.productType === "m-kg" && (
                                          <FormattedPrice
                                            amount={
                                              product?.kgPrice -
                                              (product?.rowprice || 0)
                                            }
                                          />
                                        )}
                                        {product?.productType === "100g" && (
                                          <FormattedPrice
                                            amount={
                                              product?.gramsPrice -
                                              (product?.rowprice || 0)
                                            }
                                          />
                                        )}
                                      </TableCell>
                                      <TableCell className="text-lg">
                                        <div className="flex flex-col gap-1">
                                          {product?.productType === "m-kg" && (
                                            <>
                                              <span className="text-sm">
                                                Kg Maduro:{" "}
                                                {product?.matureQuantity || 0}
                                              </span>
                                              <span className="text-sm">
                                                Kg Verde:{" "}
                                                {product?.greenQuantity || 0}
                                              </span>
                                            </>
                                          )}
                                          {product?.productType === "kg" && (
                                            <span className="text-sm">
                                              Kg: {product?.kgQuantity || 0}
                                            </span>
                                          )}
                                          {product?.productType === "p" && (
                                            <span className="text-sm">
                                              Piezas: {product?.quantity || 0}
                                            </span>
                                          )}
                                          {product?.productType === "100g" && (
                                            <span className="text-sm">
                                              Kg: {product?.kgQuantity || 0}
                                            </span>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right font-semibold">
                                        {product?.productType === "kg" && (
                                          <FormattedPrice
                                            amount={
                                              (product?.kgPrice -
                                                (product?.rowprice || 0)) *
                                              product?.kgQuantity
                                            }
                                          />
                                        )}
                                        {product?.productType === "p" && (
                                          <FormattedPrice
                                            amount={
                                              (product?.pPrice -
                                                (product?.rowprice || 0)) *
                                              product?.quantity
                                            }
                                          />
                                        )}
                                        {product?.productType === "m-kg" && (
                                          <FormattedPrice
                                            amount={
                                              (product?.matureQuantity || 0) *
                                                (product?.kgPrice -
                                                  (product?.rowprice || 0)) +
                                              (product?.greenQuantity || 0) *
                                                (product?.kgPrice -
                                                  (product?.rowprice || 0))
                                            }
                                          />
                                        )}
                                        {product?.productType === "100g" && (
                                          <FormattedPrice
                                            amount={
                                              (product?.gramsPrice * 10 -
                                                (product?.rowprice || 0)) *
                                              product?.kgQuantity
                                            }
                                          />
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ),
                                )}
                              </TableBody>
                            </Table>
                          </CardConent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>
            ))
          ) : (
            <div>
              <p className="text-lg font-medium -mt-3">
                Todavía no has realizado ningún pedido.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
