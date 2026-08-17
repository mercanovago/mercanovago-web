import { getAdminProducts } from "@/services/adminProducts";
import type { AdminProductRecord } from "@/types/adminProduct";

export interface CatalogMetric {
  key:
    | "total"
    | "available"
    | "out_of_stock"
    | "featured"
    | "offers"
    | "without_image"
    | "without_description";
  label: string;
  value: number;
  description: string;
}

export interface CatalogQualityIndicator {
  key: "image" | "description" | "stock" | "commercial";
  label: string;
  percentage: number;
  completed: number;
  total: number;
}

export interface CatalogAttentionItem {
  id: number;
  slug: string;
  name: string;
  category: string;
  issues: string[];
  image: string;
}

export interface CatalogRecentActivity {
  id: number;
  title: string;
  description: string;
  date: string | null;
  href: string;
}

export interface CatalogDashboardData {
  products: AdminProductRecord[];
  metrics: CatalogMetric[];
  qualityIndicators: CatalogQualityIndicator[];
  attentionItems: CatalogAttentionItem[];
  recentActivity: CatalogRecentActivity[];
  catalogCompletion: number;
  lastUpdate: string | null;
}

function hasImage(product: AdminProductRecord): boolean {
  return Boolean(product.image?.trim());
}

function hasDescription(product: AdminProductRecord): boolean {
  return Boolean(product.description?.trim());
}

function hasCommercialData(
  product: AdminProductRecord
): boolean {
  return Boolean(
    product.category?.trim() &&
      product.unit?.trim() &&
      product.delivery?.trim()
  );
}

function isOffer(product: AdminProductRecord): boolean {
  return (
    product.old_price !== null &&
    Number(product.old_price) >
      Number(product.price)
  );
}

function calculatePercentage(
  completed: number,
  total: number
): number {
  if (total === 0) {
    return 100;
  }

  return Math.round((completed / total) * 100);
}

function getProductIssues(
  product: AdminProductRecord
): string[] {
  const issues: string[] = [];

  if (!hasImage(product)) {
    issues.push("Sin fotografía");
  }

  if (!hasDescription(product)) {
    issues.push("Sin descripción");
  }

  if (!product.stock) {
    issues.push("Sin stock");
  }

  if (!product.category?.trim()) {
    issues.push("Sin categoría");
  }

  if (!product.unit?.trim()) {
    issues.push("Sin unidad de venta");
  }

  if (!product.delivery?.trim()) {
    issues.push("Sin información de entrega");
  }

  return issues;
}

function getLastUpdate(
  products: AdminProductRecord[]
): string | null {
  const timestamps = products
    .map((product) => product.created_at)
    .filter(
      (value): value is string =>
        Boolean(value) &&
        Number.isFinite(
          new Date(value as string).getTime()
        )
    )
    .sort(
      (first, second) =>
        new Date(second).getTime() -
        new Date(first).getTime()
    );

  return timestamps[0] ?? null;
}

export async function getCatalogDashboardData(): Promise<
  CatalogDashboardData
> {
  const products = await getAdminProducts();
  const total = products.length;

  const available = products.filter(
    (product) => product.stock
  ).length;

  const outOfStock = total - available;

  const featured = products.filter(
    (product) => product.featured
  ).length;

  const offers = products.filter(isOffer).length;

  const withImage = products.filter(hasImage).length;

  const withDescription =
    products.filter(hasDescription).length;

  const withCommercialData =
    products.filter(hasCommercialData).length;

  const attentionItems = products
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      issues: getProductIssues(product),
      image: product.image,
    }))
    .filter((product) => product.issues.length > 0)
    .sort(
      (first, second) =>
        second.issues.length -
        first.issues.length
    )
    .slice(0, 8);

  const qualityIndicators: CatalogQualityIndicator[] =
    [
      {
        key: "image",
        label: "Fotografías",
        percentage: calculatePercentage(
          withImage,
          total
        ),
        completed: withImage,
        total,
      },
      {
        key: "description",
        label: "Descripciones",
        percentage: calculatePercentage(
          withDescription,
          total
        ),
        completed: withDescription,
        total,
      },
      {
        key: "commercial",
        label: "Información comercial",
        percentage: calculatePercentage(
          withCommercialData,
          total
        ),
        completed: withCommercialData,
        total,
      },
      {
        key: "stock",
        label: "Disponibilidad",
        percentage: calculatePercentage(
          available,
          total
        ),
        completed: available,
        total,
      },
    ];

  const catalogCompletion =
    qualityIndicators.length === 0
      ? 100
      : Math.round(
          qualityIndicators.reduce(
            (totalPercentage, indicator) =>
              totalPercentage +
              indicator.percentage,
            0
          ) / qualityIndicators.length
        );

  const recentActivity = [...products]
    .filter((product) => product.created_at)
    .sort(
      (first, second) =>
        new Date(
          second.created_at as string
        ).getTime() -
        new Date(
          first.created_at as string
        ).getTime()
    )
    .slice(0, 6)
    .map((product) => ({
      id: product.id,
      title: product.name,
      description:
        "Producto registrado en el catálogo.",
      date: product.created_at ?? null,
      href: `/admin/products?product=${encodeURIComponent(
        product.slug
      )}`,
    }));

  return {
    products,
    metrics: [
      {
        key: "total",
        label: "Productos",
        value: total,
        description: "Registrados en el catálogo",
      },
      {
        key: "available",
        label: "Disponibles",
        value: available,
        description: "Listos para la venta",
      },
      {
        key: "out_of_stock",
        label: "Sin stock",
        value: outOfStock,
        description: "Requieren reposición",
      },
      {
        key: "featured",
        label: "Destacados",
        value: featured,
        description: "Con visibilidad prioritaria",
      },
      {
        key: "offers",
        label: "Ofertas",
        value: offers,
        description: "Con precio promocional",
      },
      {
        key: "without_image",
        label: "Sin fotografía",
        value: total - withImage,
        description: "Pendientes de imagen",
      },
      {
        key: "without_description",
        label: "Sin descripción",
        value: total - withDescription,
        description: "Pendientes de contenido",
      },
    ],
    qualityIndicators,
    attentionItems,
    recentActivity,
    catalogCompletion,
    lastUpdate: getLastUpdate(products),
  };
}