"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import FloatingCartButton from "@/components/cart/FloatingCartButton";
import { useCart } from "@/context/CartContext";
import { createProductFallbackImage } from "@/lib/productImages";

import type {
  Product,
  ProductImage,
  ProductIntelligence,
} from "@/types/product";

interface ProductDetailClientProps {
  product: Product;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const { addToCart } = useCart();

  const [added, setAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] =
    useState(0);
  const [failedImageIds, setFailedImageIds] = useState<
    number[]
  >([]);

  const fallbackImage = useMemo(
    () =>
      createProductFallbackImage(
        product.name,
        product.category
      ),
    [product.name, product.category]
  );

  const galleryImages = useMemo<ProductImage[]>(() => {
    const sourceImages =
      product.images && product.images.length > 0
        ? product.images
        : product.image.trim()
          ? [
              {
                id: -1,
                image_url: product.image.trim(),
                alt_text: product.name,
                is_primary: true,
                display_order: 0,
              },
            ]
          : [];

    return sourceImages
      .filter(
        (image) =>
          Boolean(image.image_url?.trim()) &&
          !failedImageIds.includes(image.id)
      )
      .sort((a, b) => {
        const primaryDifference =
          Number(b.is_primary) -
          Number(a.is_primary);

        if (primaryDifference !== 0) {
          return primaryDifference;
        }

        return a.display_order - b.display_order;
      });
  }, [
    failedImageIds,
    product.image,
    product.images,
    product.name,
  ]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product.id, product.images]);

  const selectedImage =
    galleryImages[selectedImageIndex];

  const productImage =
    selectedImage?.image_url ?? fallbackImage;

  const hasMultipleImages = galleryImages.length > 1;

  const hasDiscount =
    product.old_price !== null &&
    Number.isFinite(product.old_price) &&
    product.old_price > product.price;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.old_price! - product.price) /
          product.old_price!) *
          100
      )
    : 0;

  function handleAddToCart() {
    if (!product.stock) {
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      image: productImage,
      price: product.price,
      unit: product.unit,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  }

  function showPreviousImage() {
    if (!hasMultipleImages) {
      return;
    }

    setSelectedImageIndex((current) =>
      current === 0
        ? galleryImages.length - 1
        : current - 1
    );
  }

  function showNextImage() {
    if (!hasMultipleImages) {
      return;
    }

    setSelectedImageIndex((current) =>
      current === galleryImages.length - 1
        ? 0
        : current + 1
    );
  }

  function handleImageError(imageId: number) {
    setFailedImageIds((current) =>
      current.includes(imageId)
        ? current
        : [...current, imageId]
    );
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!hasMultipleImages) {
        return;
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [hasMultipleImages, galleryImages.length]);

  const intelligence = product.intelligence ?? null;

  const hasIntelligenceContent =
    intelligence !== null &&
    Boolean(
      intelligence.long_description ||
        intelligence.benefits.length > 0 ||
        intelligence.characteristics.length > 0 ||
        Object.keys(intelligence.nutrition_json).length > 0 ||
        intelligence.storage_instructions ||
        intelligence.storage_temperature ||
        intelligence.shelf_life ||
        intelligence.washing_instructions ||
        intelligence.consumption_instructions ||
        intelligence.chef_notes ||
        intelligence.recipe_tips.length > 0 ||
        intelligence.suggested_uses.length > 0 ||
        intelligence.seasonality.length > 0
    );

  return (
    <main className="min-h-screen bg-[#f4f7f4] px-4 py-6 text-zinc-950 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/#catalogo"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-black text-zinc-600 shadow-sm transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <path
              d="m15 18-6-6 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          Volver al catálogo
        </Link>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_35px_100px_-55px_rgba(15,23,42,0.5)]">
          <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
            <div className="bg-zinc-100 p-3 sm:p-5">
              <div className="relative min-h-[340px] overflow-hidden rounded-[1.5rem] bg-white sm:min-h-[480px] lg:min-h-[590px]">
                <img
                  key={productImage}
                  src={productImage}
                  alt={
                    selectedImage?.alt_text?.trim() ||
                    product.name
                  }
                  onError={() => {
                    if (selectedImage) {
                      handleImageError(selectedImage.id);
                    }
                  }}
                  className="absolute inset-0 h-full w-full object-contain p-4 transition duration-500 sm:p-7"
                />

                <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-3 p-4 sm:p-6">
                  <div className="flex flex-wrap gap-2">
                    {product.featured && (
                      <span className="rounded-full bg-zinc-950 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-lg">
                        Selección MercaNova
                      </span>
                    )}

                    {product.badge && (
                      <span className="rounded-full bg-green-600 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-lg">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {hasDiscount && (
                    <span className="rounded-full bg-red-600 px-4 py-2 text-xs font-black text-white shadow-lg">
                      -{discountPercentage}%
                    </span>
                  )}
                </div>

                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousImage}
                      aria-label="Ver fotografía anterior"
                      className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-zinc-900 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-green-600 hover:text-white sm:left-5"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={showNextImage}
                      aria-label="Ver fotografía siguiente"
                      className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-zinc-900 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-green-600 hover:text-white sm:right-5"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-4 flex items-center gap-2 sm:bottom-6 sm:left-6">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.12em] shadow-lg ${
                      product.stock
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        product.stock
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />

                    {product.stock
                      ? "Disponible"
                      : "Agotado"}
                  </span>

                  {hasMultipleImages && (
                    <span className="rounded-full bg-zinc-950/85 px-3 py-2 text-xs font-black text-white shadow-lg backdrop-blur">
                      {selectedImageIndex + 1}/
                      {galleryImages.length}
                    </span>
                  )}
                </div>
              </div>

              {hasMultipleImages && (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                  {galleryImages.map((image, index) => {
                    const active =
                      index === selectedImageIndex;

                    return (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() =>
                          setSelectedImageIndex(index)
                        }
                        aria-label={`Ver fotografía ${index + 1} de ${product.name}`}
                        aria-pressed={active}
                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition sm:h-24 sm:w-24 ${
                          active
                            ? "border-green-600 shadow-lg shadow-green-600/15"
                            : "border-transparent opacity-75 hover:border-green-300 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={image.image_url}
                          alt=""
                          onError={() =>
                            handleImageError(image.id)
                          }
                          className="h-full w-full object-contain p-2"
                        />

                        {image.is_primary && (
                          <span className="absolute bottom-1 left-1 rounded-full bg-zinc-950 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white">
                            Principal
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 sm:p-9 lg:p-12">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">
                  {product.category}
                </p>

                <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
                  {product.name}
                </h1>

                {product.description && (
                  <p className="mt-6 text-base leading-8 text-zinc-600 sm:text-lg">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="mt-8">
                {hasDiscount && (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xl font-black text-zinc-400 line-through sm:text-2xl">
                      {formatCurrency(product.old_price!)}
                    </p>

                    <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-600">
                      Ahorras{" "}
                      {formatCurrency(
                        product.old_price! -
                          product.price
                      )}
                    </span>
                  </div>
                )}

                <p className="mt-1 text-5xl font-black tracking-tight text-green-600 sm:text-6xl">
                  {formatCurrency(product.price)}
                </p>

                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Precio final
                </p>
              </div>

              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                <InfoCard
                  label="Unidad"
                  value={product.unit}
                  type="unit"
                />

                {product.approx && (
                  <InfoCard
                    label="Presentación"
                    value={product.approx}
                    type="presentation"
                  />
                )}

                {product.origin && (
                  <InfoCard
                    label="Origen"
                    value={product.origin}
                    type="origin"
                  />
                )}

                {product.delivery && (
                  <InfoCard
                    label="Entrega"
                    value={product.delivery}
                    type="delivery"
                    highlighted
                  />
                )}
              </div>

              <div className="mt-auto pt-9">
                <button
                  type="button"
                  disabled={!product.stock}
                  onClick={handleAddToCart}
                  className={`flex w-full items-center justify-center gap-3 rounded-2xl px-7 py-5 text-base font-black transition sm:text-lg ${
                    added
                      ? "bg-zinc-950 text-white"
                      : "bg-green-600 text-white shadow-lg shadow-green-900/20 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl"
                  } disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none`}
                >
                  {added ? (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="h-6 w-6"
                      >
                        <path
                          d="m5 12 4 4L19 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      Producto agregado
                    </>
                  ) : product.stock ? (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="h-6 w-6"
                      >
                        <path
                          d="M3.75 5.25h2l1.65 9.15a2 2 0 0 0 1.97 1.65h7.88a2 2 0 0 0 1.95-1.55l1.05-4.75H7.1"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="9.5"
                          cy="19"
                          r="1.25"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <circle
                          cx="17.75"
                          cy="19"
                          r="1.25"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>

                      Agregar a la canasta
                    </>
                  ) : (
                    "Producto temporalmente agotado"
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-semibold text-zinc-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <path
                      d="M12 3.75 19 6.5v5.25c0 4.45-2.85 7.5-7 8.5-4.15-1-7-4.05-7-8.5V6.5l7-2.75Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m9 12 2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  Compra respaldada por la atención personalizada de MercaNova GO
                </div>
              </div>
            </div>
          </div>
        </section>

        {hasIntelligenceContent && intelligence && (
          <ProductIntelligenceSection
            productName={product.name}
            intelligence={intelligence}
          />
        )}
      </div>

      <FloatingCartButton />
    </main>
  );
}

interface InfoCardProps {
  label: string;
  value: string;
  type:
    | "unit"
    | "presentation"
    | "origin"
    | "delivery";
  highlighted?: boolean;
}

function InfoCard({
  label,
  value,
  type,
  highlighted = false,
}: InfoCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlighted
          ? "border-green-200 bg-green-50"
          : "border-zinc-200 bg-zinc-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            highlighted
              ? "bg-white text-green-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          <InfoIcon type={type} />
        </span>

        <div>
          <p
            className={`text-[10px] font-black uppercase tracking-wider ${
              highlighted
                ? "text-green-600"
                : "text-zinc-400"
            }`}
          >
            {label}
          </p>

          <p
            className={`mt-1 font-black ${
              highlighted
                ? "text-green-800"
                : "text-zinc-800"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoIcon({
  type,
}: {
  type: InfoCardProps["type"];
}) {
  if (type === "presentation") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M5 12h14M8 8.5 5 12l3 3.5M16 8.5l3 3.5-3 3.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "origin") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M12 20s6-5.1 6-10a6 6 0 1 0-12 0c0 4.9 6 10 6 10Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="10"
          r="2"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </svg>
    );
  }

  if (type === "delivery") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M3.75 6.5h10.5v9.25H3.75V6.5ZM14.25 9h3.25l2.75 3v3.75h-6V9Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="7"
          cy="17.25"
          r="1.5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle
          cx="17.5"
          cy="17.25"
          r="1.5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M5 8.25h14M7 4.75h10v14.5H7V4.75Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface ProductIntelligenceSectionProps {
  productName: string;
  intelligence: ProductIntelligence;
}

function ProductIntelligenceSection({
  productName,
  intelligence,
}: ProductIntelligenceSectionProps) {
  const nutritionEntries = getNutritionEntries(
    intelligence.nutrition_json
  );

  const hasConservation =
    Boolean(intelligence.storage_instructions) ||
    Boolean(intelligence.storage_temperature) ||
    Boolean(intelligence.shelf_life) ||
    Boolean(intelligence.washing_instructions) ||
    Boolean(intelligence.consumption_instructions);

  const hasChef =
    Boolean(intelligence.chef_notes) ||
    intelligence.recipe_tips.length > 0 ||
    intelligence.suggested_uses.length > 0;

  return (
    <section className="mt-7 space-y-6">
      <article className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-950 text-white shadow-[0_30px_90px_-55px_rgba(15,23,42,0.8)]">
        <div className="grid gap-8 px-6 py-8 sm:px-9 lg:grid-cols-[0.85fr_1.15fr] lg:px-12 lg:py-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-green-400">
              Inteligencia del producto
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Conoce mejor {productName}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
              Información seleccionada para ayudarte a comprar,
              conservar y aprovechar mejor este producto.
            </p>
          </div>

          {intelligence.long_description && (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-green-300">
                Información ampliada
              </p>

              <p className="mt-3 text-sm leading-7 text-zinc-200 sm:text-base">
                {intelligence.long_description}
              </p>
            </div>
          )}
        </div>
      </article>

      {(intelligence.benefits.length > 0 ||
        intelligence.characteristics.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {intelligence.benefits.length > 0 && (
            <KnowledgeCard
              eyebrow="Bienestar y valor"
              title="Beneficios"
              items={intelligence.benefits}
              iconType="benefits"
            />
          )}

          {intelligence.characteristics.length > 0 && (
            <KnowledgeCard
              eyebrow="Selección del producto"
              title="Características"
              items={intelligence.characteristics}
              iconType="characteristics"
            />
          )}
        </div>
      )}

      {(nutritionEntries.length > 0 ||
        hasConservation) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {nutritionEntries.length > 0 && (
            <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)] sm:p-8">
              <SectionHeading
                eyebrow="Información útil"
                title="Nutrición"
                iconType="nutrition"
              />

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {nutritionEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                      {formatNutritionLabel(key)}
                    </p>

                    <p className="mt-2 font-black text-zinc-900">
                      {formatNutritionValue(value)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          )}

          {hasConservation && (
            <article className="rounded-[2rem] border border-green-200 bg-green-50/60 p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)] sm:p-8">
              <SectionHeading
                eyebrow="Frescura y cuidado"
                title="Conservación"
                iconType="storage"
              />

              <div className="mt-7 space-y-3">
                {intelligence.storage_instructions && (
                  <DetailRow
                    label="Cómo almacenar"
                    value={intelligence.storage_instructions}
                  />
                )}

                {intelligence.storage_temperature && (
                  <DetailRow
                    label="Temperatura"
                    value={intelligence.storage_temperature}
                  />
                )}

                {intelligence.shelf_life && (
                  <DetailRow
                    label="Vida útil"
                    value={intelligence.shelf_life}
                  />
                )}

                {intelligence.washing_instructions && (
                  <DetailRow
                    label="Lavado"
                    value={intelligence.washing_instructions}
                  />
                )}

                {intelligence.consumption_instructions && (
                  <DetailRow
                    label="Consumo"
                    value={intelligence.consumption_instructions}
                  />
                )}
              </div>
            </article>
          )}
        </div>
      )}

      {(hasChef || intelligence.seasonality.length > 0) && (
        <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)] sm:p-8">
          <SectionHeading
            eyebrow="Chef MercaNova GO"
            title="Ideas para aprovecharlo"
            iconType="chef"
          />

          {intelligence.chef_notes && (
            <p className="mt-5 max-w-4xl text-sm leading-7 text-zinc-600 sm:text-base">
              {intelligence.chef_notes}
            </p>
          )}

          <div className="mt-7 grid gap-6 lg:grid-cols-3">
            {intelligence.suggested_uses.length > 0 && (
              <MiniList
                title="Usos sugeridos"
                items={intelligence.suggested_uses}
              />
            )}

            {intelligence.recipe_tips.length > 0 && (
              <MiniList
                title="Consejos del Chef"
                items={intelligence.recipe_tips}
              />
            )}

            {intelligence.seasonality.length > 0 && (
              <MiniList
                title="Disponibilidad"
                items={intelligence.seasonality}
              />
            )}
          </div>

          <div className="mt-7">
            <Link
              href="/chef"
              className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-6 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-green-700"
            >
              Ir a Chef MercaNova GO
            </Link>
          </div>
        </article>
      )}
    </section>
  );
}

function KnowledgeCard({
  eyebrow,
  title,
  items,
  iconType,
}: {
  eyebrow: string;
  title: string;
  items: string[];
  iconType: SectionIconType;
}) {
  return (
    <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)] sm:p-8">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        iconType={iconType}
      />

      <ul className="mt-7 space-y-3">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-3 rounded-2xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600"
          >
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-green-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function MiniList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-green-600">
        {title}
      </p>

      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-3 text-sm leading-6 text-zinc-600"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-950" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-green-200 bg-white/80 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-green-600">
        {label}
      </p>

      <p className="mt-2 text-sm leading-6 text-zinc-700">
        {value}
      </p>
    </div>
  );
}

type SectionIconType =
  | "benefits"
  | "characteristics"
  | "nutrition"
  | "storage"
  | "chef";

function SectionHeading({
  eyebrow,
  title,
  iconType,
}: {
  eyebrow: string;
  title: string;
  iconType: SectionIconType;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
        <SectionIcon type={iconType} />
      </span>

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-600">
          {eyebrow}
        </p>

        <h3 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
          {title}
        </h3>
      </div>
    </div>
  );
}

function SectionIcon({
  type,
}: {
  type: SectionIconType;
}) {
  if (type === "nutrition") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path
          d="M12 20c4.5-2.5 7-6 7-10.5C15 9 12.5 6.8 12 3c-.5 3.8-3 6-7 6.5C5 14 7.5 17.5 12 20Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "storage") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path
          d="M12 3v13M8.5 6.5 12 3l3.5 3.5M7 10h10M8 20h8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "chef") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path
          d="M8 10a4 4 0 1 1 8 0h1a3 3 0 0 1 0 6H7a3 3 0 0 1 0-6h1Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M8 16v4h8v-4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "characteristics") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path
          d="M5 6h14M5 12h14M5 18h14"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="8" cy="6" r="1.5" fill="currentColor" />
        <circle cx="15" cy="12" r="1.5" fill="currentColor" />
        <circle cx="10" cy="18" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getNutritionEntries(
  nutrition: Record<string, unknown>
): [string, unknown][] {
  return Object.entries(nutrition).filter(
    ([, value]) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0)
  );
}

function formatNutritionLabel(
  value: string
): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatNutritionValue(
  value: unknown
): string {
  if (Array.isArray(value)) {
    return value.map(String).join(", ");
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    return Object.entries(
      value as Record<string, unknown>
    )
      .map(
        ([key, nestedValue]) =>
          `${formatNutritionLabel(key)}: ${String(nestedValue)}`
      )
      .join(" · ");
  }

  return String(value);
}