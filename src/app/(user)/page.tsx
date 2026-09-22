import { Suspense } from "react";
import Banner from "../../components/Banner";
import Container from "../../components/Container";
import Features from "../../components/Features";
import BestSellerProductList from "../../components/BestSellerProductList";
import CategoryProductRow from "../../components/CategoryProductRow";
import CategoryRowSkeleton from "../../components/CategoryRowSkeleton";
import OffersProductList from "../../components/OffersProductList";
import EndBanner from "../../components/EndBanner";
import Popup from "../../components/Popup";
import { HOME_CATEGORY_ROWS } from "../../lib/categoryRows";

export default function Home() {
  return (
    <Container className="py-10">
      <Popup />
      <Banner />
      <Features />
      {HOME_CATEGORY_ROWS.map((categoria) => (
        <Suspense key={categoria} fallback={<CategoryRowSkeleton />}>
          <CategoryProductRow categoria={categoria} />
        </Suspense>
      ))}
      <BestSellerProductList />
      <OffersProductList />
      <EndBanner />
    </Container>
  );
}
