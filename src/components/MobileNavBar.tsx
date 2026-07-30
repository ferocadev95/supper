import { useState } from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import { navBarList } from "../constants";
import Link from "next/link";
import { MdAccountCircle } from "react-icons/md";
import SearchInput from "./SearchInput";
import { Session } from "next-auth";

interface Props {
  session?: Session;
}

const MobileNavBar = ({ session }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <header>
      <div className="container mx-auto flex justify-between items-center">
        <button
          className="text-2xl md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          <HiMenuAlt2 className="text-2xl hover:text-primaryGold hoverEffect" />
        </button>
        <nav
          className={`absolute top-24 left-0 w-full bg-white border-y-[1px] border-gray-300/50 p-4 transition-all duration-300 transform ${
            menuOpen ? "block" : "hidden"
          }`}
        >
          <div className="space-y-3 flex flex-col">
            {navBarList.map((navBarItem) => (
              <Link
                key={navBarItem.title}
                className="navBarItemMobile"
                href={navBarItem.link}
                onClick={toggleMenu}
              >
                {navBarItem.title}
              </Link>
            ))}
          </div>
          <div className="flex flex-col mt-5 gap-y-4">
            {session?.user ? (
              <Link
                href={"/perfil"}
                className="navBarItemMobile flex items-center gap-x-2"
                onClick={toggleMenu}
              >
                <MdAccountCircle className="text-2xl" />
                Mi perfil
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="navBarItemMobile flex items-center gap-x-2"
                onClick={toggleMenu}
              >
                <MdAccountCircle className="text-2xl" />
                Iniciar Sesión
              </Link>
            )}
            {session?.user && (
              <Link
                href="/pedidos"
                className="navBarItem inline-flex border-[1px] px-2 py-2 rounded-md border-gray-300 hover:text-white hover:bg-primaryGreen"
                onClick={toggleMenu}
              >
                Mis Pedidos
              </Link>
            )}
            <SearchInput />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default MobileNavBar;
