"use client";

import { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import Image from "next/image";
import LogoImage from "../app/assets/logo-frutivida-transparente.png";
import { getBannersData } from "../lib/getData";
import { urlFor } from "../sanity/lib/image";
import { BannerData } from "../../types";
import { motion } from "framer-motion";

const Popup = () => {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [bannerData, setBannerData] = useState<BannerData | null>(null);

    useEffect(() => {
        const hasRunPopup = localStorage.getItem("hasRunPopup");
        const timestamp = localStorage.getItem("timestamp");

        const fetchData = async () => {
            const banners: BannerData[] = await getBannersData();
            const popUpBanner = banners[3];
            setBannerData(popUpBanner);
        };
        fetchData();

        if (!hasRunPopup) {
            new Promise(() => {
                setTimeout(() => {
                    setIsVisible(true);
                    localStorage.setItem("hasRunPopup", "true");
                    localStorage.setItem(
                        "timestamp",
                        new Date().getTime().toString()
                    );
                }, 5000);
            });
        }

        if (hasRunPopup === "true") {
            const now = new Date().getTime();
            const timeDiff = now - parseInt(timestamp || "0");

            if (timeDiff > 2 * 60 * 60 * 1000) {
                localStorage.setItem("hasRunPopup", "false");
            }
        }
    }, []);

    const handleClose = (): void => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300">
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="relative bg-white p-10 rounded-2xl shadow-lg"
            >
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
                    onClick={handleClose}
                    aria-label="Close popup"
                >
                    <IoCloseCircle className="text-3xl hover:text-primaryGold hoverEffect" />
                </button>
                <div className="flex flex-col md:flex-row items-center gap-3 mt-2">
                    <div className="flex items-center flex-col gap-y-3">
                        <Image
                            src={LogoImage}
                            alt="Logo Frutivida Grande"
                            width={200}
                            height={200}
                        />
                        <div>
                            <h2 className="text-3xl text-center font-semibold text-gray-800">
                                {bannerData?.title}🔥
                            </h2>
                            <p className="text-gray-600 text-center">
                                {bannerData?.subtitle}{" "}
                                <span className="font-bold">
                                    ${bannerData?.price} MXN.
                                </span>
                            </p>
                        </div>
                    </div>
                    <Image
                        src={urlFor(
                            bannerData?.image ? bannerData?.image : ""
                        ).url()}
                        alt="Repartidor con frutas y verduras"
                        width={300}
                        height={300}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default Popup;
