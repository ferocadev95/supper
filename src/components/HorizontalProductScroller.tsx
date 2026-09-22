"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { ProductData } from "../../types";
import { CategoryProductsResponse } from "../lib/categoryRows";
import ProductCard from "./ProductCard";

interface Props {
    categoria: string;
    initialProducts: ProductData[];
    initialHasMore: boolean;
}

const HorizontalProductScroller = ({
    categoria,
    initialProducts,
    initialHasMore,
}: Props) => {
    const [products, setProducts] = useState<ProductData[]>(initialProducts);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoading, setIsLoading] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const trackRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    const offsetRef = useRef(initialProducts.length);

    const updateArrows = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;
        const maxScroll = track.scrollWidth - track.clientWidth;
        setCanScrollLeft(track.scrollLeft > 8);
        setCanScrollRight(track.scrollLeft < maxScroll - 8);
    }, []);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        updateArrows();
        track.addEventListener("scroll", updateArrows, { passive: true });

        const resizeObserver = new ResizeObserver(updateArrows);
        resizeObserver.observe(track);

        return () => {
            track.removeEventListener("scroll", updateArrows);
            resizeObserver.disconnect();
        };
    }, [updateArrows, products.length]);

    useEffect(() => {
        const track = trackRef.current;
        const sentinel = sentinelRef.current;
        if (!track || !sentinel || !hasMore) return;

        const controller = new AbortController();

        const loadMore = async () => {
            if (loadingRef.current) return;
            loadingRef.current = true;
            setIsLoading(true);

            try {
                const response = await fetch(
                    `/api/category-products?categoria=${encodeURIComponent(
                        categoria
                    )}&offset=${offsetRef.current}`,
                    { signal: controller.signal }
                );
                if (!response.ok) throw new Error("request failed");

                const data: CategoryProductsResponse = await response.json();

                offsetRef.current += data.products.length;
                setProducts((previous) => [...previous, ...data.products]);
                setHasMore(data.hasMore && data.products.length > 0);
            } catch (error) {
                if ((error as Error)?.name !== "AbortError") {
                    setHasMore(false);
                }
            } finally {
                loadingRef.current = false;
                setIsLoading(false);
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) loadMore();
            },
            { root: track, rootMargin: "0px 400px 0px 0px" }
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
            controller.abort();
        };
    }, [categoria, hasMore]);

    const scrollByPage = (direction: 1 | -1) => {
        const track = trackRef.current;
        if (!track) return;
        track.scrollBy({
            left: direction * track.clientWidth * 0.9,
            behavior: "smooth",
        });
    };

    return (
        <div className="relative">
            <div
                ref={trackRef}
                className="flex gap-5 overflow-x-auto snap-x scroll-smooth pb-2 no-scrollbar"
            >
                {products.map((item) => (
                    <div
                        key={item?._id}
                        className="basis-[80%] sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-3.75rem)/4)] shrink-0 grow-0 snap-start"
                    >
                        <ProductCard item={item} />
                    </div>
                ))}

                {hasMore && (
                    <div
                        ref={sentinelRef}
                        aria-hidden="true"
                        className="basis-[80%] sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-3.75rem)/4)] shrink-0 grow-0 flex items-center justify-center"
                    >
                        {isLoading && (
                            <svg
                                className="animate-spin text-primaryGreen"
                                viewBox="0 0 24 24"
                                fill="none"
                                width={28}
                                height={28}
                                role="status"
                                aria-label="Cargando más productos"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        )}
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={() => scrollByPage(-1)}
                disabled={!canScrollLeft}
                aria-label="Ver productos anteriores"
                className="flex absolute top-1/2 -translate-y-1/2 z-10 items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white text-primaryGreenDark shadow-md border border-gray-300/50 hoverEffect enabled:hover:bg-primaryGreen enabled:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed left-1"
            >
                <FaChevronLeft />
            </button>

            <button
                type="button"
                onClick={() => scrollByPage(1)}
                disabled={!canScrollRight}
                aria-label="Ver más productos"
                className="flex absolute top-1/2 -translate-y-1/2 z-10 items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white text-primaryGreenDark shadow-md border border-gray-300/50 hoverEffect enabled:hover:bg-primaryGreen enabled:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed right-1"
            >
                <FaChevronRight />
            </button>
        </div>
    );
};

export default HorizontalProductScroller;
