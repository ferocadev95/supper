import { ProductData } from "../../../../../types";
import { client } from "../../../../sanity/lib/client";
import { groq } from "next-sanity";
import Pagination from "../../../../components/Pagination";
import Container from "../../../../components/Container";
import ProductList from "../../../../components/ProductList";
import SidebarExpanded from "../../../../components/SidebarExpanded";
import { SEARCH_FETCH_LIMIT, searchProducts } from "../../../../lib/search";

const PROJECTION = `{
    ...
}`;

interface Props {
    searchParams: Promise<{
        categoria?: string;
        marca?: string;
        ofertas?: string;
        masVendido?: string;
        search?: string;
        page?: string;
    }>;
}

const ShopPage = async ({ searchParams }: Props) => {
    const { categoria, marca, ofertas, masVendido, search, page } =
        await searchParams;

    const PRODUCTS_PER_PAGE = 9;
    const pageNumber = page ? parseInt(page) : 1;
    const start = (pageNumber - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;

    const productFilter = `_type == "product"`;
    const categoryFilter = categoria ? `&& productCategory == $categoria` : "";
    const brandFilter = marca ? `&& brand == $marca` : "";
    const bestSellerFilter = masVendido ? `&& bestseller == ${masVendido}` : "";
    const offersFilter = ofertas ? `&& rowprice > 0` : "";

    const filter = `*[${productFilter}${categoryFilter}${brandFilter}${bestSellerFilter}${offersFilter}]`;
    const params = {
        ...(categoria ? { categoria } : {}),
        ...(marca ? { marca } : {}),
    };

    // La búsqueda no puede resolverse en GROQ: `match` es accent-sensitive y
    // opera por tokens completos, así que "platano" nunca encuentra "Plátano"
    // ni "manz" encuentra "Manzana". Se trae el conjunto filtrado y se ordena
    // por relevancia en Node.
    let products: ProductData[];
    let totalProducts: number;

    if (search) {
        const candidates = await client.fetch<ProductData[]>(
            groq`${filter} ${PROJECTION}|order(_createdAt asc) [0...${SEARCH_FETCH_LIMIT}]`,
            params
        );
        const ranked = searchProducts(candidates, search);

        products = ranked.slice(start, end);
        totalProducts = ranked.length;
    } else {
        products = await client.fetch<ProductData[]>(
            groq`${filter} ${PROJECTION}|order(_createdAt asc) [${start}...${end}]`,
            params
        );
        totalProducts = await client.fetch(groq`count(${filter})`, params);
    }

    return (
        <Container>
            <div className="lg:grid grid-cols-3">
                <div className="col-span-1">
                    <SidebarExpanded />
                </div>
                <div className="lg:col-span-2 py-5 lg:py-10">
                    {products?.length > 0 ? (
                        <>
                            <ProductList products={products} />
                            <Pagination
                                page={pageNumber}
                                totalProducts={totalProducts}
                                productsPerPage={PRODUCTS_PER_PAGE}
                            />
                        </>
                    ) : (
                        <div>
                            <p>No se han encontrado productos.</p>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
};

export default ShopPage;
