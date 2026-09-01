"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES, SIDEBAR_BRANDS } from "../constants";

const categoryFilter = {
  name: "Categorías",
  options: PRODUCT_CATEGORIES,
};

const brandFilter = {
  name: "Marcas",
  options: SIDEBAR_BRANDS,
};

const otherFilter = {
  name: "Otros",
  options: [
    { value: "ofertas", label: "Ofertas" },
    { value: "mas-vendidos", label: "Más Vendidos" },
  ],
};

const SidebarProducts = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // La URL es la única fuente de verdad: el estado se deriva de ella en cada
  // render. Duplicarlo en useState obligaba a un efecto de sincronización que
  // solo reflejaba un filtro a la vez y nunca reseteaba los checkboxes al
  // navegar hacia atrás.
  const selectedCategory = searchParams.get("categoria") ?? "";
  const selectedBrand = searchParams.get("marca") ?? "";
  const selectedBestSeller = searchParams.has("masVendido");
  const selectedOffers = searchParams.has("ofertas");

  const handleCategoryChange = (category: string) => {
    const newCategory = category === selectedCategory ? "" : category;

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
