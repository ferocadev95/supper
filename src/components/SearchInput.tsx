"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CiSearch } from "react-icons/ci";

const SearchInput = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultSearchQuery = searchParams.get("search") ?? "";

    const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchQuery = formData.get("search");
        router.replace(`/productos?search=${searchQuery}`);
    };

    return (
        <div className="flex-1 inline-flex h-12 relative min-w-[300px]">
            <CiSearch className="text-lg absolute left-2.5 mt-3.5 text-primaryGold" />
            <form onSubmit={onSubmit} className="flex items-center w-full">
                <input
                    type="search"
                    name="search"
                    id="search"
                    autoComplete="off"
                    placeholder="Buscar productos..."
                    className="pl-8 pr-8 w-full border-black/30 border-[1px] py-3 rounded-full outline-none"
                    defaultValue={defaultSearchQuery}
                />
                <button
                    type="submit"
                    className="btn-primary absolute right-0 px-3.5 py-1.5 mr-1.5 text-sm font-medium top-2 rounded-full"
                >
                    Buscar
                </button>
            </form>
        </div>
    );
};

export default SearchInput;
