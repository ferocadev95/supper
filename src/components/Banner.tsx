import { getBannersData } from "../lib/getData";
import Image from "next/image";
import { urlFor } from "../sanity/lib/image";
import FormattedPrice from "./FormattedPrice";
import { BannerData } from "../../types";
import Link from "next/link";

const Banner = async () => {
    const banners: BannerData[] = await getBannersData();
    const firstBanner = banners[0];
    const secondBanner = banners[1];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 md:max-h-[500px]">
            {/* Left Half - single image */}
            <div className="bg-gray-100 relative flex-col md:flex-row flex items-end justify-center rounded-2xl overflow-hidden group md:col-span-2">
                <div className="h-full w-full z-10 relative left-10 top-0 flex flex-col justify-center gap-3 isolate md:gap-5">
                    <div className="flex mt-8 lg:mt-0 flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <span className="text-gray-600">Desde</span>
                            <div className="bg-primaryGreenDark text-white rounded-full w-20 py-1 text-sm font-semibold">
                                <FormattedPrice
                                    amount={firstBanner?.price}
                                    className="text-center text-sm"
                                />
                            </div>
                            <span className="text-gray-600 text-sm">MXN</span>
                        </div>
                        <p className="text-2xl md:text-3xl text-black/90 font-semibold">
                            {firstBanner?.title}
                        </p>
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                            {firstBanner?.subtitle}
                        </h2>
                        <p className="text-sm text-black/60 max-w-44 sm:max-w-full font-medium">
                            {firstBanner?.description}
                        </p>
                    </div>
                    <Link
                        href={"/productos"}
                        className="btn-primary mb-0 md:mb-8 lg:mb-0 rounded-full md:px-8 px-4 w-44 py-2.5 text-sm"
                    >
                        Comprar Ahora
                    </Link>
                </div>
                <Image
                    src={urlFor(firstBanner?.image).url()}
                    alt={firstBanner?.title}
                    width={400}
                    height={400}
                    priority
                    className="object-contain p-4 h-82 md:h-[300px] lg:h-full max-h-[500px] self-end group-hover:scale-105 hoverEffect"
                />
            </div>
            {/* Right Half - single image */}
            <div className="flex flex-col space-y-3 md:space-y-5 h-auto md:max-h-[500px] group relative bg-gradient-to-br from-primaryGreen to-primaryGreenDark rounded-2xl">
                <div className="h-full overflow-hidden flex justify-center items-start p-10 sm:p-5">
                    <div className="w-full absolute left-10 z-10">
                        <div className="w-1/2 flex flex-col">
                            <p className="text-white/90 md:text-2xl text-xl font-semibold">
                                {secondBanner?.title}
                            </p>
                            <p className="text-2xl md:text-3xl font-bold text-white">
                                {secondBanner?.subtitle}
                            </p>
                        </div>
                        <p className="text-white/70 my-3 max-w-32 font-medium">
                            Desde{" "}
                            <FormattedPrice
                                amount={secondBanner?.price}
                                className="text-primaryGold font-bold"
                            />
                        </p>
                        <Link
                            href={"/producto/manzana-roja"}
                            className="rounded-full px-4 py-1 text-sm w-fit bg-white text-primaryGreenDark font-semibold hover:bg-white/90 hoverEffect"
                        >
                            Ver Ahora
                        </Link>
                    </div>
                    <div className="flex justify-end h-full w-full">
                        <Image
                            src={urlFor(secondBanner?.image).url()}
                            alt={secondBanner?.title}
                            width={500}
                            height={500}
                            priority
                            className="object-contain h-52 w-1/2 md:w-52 max-h-[500px] self-end group-hover:scale-105 hoverEffect "
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;
