import Link from "next/link";
import { IoReturnDownBack } from "react-icons/io5";
import Logo from "./Logo";

// @ts-expect-error: Component props are not strictly typed
const StudioHeader = (props) => {
    return (
        <div>
            <div className="p-5 bg-primaryDark text-primaryGold flex items-center justify-between">
                <Link
                    href={"/"}
                    className="flex items-center gap-3 font-semibold hover:text-white hoverEffect"
                >
                    <IoReturnDownBack className="text-2xl" /> Regresar a Inicio
                </Link>
                <Logo />
                <p className="hidden md:inline-flex text-sm">
                    Admin Studio para FRUTIVIDA E-Commerce
                </p>
            </div>
            {props.renderDefault(props)}
        </div>
    );
};

export default StudioHeader;
