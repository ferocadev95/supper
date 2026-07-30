import { footerData } from "../constants";
import Container from "./Container";
import Link from "next/link";
import Logo from "./Logo";
import Image from "next/image";
import visa from "../app/assets/visa.png";
import amex from "../app/assets/amex.png";
import mastercard from "../app/assets/mastercard.png";

const Footer = () => {
    return (
        <footer className="bg-gray-50 py-5">
            <Container className="py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="flex flex-col gap-y-4">
                    <Logo />
                    <p className="text-gray-600 max-w-[260px]">
                        Productos frescos y de alta calidad a un click de
                        distancia.
                    </p>
                </div>
                {footerData?.map((item) => (
                    <div key={item?._id}>
                        <h3 className="text-primaryGreen/90 text-lg font-semibold mb-3">
                            {item?.title}
                        </h3>
                        <div className="flex flex-col gap-1">
                            {item?.listItem?.map((list) =>
                                list?.listData?.map((data) => (
                                    <Link
                                        href={data.link}
                                        key={data.name}
                                        className="py-1 text-black font-medium hover:text-primaryGold hoverEffect"
                                    >
                                        {data.name}
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </Container>
            <div className="border-t px-4 border-gray-300/50 w-full max-w-screen-xl mx-auto pt-4 flex items-center justify-between">
                <div className="flex items-center gap-x-1">
                    <span className="w-[36px]">
                        <Image src={visa} alt="visa" width={100} height={100} />
                    </span>
                    <span className="w-[36px]">
                        <Image
                            src={mastercard}
                            alt="mastercard"
                            width={100}
                            height={100}
                        />
                    </span>
                    <span className="w-[36px]">
                        <Image src={amex} alt="amex" width={100} height={100} />
                    </span>
                </div>
                <span className="text-gray-600 text-sm tracking-wide">
                    © Copyright 2024 Frutivida, Todos los derechos reservados
                </span>
            </div>
        </footer>
    );
};

export default Footer;
