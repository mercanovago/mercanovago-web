import type {
  AdminProductRecord,
  BulkImportProductData,
} from "@/types/adminProduct";

import type {
  ProductDuplicateAnalysis,
  ProductDuplicateCandidate,
  ProductDuplicateMatchType,
  ProductDuplicateReason,
  ProductFieldDifference,
  ProductImportAction,
} from "@/types/duplicateDetection";

const EXACT_MATCH_SCORE = 100;
const STRONG_MATCH_SCORE = 80;
const POSSIBLE_MATCH_SCORE = 55;

const SCORE_WEIGHTS = {
  slug: 100,
  name: 65,
  category: 20,
  unit: 15,
} as const;

function normalizeComparableText(
  value: string | null | undefined
): string {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

function normalizeSlug(
  value: string | null | undefined
): string {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function valuesMatch(
  firstValue: string | null | undefined,
  secondValue: string | null | undefined
): boolean {
  const normalizedFirst =
    normalizeComparableText(firstValue);

  const normalizedSecond =
    normalizeComparableText(secondValue);

  if (!normalizedFirst || !normalizedSecond) {
    return false;
  }

  return normalizedFirst === normalizedSecond;
}

function slugsMatch(
  firstValue: string | null | undefined,
  secondValue: string | null | undefined
): boolean {
  const normalizedFirst = normalizeSlug(firstValue);
  const normalizedSecond = normalizeSlug(secondValue);

  if (!normalizedFirst || !normalizedSecond) {
    return false;
  }

  return normalizedFirst === normalizedSecond;
}

function getMatchType(
  score: number
): ProductDuplicateMatchType {
  if (score >= EXACT_MATCH_SCORE) {
    return "exact";
  }

  if (score >= STRONG_MATCH_SCORE) {
    return "strong";
  }

  if (score >= POSSIBLE_MATCH_SCORE) {
    return "possible";
  }

  return "new";
}

function getRecommendedAction(
  matchType: ProductDuplicateMatchType
): ProductImportAction {
  if (matchType === "exact") {
    return "update";
  }

  if (matchType === "strong") {
    return "skip";
  }

  if (matchType === "possible") {
    return "skip";
  }

  return "create";
}

function createReason(
  field: ProductDuplicateReason["field"],
  label: string,
  matched: boolean,
  weight: number,
  detail: string
): ProductDuplicateReason {
  return {
    field,
    label,
    matched,
    weight: matched ? weight : 0,
    detail,
  };
}

function compareProduct(
  importedProduct: BulkImportProductData,
  existingProduct: AdminProductRecord
): ProductDuplicateCandidate {
  const slugMatched = slugsMatch(
    importedProduct.slug,
    existingProduct.slug
  );

  const nameMatched = valuesMatch(
    importedProduct.name,
    existingProduct.name
  );

  const categoryMatched = valuesMatch(
    importedProduct.category,
    existingProduct.category
  );

  const unitMatched = valuesMatch(
    importedProduct.unit,
    existingProduct.unit
  );

  const reasons: ProductDuplicateReason[] = [
    createReason(
      "slug",
      "Slug",
      slugMatched,
      SCORE_WEIGHTS.slug,
      slugMatched
        ? "El identificador coincide exactamente."
        : "El identificador es diferente."
    ),
    createReason(
      "name",
      "Nombre",
      nameMatched,
      SCORE_WEIGHTS.name,
      nameMatched
        ? "El nombre comercial coincide."
        : "El nombre comercial es diferente."
    ),
    createReason(
      "category",
      "Categoría",
      categoryMatched,
      SCORE_WEIGHTS.category,
      categoryMatched
        ? "La categoría coincide."
        : "La categoría es diferente."
    ),
    createReason(
      "unit",
      "Unidad",
      unitMatched,
      SCORE_WEIGHTS.unit,
      unitMatched
        ? "La unidad o presentación coincide."
        : "La unidad o presentación es diferente."
    ),
  ];

  let score = 0;

  if (slugMatched) {
    score = EXACT_MATCH_SCORE;
  } else {
    score = reasons.reduce(
      (total, reason) => total + reason.weight,
      0
    );

    score = Math.min(score, EXACT_MATCH_SCORE);
  }

  return {
    product: existingProduct,
    score,
    matchType: getMatchType(score),
    reasons,
  };
}

function createAnalysisSummary(
  matchType: ProductDuplicateMatchType,
  matchedProduct: AdminProductRecord | null,
  confidence: number
): string {
  if (matchType === "exact" && matchedProduct) {
    return `Coincidencia exacta con "${matchedProduct.name}". Se recomienda actualizar el producto existente.`;
  }

  if (matchType === "strong" && matchedProduct) {
    return `Coincidencia alta con "${matchedProduct.name}" (${confidence} %). Revisa los datos antes de continuar.`;
  }

  if (matchType === "possible" && matchedProduct) {
    return `Posible coincidencia con "${matchedProduct.name}" (${confidence} %). Se recomienda revisión manual.`;
  }

  return "No se encontraron coincidencias relevantes. El producto puede crearse como nuevo.";
}

export function detectProductDuplicate(
  importedProduct: BulkImportProductData,
  currentProducts: AdminProductRecord[]
): ProductDuplicateAnalysis {
  if (currentProducts.length === 0) {
    return {
      importedProduct,
      matchType: "new",
      confidence: 0,
      recommendedAction: "create",
      matchedProduct: null,
      candidates: [],
      summary:
        "El catálogo no contiene productos con los cuales comparar.",
    };
  }

  const candidates = currentProducts
    .map((product) =>
      compareProduct(importedProduct, product)
    )
    .filter(
      (candidate) =>
        candidate.score >= POSSIBLE_MATCH_SCORE
    )
    .sort((firstCandidate, secondCandidate) => {
      if (secondCandidate.score !== firstCandidate.score) {
        return secondCandidate.score - firstCandidate.score;
      }

      return (
        firstCandidate.product.id -
        secondCandidate.product.id
      );
    });

  const bestCandidate = candidates[0] ?? null;

  if (!bestCandidate) {
    return {
      importedProduct,
      matchType: "new",
      confidence: 0,
      recommendedAction: "create",
      matchedProduct: null,
      candidates: [],
      summary:
        "No se encontraron coincidencias relevantes. El producto puede crearse como nuevo.",
    };
  }

  const matchType = bestCandidate.matchType;
  const recommendedAction =
    getRecommendedAction(matchType);

  return {
    importedProduct,
    matchType,
    confidence: bestCandidate.score,
    recommendedAction,
    matchedProduct: bestCandidate.product,
    candidates,
    summary: createAnalysisSummary(
      matchType,
      bestCandidate.product,
      bestCandidate.score
    ),
  };
}

export function detectProductDuplicates(
  importedProducts: BulkImportProductData[],
  currentProducts: AdminProductRecord[]
): ProductDuplicateAnalysis[] {
  return importedProducts.map((product) =>
    detectProductDuplicate(product, currentProducts)
  );
}

function normalizeDifferenceValue(
  value:
    | string
    | number
    | boolean
    | null
    | undefined
): string | number | boolean | null {
  if (value === undefined) {
    return null;
  }

  return value;
}

function comparableDifferenceValue(
  value:
    | string
    | number
    | boolean
    | null
    | undefined
): string {
  if (typeof value === "string") {
    return normalizeComparableText(value);
  }

  if (typeof value === "number") {
    return Number(value).toFixed(4);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return "";
}

export function getProductDifferences(
  importedProduct: BulkImportProductData,
  existingProduct: AdminProductRecord
): ProductFieldDifference[] {
  const fields: Array<{
    field: keyof BulkImportProductData;
    label: string;
  }> = [
    {
      field: "slug",
      label: "Slug",
    },
    {
      field: "name",
      label: "Nombre",
    },
    {
      field: "category",
      label: "Categoría",
    },
    {
      field: "price",
      label: "Precio",
    },
    {
      field: "old_price",
      label: "Precio anterior",
    },
    {
      field: "unit",
      label: "Unidad",
    },
    {
      field: "approx",
      label: "Aproximado",
    },
    {
      field: "image",
      label: "Imagen",
    },
    {
      field: "description",
      label: "Descripción",
    },
    {
      field: "origin",
      label: "Origen",
    },
    {
      field: "delivery",
      label: "Entrega",
    },
    {
      field: "badge",
      label: "Etiqueta",
    },
    {
      field: "stock",
      label: "Disponible",
    },
    {
      field: "featured",
      label: "Destacado",
    },
  ];

  return fields.map(({ field, label }) => {
    const currentValue = normalizeDifferenceValue(
      existingProduct[field]
    );

    const importedValue = normalizeDifferenceValue(
      importedProduct[field]
    );

    return {
      field,
      label,
      currentValue,
      importedValue,
      changed:
        comparableDifferenceValue(currentValue) !==
        comparableDifferenceValue(importedValue),
    };
  });
}

export function getChangedProductFields(
  importedProduct: BulkImportProductData,
  existingProduct: AdminProductRecord
): ProductFieldDifference[] {
  return getProductDifferences(
    importedProduct,
    existingProduct
  ).filter((difference) => difference.changed);
}