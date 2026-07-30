"use client";

import { useState } from "react";
import { FaFilter } from "react-icons/fa6";
import SidebarProducts from "./SidebarProducts";
import { PiXCircleDuotone } from "react-icons/pi";

const SidebarExpanded = () => {
    const [expanded, setExpanded] = useState<boolean>(false);

    const handleExpansion = () => {
        setExpanded(!expanded);
    };

    return (
        <div className="relative">
            <div className="flex justify-end">
                <button
                    onClick={handleExpansion}
                    className="lg:hidden flex gap-x-2 items-center p-2 text-gray-600 hover:text-primaryGold bg-gray-100 border-gray-300/50 border-[1px] rounded-md hover:bg-primaryGold/10 hover:border-primaryGold hoverEffect mt-4"
                >
                    <FaFilter className="text-2xl" />
                    <span className="text-sm">Filtros</span>
                </button>
            </div>
            <div
                className={`lg:translate-x-0 absolute lg:relative top-0 transition-transform duration-300 ease-in-out z-20 ${expanded ? "translate-x-0" : "-translate-x-[340px]"}`}
            >
                <SidebarProducts />
                <button
                    onClick={handleExpansion}
                    className="absolute top-6 block lg:hidden right-6 text-gray-500 hover:text-primaryGold hoverEffect"
                >
                    <PiXCircleDuotone className="text-3xl" />
                </button>
            </div>
        </div>
    );
};

export default SidebarExpanded;
