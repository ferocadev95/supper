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
            link: "https://wa.me/525652588800",
          },
        ],
      },
    ],
  },
];
