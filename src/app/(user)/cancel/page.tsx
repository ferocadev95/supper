import Container from "../../../components/Container";
import Link from "next/link";
import { IoCloseCircle } from "react-icons/io5";

const CancelledPage = () => {
    return (
        <Container className="py-10 min-h-[70vh]">
            <div className="flex items-center flex-col justify-center gap-5">
                <IoCloseCircle className="w-36 h-36 text-red-600" />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Pago Interrumpido
                </h1>
                <p className="text-lg font-medium text-black/80">
                    Tu proceso de pago ha sido interrumpido.
                </p>
                <Link
                    href={"/"}
                    className="btn-secondary px-4 md:px-8 py-2 md:py-3 rounded-full"
                >
                    Regresar a Inicio
                </Link>
            </div>
        </Container>
    );
};

export default CancelledPage;
