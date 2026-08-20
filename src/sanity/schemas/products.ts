import { defineField, defineType } from "sanity";

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Keep the title relative to the product",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "string",
    }),

    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "productCategory",
      title: "Product Category",
      type: "string",
      description: "Select the category",
      options: {
        list: [
          { title: "Frutas y Verduras", value: "frutas-y-verduras" },
          {
            value: "abarrotes",
            title: "Abarrotes",
          },
          {
            value: "condimentos-y-especias",
            title: "Condimentos y Especias",
          },
          {
            value: "frutos-secos-y-varios",
            title: "Frutos Secos y Varios",
          },
          {
            value: "granos-y-semillas",
            title: "Granos y Semillas",
          },
          { value: "chiles-secos", title: "Chiles Secos" },
          {
            title: "Huevo",
            value: "huevo",
          },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "productType",
      title: "Product Type",
      type: "string",
      description: "Select the type of product",
      options: {
        list: [
          { title: "M-Kg", value: "m-kg" },
          // { title: "M-Kg-P", value: "m-kg-p" },
          // { title: "Kg-P", value: "kg-p" },
          { title: "Kg", value: "kg" },
          { title: "P", value: "p" },
          { title: "100Gr", value: "100g" },
        ],
      },
    }),
    defineField({
      name: "kgPrice",
      title: "Kg Price",
      type: "number",
      hidden: ({ parent }) =>
        parent?.productType === "p" || parent?.productType === "100g",
      validation: (rule) => rule.precision(0),
    }),
    defineField({
      name: "pPrice",
      title: "P Price",
      type: "number",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { productType?: string };
          if (parent?.productType !== "p" && value !== undefined) {
            return 'pPrice should only be set when productType is "p"';
          }
          return true;
        }),
    }),
    defineField({
      name: "gramsPrice",
      title: "100Gr Price",
      type: "number",
      hidden: ({ parent }) => parent?.productType !== "100g",
      validation: (rule) => rule.precision(0),
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "string",
      options: {
        list: [
          { title: "Genérico", value: "generico" },
          { title: "Mr. Lucky", value: "mrlucky" },
          { title: "Bimbo", value: "bimbo" },
          { title: "Pronto", value: "pronto" },
          { title: "Verde Valle", value: "verde valle" },
          { title: "La Fina", value: "la fina" },
          { title: "Knorr", value: "knorr" },
          { title: "Clemente Jacques", value: "clemente jacques" },
          { title: "San Juan", value: "san juan" },
          { title: "La Moderna", value: "la moderna" },
          { title: "Variado", value: "variado" },
          { title: "Natural", value: "natural" },
        ],
      },
    }),
    defineField({
      name: "matureQuantity",
      type: "number",
      title: "Mature Quantity (Kg)",
      hidden: ({ parent }) => parent?.productType !== "m-kg",
    }),
    defineField({
      name: "kgPerPiece",
      type: "string",
      title: "Kg Per Piece Aprox",
      hidden: ({ parent }) => parent?.productType !== "p",
    }),
    defineField({
      name: "greenQuantity",
      title: "Green Quantity (Kg)",
      type: "number",
      hidden: ({ parent }) => parent?.productType !== "m-kg",
    }),
    defineField({
      name: "kgQuantity",
      title: "Kg Quantity",
      type: "number",
      hidden: ({ parent }) =>
        parent?.productType === "m-kg" || parent?.productType === "p",
    }),
    defineField({
      name: "rowprice",
      title: "Row Price",
      type: "number",
      validation: (rule) => rule.min(0).precision(0),
    }),
    defineField({
      name: "isnew",
      title: "New Arrival",
      type: "boolean",
    }),
    defineField({
      name: "bestseller",
      title: "Best Seller",
      type: "boolean",
    }),
    defineField({
      name: "seasonal",
      title: "Seasonal",
      type: "boolean",
    }),
    defineField({
      name: "quantity",
      title: "Quantity",
      type: "number",
      hidden: ({ parent }) => parent?.productType !== "p",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      position: "position",
    },
  },
});
