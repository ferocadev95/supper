"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const categoryFilter = {
  name: "Categorías",
  options: [
    { value: "frutas-y-verduras", label: "Frutas y Verduras" },
    {
      value: "abarrotes",
      label: "Abarrotes",
    },
    {
      value: "condimentos-y-especias",
      label: "Condimentos y Especias",
    },
    { value: "frutos-secos-y-varios", label: "Frutos Secos y Varios" },
    {
      value: "granos-y-semillas",
      label: "Granos y Semillas",
    },
    { value: "chiles-secos", label: "Chiles Secos" },
    { value: "huevo", label: "Huevo" },
  ],
};

const brandFilter = {
  name: "Marcas",
  options: [
    { value: "mrlucky", label: "Mr. Lucky" },
    { value: "generico", label: "Genérico" },
    { value: "variado", label: "Variado" },
    { value: "bimbo", label: "Bimbo" },
    { value: "la parroquia", label: "La Parroquia" },
    { value: "pronto", label: "Pronto" },
    { value: "verde valle", label: "Verde Valle" },
    { value: "la fina", label: "La Fina" },
    { value: "knorr", label: "Knorr" },
    { value: "clemente jacques", label: "Clemente Jacques" },
    { value: "san juan", label: "San Juan" },
    { value: "la moderna", label: "La Moderna" },
  ],
};

const otherFilter = {
  name: "Otros",
  options: [
    { value: "ofertas", label: "Ofertas" },
    { value: "mas-vendidos", label: "Más Vendidos" },
  ],
};

// interface FilterState {
//     category: string;
//     brand: string;
//     bestSeller: boolean;
//     offers: boolean;
// }

const SidebarProducts = () => {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedBestSeller, setSelectedBestSeller] = useState<boolean>(false);
  const [selectedOffers, setSelectedOffers] = useState<boolean>(false);
  // const [filters, setFilters] = useState<FilterState>({
  //     category: "",
  //     brand: "",
  //     bestSeller: false,
  //     offers: false,
  // });
  const router = useRouter();

  const handleCategoryChange = (category: string) => {
    const newCategory = category === selectedCategory ? "" : category;
    setSelectedCategory(newCategory);

    const params = new URLSearchParams(searchParams);
    if (newCategory === "") {
      params.delete("categoria");
      params.delete("page");
      router.replace(`/productos?${params}`);
    } else {
      params.delete("page");
      params.set("categoria", category);
      router.replace(`/productos?${params.toString()}`);
    }
  };

  const handleBrandChange = (brand: string) => {
    const newBrand = brand === selectedBrand ? "" : brand;
    setSelectedBrand(newBrand);

    const params = new URLSearchParams(searchParams);

    if (newBrand === "") {
      params.delete("marca");
      params.delete("page");
      router.replace(`/productos?${params}`);
    } else {
      params.delete("page");
      params.set("marca", brand);
      router.replace(`/productos?${params.toString()}`);
    }
  };

  const handleBestSellerChange = (bestseller: boolean) => {
    const newBestSeller = !bestseller;
    setSelectedBestSeller(newBestSeller);

    const params = new URLSearchParams(searchParams);

    if (!newBestSeller) {
      params.delete("masVendido");
      params.delete("page");
      router.replace(`/productos?${params}`);
    } else {
      params.delete("page");
      params.set("masVendido", "true");
      router.replace(`/productos?${params.toString()}`);
    }
  };

  const handleOffersChange = (offers: boolean) => {
    const newOffer = !offers;
    setSelectedOffers(newOffer);

    const params = new URLSearchParams(searchParams);

    if (!newOffer) {
      params.delete("ofertas");
      params.delete("page");
      router.replace(`/productos?${params}`);
    } else {
      params.delete("page");
      params.set("ofertas", "true");
      router.replace(`/productos?${params.toString()}`);
    }
  };

  useEffect(() => {
    const categoryParam = searchParams.get("categoria");
    const brandParam = searchParams.get("marca");
    const bestSellerParam = searchParams.has("mas-vendido");
    const offerParam = searchParams.has("ofertas");

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else if (brandParam) {
      setSelectedBrand(brandParam);
    } else if (bestSellerParam) {
      setSelectedBestSeller(bestSellerParam);
    } else if (offerParam) {
      setSelectedOffers(offerParam);
    }
  }, [searchParams]);

  return (
    <aside className="w-80 bg-white py-10 px-6 min-h-screen h-full overflow-y-auto shadow-xl lg:shadow-none border-t-0 lg:border-r-[1px] border-gray-300/50">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Filtros</h2>

      {/* Categorias */}
      <div className="mb-8">
        <h3 className="font-semibold mb-4 text-gray-700">
          {categoryFilter.name}
        </h3>
        <ul>
          {categoryFilter.options.map((category) => (
            <li key={category.value} className="mb-2">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primaryGreen rounded focus:ring-primaryGreen border-gray-300 hoverEffect"
                  value={category.value}
                  checked={category.value === selectedCategory}
                  onChange={() => handleCategoryChange(category.value)}
                />
                <span className="ml-3 text-gray-700 group-hover:text-primaryGreen hoverEffect">
                  {category.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Marca */}
      <div className="mb-8">
        <h3 className="font-semibold mb-4 text-gray-700">{brandFilter.name}</h3>
        <ul>
          {brandFilter.options.map((brand) => (
            <li key={brand.value} className="mb-2">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  value={brand.value}
                  checked={brand.value === selectedBrand}
                  onChange={() => handleBrandChange(brand.value)}
                  className="form-checkbox h-5 w-5 text-primaryGreen rounded focus:ring-primaryGreen border-gray-300 hoverEffect"
                />
                <span className="ml-3 text-gray-700 group-hover:text-primaryGreen hoverEffect">
                  {brand.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Otros */}
      <div>
        <h3 className="font-semibold mb-4 text-gray-700">{otherFilter.name}</h3>
        <ul>
          <li className="mb-2">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedOffers}
                onChange={() => {
                  handleOffersChange(selectedOffers);
                }}
                className="form-checkbox h-5 w-5 text-primaryGreen rounded focus:ring-primaryGreen border-gray-300 hoverEffect"
              />
              <span className="ml-3 text-gray-700 group-hover:text-primaryGreen transition duration-150 ease-in-out">
                {otherFilter.options[0].label}
              </span>
            </label>
          </li>
          <li className="mb-2">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBestSeller}
                onChange={() => {
                  handleBestSellerChange(selectedBestSeller);
                }}
                className="form-checkbox h-5 w-5 text-primaryGreen rounded focus:ring-primaryGreen border-gray-300 hoverEffect"
              />
              <span className="ml-3 text-gray-700 group-hover:text-primaryGreen transition duration-150 ease-in-out">
                {otherFilter.options[1].label}
              </span>
            </label>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default SidebarProducts;
