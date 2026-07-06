import { notFound } from "next/navigation";
import { products } from "../../../data/products";
import ProductDetailClient from "../../../components/products/ProductDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}