import { urlFor } from "../sanity/lib/image";
import { Category } from "../../types";
import Image from "next/image";
import Link from "next/link";

interface Props {
  categories: Category[];
}

const CategoryCard = ({ categories }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category: Category) => (
        <div
          key={category?._id}
          className="bg-white border-[1px] border-gray-300/50 rounded-2xl overflow-hidden md:max-w-sm"
        >
          <div className="relative h-56">
            <Image
              src={urlFor(category?.image).url()}
              alt={category?.title}
              objectFit="contain"
              layout="fill"
            />
          </div>
          <div className="pt-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
              {category?.title}
            </h2>
            <p className="text-gray-600 mb-4 text-center min-h-12">
              {category?.description}
            </p>
            <Link
              href={`/productos?categoria=${category?.slug?.current}`}
              className="btn-secondary w-full text-center font-semibold px-4 py-2"
            >
              Ver Categoría
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryCard;
