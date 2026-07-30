import { FaWallet } from "react-icons/fa6";
import { GoRocket } from "react-icons/go";
import { PiChats } from "react-icons/pi";
import { SiCodefresh } from "react-icons/si";

export const featuresData = [
    {
        title: "Envío Gratis",
        description: "En compras mayores a $300 MXN",
        icon: <GoRocket />,
    },
    {
        title: "Productos Frescos",
        description: "Frescura y la mejor calidad",
        icon: <SiCodefresh />,
    },
    {
        title: "Pagos Seguros",
        description: "100% pagos seguros en línea",
        icon: <FaWallet />,
    },
    {
        title: "Atención a Cliente",
        description: "Atendemos cualquier duda que tengas",
        icon: <PiChats />,
    },
];

const Features = () => {
    return (
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {featuresData.map((feature) => (
                <div
                    key={feature?.title}
                    className="flex flex-col sm:flex-row items-center gap-3"
                >
                    <span className="text-3xl text-primaryGold">
                        {feature?.icon}
                    </span>
                    <div className="text-center sm:text-left">
                        <h2 className="uppercase font-bold">
                            {feature?.title}
                        </h2>
                        <p className="text-sm text-black/60">
                            {feature?.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Features;
