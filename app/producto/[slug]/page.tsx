import { notFound } from "next/navigation";

import ProductDetailClient from "@/components/products/ProductDetailClient";
import { getProductBySlug } from "@/services/productDetail";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  let product;

  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    console.error(
      "Error cargando la página del producto:",
      error
    );

    throw error;
  }

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient
      product={product}
    />
  );
}