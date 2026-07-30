"use client";

import { navBarList } from "../constants";
import Container from "./Container";
import Logo from "./Logo";
import SearchInput from "./SearchInput";
import Link from "next/link";
import { FaCartShopping } from "react-icons/fa6";
import { MdAccountCircle } from "react-icons/md";
import { useSelector } from "react-redux";
import { StoreState } from "../../types";
import { useSession } from "next-auth/react";
import MobileNavBar from "./MobileNavBar";

const Header = () => {
  const { cartItems } = useSelector((state: StoreState) => state?.cart);
  const { data: session } = useSession();

  return (
    <header className="w-full py-5 bg-white border-b-[1px] border-b-gray-300/50 sticky top-0 z-50">
      <Container className="h-full flex flex-wrap items-center justify-center xl:justify-normal gap-5">
        <Logo />
        <div className="hidden md:inline-flex items-center flex-wrap justify-center gap-5">
          {navBarList?.map((item) => (
            <nav key={item.title} className="relative group">
              <Link href={item.link} className="navBarItem font-medium">
                {item?.title}
              </Link>
            </nav>
          ))}
        </div>
        <div className="flex gap-5 lg:gap-7 flex-1">
          <div className="hidden w-full md:inline-flex">
            <SearchInput />
          </div>
          <div className="hidden md:inline-flex items-center gap-5 overflow-visible">
            <Link href="/carrito" className="relative">
              <FaCartShopping className="text-2xl" />
              <span className="absolute -top-2 -right-2 bg-primaryGold text-primaryDark text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartItems ? cartItems?.length : 0}
              </span>
            </Link>
            {session?.user ? (
              <Link
                href={"/perfil"}
                className="flex items-center gap-x-1 hover:text-primaryGold hoverEffect"
              >
                <MdAccountCircle className="text-2xl" />
                <span className="text-sm">Perfil</span>
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center text-gray-700 gap-x-1 hover:border-primaryGreen font-semibold text-sm px-3 py-2 border-[1px] border-gray-300/50 rounded-md bg-white hover:bg-primaryGreen hover:text-white hoverEffect"
              >
                <span>Iniciar</span>
                <span>Sesión</span>
              </Link>
            )}
          </div>
        </div>
        {session?.user && (
          <Link
            href="/pedidos"
            className="navBarItem hidden md:inline-flex border-[1px] px-2 py-2 rounded-md border-gray-300 hover:text-white hover:bg-primaryGreen"
          >
            Mis Pedidos
          </Link>
        )}
        <div className="inline-flex gap-x-4 md:hidden">
          <Link href="/carrito" className="relative">
            <FaCartShopping className="text-2xl" />
            <span className="absolute -top-2 -right-2 bg-primaryGold text-primaryDark text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cartItems ? cartItems?.length : 0}
            </span>
          </Link>
          <MobileNavBar session={session ? session : undefined} />
        </div>
      </Container>
    </header>
  );
};

export default Header;
