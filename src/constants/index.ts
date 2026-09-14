// Fuente única de las categorías y marcas de producto. La consumen el schema
// de Sanity (src/sanity/schemas/products.ts), los filtros del sidebar
// (src/components/SidebarProducts.tsx) y el buscador (src/lib/search.ts).
export const PRODUCT_CATEGORIES = [
  { value: "frutas-y-verduras", label: "Frutas y Verduras" },
  { value: "abarrotes", label: "Abarrotes" },
  { value: "condimentos-y-especias", label: "Condimentos y Especias" },
  { value: "frutos-secos-y-varios", label: "Frutos Secos y Varios" },
  { value: "granos-y-semillas", label: "Granos y Semillas" },
  { value: "chiles-secos", label: "Chiles Secos" },
  { value: "huevo", label: "Huevo" },
];

// Orden tomado del sidebar para que su UI no cambie. "natural" va al final
// porque nunca se ofreció como filtro; sí existe en Sanity, así que la lista
// completa es la que alimenta el schema.
export const PRODUCT_BRANDS = [
  { value: "mrlucky", label: "Mr. Lucky" },
  { value: "generico", label: "Genérico" },
  { value: "variado", label: "Variado" },
  { value: "bimbo", label: "Bimbo" },
  { value: "pronto", label: "Pronto" },
  { value: "verde valle", label: "Verde Valle" },
  { value: "la fina", label: "La Fina" },
  { value: "knorr", label: "Knorr" },
  { value: "clemente jacques", label: "Clemente Jacques" },
  { value: "san juan", label: "San Juan" },
  { value: "la moderna", label: "La Moderna" },
  { value: "monte blanco", label: "Monte Blanco" },
  { value: "natural", label: "Natural" },
];

// "natural" no es una marca: es el valor por defecto de frutas y verduras.
const NON_BRANDS_IN_FILTERS = ["natural"];

// "variado" tampoco describe un fabricante. Se mantiene como filtro, pero no
// se indexa: buscar "variado" o "natural" devolvería un bloque enorme del
// catálogo, que es ruido y no señal. "generico" sí se indexa.
const NON_BRANDS_IN_SEARCH = ["natural", "variado"];

// Las mismas marcas que el sidebar ha mostrado siempre, en el mismo orden.
export const SIDEBAR_BRANDS = PRODUCT_BRANDS.filter(
  (brand) => !NON_BRANDS_IN_FILTERS.includes(brand.value),
);

export const SEARCHABLE_BRANDS = PRODUCT_BRANDS.filter(
  (brand) => !NON_BRANDS_IN_SEARCH.includes(brand.value),
);

export const navBarList = [
  // { title: "Categorías", link: "/categorias" },
  // { title: "Paquetes", link: "/paquetes" },
  {
    title: "Frutas y Verduras",
    link: "/productos?categoria=frutas-y-verduras",
  },
  { title: "Abarrotes", link: "/productos?categoria=abarrotes" },
  {
    title: "Granos y Semillas",
    link: "/productos?categoria=granos-y-semillas",
  },
  {
    title: "Condimentos y Especias",
    link: "/productos?categoria=condimentos-y-especias",
  },
  {
    title: "Chiles Secos",
    link: "/productos?categoria=chiles-secos",
  },
  { title: "Todos los Productos", link: "/productos" },
];

export const footerData = [
  {
    _id: 2221,
    title: "Navegación",
    listItem: [
      {
        _id: "001",
        listData: [
          { name: "Categorías", link: "/categorias" },
          { name: "Todos los Productos", link: "/productos" },
        ],
      },
    ],
  },
  {
    _id: 2222,
    title: "Información",
    listItem: [
      {
        _id: "002",
        listData: [
          {
            name: "Aviso de Privacidad",
            link: "/aviso-privacidad",
          },
          {
            name: "Términos y Condiciones",
            link: "/terminos-y-condiciones",
          },
          {
            name: "Contacto",
            link: "https://wa.me/525610719284",
          },
        ],
      },
    ],
  },
];
