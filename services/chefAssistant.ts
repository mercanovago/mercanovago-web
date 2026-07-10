import { supabase } from "@/lib/supabase";

import type {
  ChefAssistantInterpretation,
  ChefAssistantRequest,
  ChefAssistantResponse,
  ChefCatalogProduct,
  ChefDietaryTag,
  ChefInstruction,
  ChefIntent,
  ChefNutritionalInformation,
  ChefRecipe,
  ChefRecipeIngredientRelationRow,
  ChefRecipeRecommendation,
  ChefRecipeRow,
  ChefRecipeWithIngredients,
  ChefResolvedIngredient,
} from "@/types/chef";

const DEFAULT_PORTIONS = 4;
const MAX_RECOMMENDATIONS = 5;

const PORTION_PATTERNS = [
  /para\s+(\d+)\s+personas?/i,
  /para\s+(\d+)\s+porciones?/i,
  /somos\s+(\d+)/i,
  /(\d+)\s+personas?/i,
  /(\d+)\s+porciones?/i,
];

const BUDGET_PATTERNS = [
  /(?:presupuesto|tengo|dispongo de|con)\s*\$?\s*(\d+(?:[.,]\d{1,2})?)/i,
  /\$\s*(\d+(?:[.,]\d{1,2})?)/i,
  /hasta\s+\$?\s*(\d+(?:[.,]\d{1,2})?)/i,
  /máximo\s+\$?\s*(\d+(?:[.,]\d{1,2})?)/i,
];

const DIETARY_KEYWORDS: Record<string, ChefDietaryTag> = {
  vegetariano: "vegetariano",
  vegetariana: "vegetariano",
  vegano: "vegano",
  vegana: "vegano",
  "sin gluten": "sin-gluten",
  celíaco: "sin-gluten",
  celiaco: "sin-gluten",
  "sin lácteos": "sin-lacteos",
  "sin lacteos": "sin-lacteos",
  "sin leche": "sin-lacteos",
  "alto en proteína": "alto-en-proteina",
  "alto en proteina": "alto-en-proteina",
  proteico: "alto-en-proteina",
  "bajo en calorías": "bajo-en-calorias",
  "bajo en calorias": "bajo-en-calorias",
  ligero: "bajo-en-calorias",
};

const INTENT_KEYWORDS: Record<ChefIntent, string[]> = {
  recipe: [
    "preparar",
    "cocinar",
    "receta",
    "hacer",
    "locro",
    "fanesca",
    "encebollado",
    "hornado",
    "sopa",
    "ensalada",
    "arroz",
    "pollo",
  ],
  budget: [
    "presupuesto",
    "económico",
    "economico",
    "barato",
    "barata",
    "hasta",
    "dólares",
    "dolares",
    "$",
  ],
  "available-ingredients": [
    "tengo",
    "dispongo",
    "me queda",
    "ingredientes",
    "con lo que tengo",
    "en casa",
  ],
  "quick-meal": [
    "rápido",
    "rapido",
    "rápida",
    "rapida",
    "poco tiempo",
    "express",
    "20 minutos",
    "30 minutos",
  ],
  "family-meal": [
    "familia",
    "familiar",
    "niños",
    "ninos",
    "personas",
    "porciones",
    "somos",
  ],
  dietary: [
    "vegetariano",
    "vegetariana",
    "vegano",
    "vegana",
    "sin gluten",
    "sin lácteos",
    "sin lacteos",
    "sin leche",
    "proteína",
    "proteina",
    "calorías",
    "calorias",
  ],
  recommendation: [
    "recomienda",
    "recomendación",
    "recomendacion",
    "qué puedo cocinar",
    "que puedo cocinar",
    "qué preparo",
    "que preparo",
    "ideas",
    "sugiéreme",
    "sugiereme",
  ],
  unknown: [],
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s$.,-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function extractPortions(query: string): number {
  for (const pattern of PORTION_PATTERNS) {
    const match = query.match(pattern);

    if (match?.[1]) {
      const portions = Number(match[1]);

      if (Number.isFinite(portions) && portions > 0) {
        return Math.min(Math.max(portions, 1), 20);
      }
    }
  }

  return DEFAULT_PORTIONS;
}

function extractBudget(query: string): number | null {
  for (const pattern of BUDGET_PATTERNS) {
    const match = query.match(pattern);

    if (match?.[1]) {
      const normalizedValue = match[1].replace(",", ".");
      const budget = Number(normalizedValue);

      if (Number.isFinite(budget) && budget > 0) {
        return budget;
      }
    }
  }

  return null;
}

function extractDietaryPreferences(
  normalizedQuery: string
): ChefDietaryTag[] {
  const preferences: ChefDietaryTag[] = [];

  for (const [keyword, tag] of Object.entries(
    DIETARY_KEYWORDS
  )) {
    const normalizedKeyword = normalizeText(keyword);

    if (normalizedQuery.includes(normalizedKeyword)) {
      preferences.push(tag);
    }
  }

  return uniqueStrings(preferences);
}

function detectIntent(normalizedQuery: string): ChefIntent {
  const scores = new Map<ChefIntent, number>();

  for (const [intent, keywords] of Object.entries(
    INTENT_KEYWORDS
  ) as [ChefIntent, string[]][]) {
    if (intent === "unknown") {
      continue;
    }

    const score = keywords.reduce((total, keyword) => {
      const normalizedKeyword = normalizeText(keyword);

      return normalizedQuery.includes(normalizedKeyword)
        ? total + 1
        : total;
    }, 0);

    scores.set(intent, score);
  }

  const sortedScores = Array.from(scores.entries()).sort(
    (first, second) => second[1] - first[1]
  );

  const [bestIntent, bestScore] =
    sortedScores[0] ?? ["unknown", 0];

  return bestScore > 0 ? bestIntent : "unknown";
}

function extractRecipeName(
  normalizedQuery: string
): string | null {
  const knownRecipeNames = [
    "locro de papa",
    "locro",
    "fanesca",
    "encebollado",
    "hornado",
    "seco de pollo",
    "arroz con pollo",
    "sopa de verduras",
    "ensalada",
  ];

  const match = knownRecipeNames.find((recipeName) =>
    normalizedQuery.includes(recipeName)
  );

  return match ?? null;
}

function extractKeywords(normalizedQuery: string): string[] {
  const ignoredWords = new Set([
    "quiero",
    "deseo",
    "para",
    "personas",
    "persona",
    "porciones",
    "porcion",
    "hacer",
    "preparar",
    "cocinar",
    "receta",
    "algo",
    "comida",
    "plato",
    "hoy",
    "una",
    "uno",
    "unos",
    "unas",
    "con",
    "sin",
    "que",
    "qué",
    "como",
    "cómo",
    "tengo",
    "somos",
    "mi",
    "familia",
  ]);

  return uniqueStrings(
    normalizedQuery
      .split(" ")
      .map((word) => word.trim())
      .filter(
        (word) =>
          word.length >= 3 &&
          !ignoredWords.has(word) &&
          !/^\d+(?:[.,]\d+)?$/.test(word)
      )
  );
}

function extractAvailableIngredients(
  normalizedQuery: string
): string[] {
  const markers = [
    "tengo ",
    "dispongo de ",
    "me queda ",
    "en casa tengo ",
  ];

  const marker = markers.find((item) =>
    normalizedQuery.includes(item)
  );

  if (!marker) {
    return [];
  }

  const content = normalizedQuery
    .split(marker)[1]
    ?.split(
      /(?:para|y quiero|quiero|necesito|presupuesto|somos)/
    )[0];

  if (!content) {
    return [];
  }

  return uniqueStrings(
    content
      .split(/,| y | con /)
      .map((item) => item.trim())
      .filter((item) => item.length >= 3)
  );
}

function parseInstructions(value: unknown): ChefInstruction[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (
        typeof item !== "object" ||
        item === null
      ) {
        return null;
      }

      const row = item as Record<string, unknown>;

      return {
        step:
          typeof row.step === "number"
            ? row.step
            : index + 1,
        title:
          typeof row.title === "string"
            ? row.title
            : `Paso ${index + 1}`,
        description:
          typeof row.description === "string"
            ? row.description
            : "",
      };
    })
    .filter(
      (item): item is ChefInstruction =>
        item !== null
    );
}

function parseNutritionalInformation(
  value: unknown
): ChefNutritionalInformation {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return {};
  }

  return value as ChefNutritionalInformation;
}

function mapRecipeRow(row: ChefRecipeRow): ChefRecipe {
  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    short_description: row.short_description,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    preparation_time_minutes: Number(
      row.preparation_time_minutes
    ),
    cooking_time_minutes: Number(
      row.cooking_time_minutes
    ),
    default_portions: Number(row.default_portions),
    minimum_portions: Number(row.minimum_portions),
    maximum_portions: Number(row.maximum_portions),
    image: row.image,
    instructions: parseInstructions(row.instructions),
    nutritional_information:
      parseNutritionalInformation(
        row.nutritional_information
      ),
    tags: row.tags ?? [],
    dietary_tags: row.dietary_tags ?? [],
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function resolveRelationProduct(
  relationProduct:
    | ChefRecipeIngredientRelationRow["product"]
): ChefCatalogProduct | null {
  if (!relationProduct) {
    return null;
  }

  const rawProduct = Array.isArray(relationProduct)
    ? relationProduct[0]
    : relationProduct;

  if (!rawProduct) {
    return null;
  }

  return {
    id: Number(rawProduct.id),
    slug: rawProduct.slug,
    name: rawProduct.name,
    category: rawProduct.category,
    image: rawProduct.image,
    price: Number(rawProduct.price ?? 0),
    old_price:
      rawProduct.old_price === null
        ? null
        : Number(rawProduct.old_price),
    unit: rawProduct.unit,
    approx: rawProduct.approx,
    stock: Boolean(rawProduct.stock),
    description: rawProduct.description,
    delivery: rawProduct.delivery,
  };
}

function calculateCatalogQuantity(
  scaledQuantity: number,
  product: ChefCatalogProduct | null
): number {
  if (!product || scaledQuantity <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(scaledQuantity));
}

function resolveIngredient(
  ingredient: ChefRecipeIngredientRelationRow,
  requestedPortions: number,
  defaultPortions: number
): ChefResolvedIngredient {
  const product = resolveRelationProduct(
    ingredient.product
  );

  const portionFactor =
    defaultPortions > 0
      ? requestedPortions / defaultPortions
      : 1;

  const scaledQuantity =
    Number(ingredient.quantity ?? 0) * portionFactor;

  const catalogQuantity = calculateCatalogQuantity(
    scaledQuantity,
    product
  );

  const estimatedPrice =
    product && product.stock
      ? product.price * catalogQuantity
      : 0;

  let resolutionStatus: ChefResolvedIngredient["resolution_status"] =
    "missing";

  if (product && product.stock) {
    resolutionStatus = ingredient.product_id
      ? "linked"
      : "matched";
  } else if (product && !product.stock) {
    resolutionStatus = "unavailable";
  }

  return {
    id: Number(ingredient.id),
    recipe_id: Number(ingredient.recipe_id),
    product_id:
      ingredient.product_id === null
        ? null
        : Number(ingredient.product_id),
    ingredient_name: ingredient.ingredient_name,
    search_terms: ingredient.search_terms ?? [],
    quantity: Number(ingredient.quantity),
    measurement_unit: ingredient.measurement_unit,
    optional: Boolean(ingredient.optional),
    notes: ingredient.notes,
    sort_order: Number(ingredient.sort_order),
    created_at: ingredient.created_at,
    updated_at: ingredient.updated_at,
    scaled_quantity: Number(
      scaledQuantity.toFixed(3)
    ),
    product,
    available: Boolean(product?.stock),
    estimated_price: Number(
      estimatedPrice.toFixed(2)
    ),
    catalog_quantity: catalogQuantity,
    resolution_status: resolutionStatus,
  };
}

function calculateRecipeScore(
  recipe: ChefRecipeWithIngredients,
  interpretation: ChefAssistantInterpretation
): {
  score: number;
  reasons: string[];
} {
  const normalizedName = normalizeText(recipe.name);
  const normalizedDescription = normalizeText(
    [
      recipe.short_description,
      recipe.description,
      recipe.category,
      ...recipe.tags,
      ...recipe.dietary_tags,
    ]
      .filter(Boolean)
      .join(" ")
  );

  let score = 0;
  const reasons: string[] = [];

  if (
    interpretation.requested_recipe &&
    normalizedName.includes(
      normalizeText(interpretation.requested_recipe)
    )
  ) {
    score += 100;
    reasons.push(
      "Coincide con la receta solicitada."
    );
  }

  const keywordMatches =
    interpretation.keywords.filter(
      (keyword) =>
        normalizedName.includes(keyword) ||
        normalizedDescription.includes(keyword)
    );

  if (keywordMatches.length > 0) {
    score += keywordMatches.length * 12;
    reasons.push(
      `Relacionada con: ${keywordMatches.join(", ")}.`
    );
  }

  if (recipe.featured) {
    score += 8;
    reasons.push(
      "Es una recomendación destacada de Chef MercaNova GO."
    );
  }

  if (
    interpretation.intent === "quick-meal" &&
    recipe.preparation_time_minutes +
      recipe.cooking_time_minutes <=
      45
  ) {
    score += 20;
    reasons.push(
      "Tiene un tiempo de preparación conveniente."
    );
  }

  if (
    interpretation.intent === "budget" &&
    interpretation.maximum_budget !== null &&
    recipe.estimated_cost <=
      interpretation.maximum_budget
  ) {
    score += 30;
    reasons.push(
      "Se ajusta al presupuesto indicado."
    );
  }

  if (
    interpretation.dietary_preferences.length > 0
  ) {
    const recipeDietaryTags = recipe.dietary_tags.map(
      (tag) => normalizeText(tag)
    );

    const dietaryMatches =
      interpretation.dietary_preferences.filter(
        (preference) =>
          recipeDietaryTags.includes(
            normalizeText(preference)
          )
      );

    if (
      dietaryMatches.length ===
      interpretation.dietary_preferences.length
    ) {
      score += 30;
      reasons.push(
        "Cumple las preferencias alimentarias indicadas."
      );
    } else {
      score -= 30;
    }
  }

  if (
    interpretation.available_ingredients.length > 0
  ) {
    const recipeIngredients = recipe.ingredients.map(
      (ingredient) =>
        normalizeText(ingredient.ingredient_name)
    );

    const matchingAvailableIngredients =
      interpretation.available_ingredients.filter(
        (availableIngredient) =>
          recipeIngredients.some(
            (recipeIngredient) =>
              recipeIngredient.includes(
                normalizeText(availableIngredient)
              ) ||
              normalizeText(
                availableIngredient
              ).includes(recipeIngredient)
          )
      );

    if (matchingAvailableIngredients.length > 0) {
      score +=
        matchingAvailableIngredients.length * 10;

      reasons.push(
        "Aprovecha ingredientes que el cliente ya tiene."
      );
    }
  }

  const availabilityPercentage =
    recipe.ingredients.length > 0
      ? recipe.available_ingredients_count /
        recipe.ingredients.length
      : 0;

  score += Math.round(availabilityPercentage * 20);

  if (availabilityPercentage === 1) {
    reasons.push(
      "Todos los ingredientes están disponibles."
    );
  } else if (availabilityPercentage >= 0.7) {
    reasons.push(
      "La mayoría de ingredientes está disponible."
    );
  }

  return {
    score,
    reasons: uniqueStrings(reasons),
  };
}

function buildInterpretation(
  request: ChefAssistantRequest
): ChefAssistantInterpretation {
  const originalQuery = request.query.trim();
  const normalizedQuery = normalizeText(originalQuery);

  const detectedPortions =
    request.portions && request.portions > 0
      ? request.portions
      : extractPortions(originalQuery);

  const detectedBudget =
    request.maximum_budget !== undefined
      ? request.maximum_budget
      : extractBudget(originalQuery);

  const detectedDietaryPreferences =
    request.dietary_preferences &&
    request.dietary_preferences.length > 0
      ? request.dietary_preferences
      : extractDietaryPreferences(normalizedQuery);

  const availableIngredients =
    request.available_ingredients &&
    request.available_ingredients.length > 0
      ? request.available_ingredients
      : extractAvailableIngredients(normalizedQuery);

  return {
    original_query: originalQuery,
    normalized_query: normalizedQuery,
    intent: detectIntent(normalizedQuery),
    requested_recipe:
      extractRecipeName(normalizedQuery),
    requested_portions: Math.min(
      Math.max(detectedPortions, 1),
      20
    ),
    maximum_budget: detectedBudget ?? null,
    available_ingredients: uniqueStrings(
      availableIngredients
    ),
    excluded_ingredients: uniqueStrings(
      request.excluded_ingredients ?? []
    ),
    dietary_preferences: uniqueStrings(
      detectedDietaryPreferences
    ),
    keywords: extractKeywords(normalizedQuery),
  };
}

async function fetchActiveRecipes(): Promise<
  ChefRecipe[]
> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error(
      "Error consultando recetas:",
      error
    );

    throw new Error(
      "No fue posible consultar las recetas."
    );
  }

  return ((data ?? []) as ChefRecipeRow[]).map(
    mapRecipeRow
  );
}

async function fetchRecipeIngredients(
  recipeId: number
): Promise<ChefRecipeIngredientRelationRow[]> {
  const { data, error } = await supabase
    .from("recipe_ingredients")
    .select(
      `
        id,
        recipe_id,
        product_id,
        ingredient_name,
        search_terms,
        quantity,
        measurement_unit,
        optional,
        notes,
        sort_order,
        created_at,
        updated_at,
        product:products (
          id,
          slug,
          name,
          category,
          image,
          price,
          old_price,
          unit,
          approx,
          stock,
          description,
          delivery
        )
      `
    )
    .eq("recipe_id", recipeId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(
      `Error consultando ingredientes de la receta ${recipeId}:`,
      error
    );

    throw new Error(
      "No fue posible consultar los ingredientes de la receta."
    );
  }

  return (
    (data ?? []) as ChefRecipeIngredientRelationRow[]
  );
}

async function buildRecipeWithIngredients(
  recipe: ChefRecipe,
  requestedPortions: number
): Promise<ChefRecipeWithIngredients> {
  const ingredientRows =
    await fetchRecipeIngredients(recipe.id);

  const resolvedIngredients = ingredientRows.map(
    (ingredient) =>
      resolveIngredient(
        ingredient,
        requestedPortions,
        recipe.default_portions
      )
  );

  const estimatedCost = resolvedIngredients.reduce(
    (total, ingredient) =>
      total + ingredient.estimated_price,
    0
  );

  const availableIngredientsCount =
    resolvedIngredients.filter(
      (ingredient) => ingredient.available
    ).length;

  const unavailableIngredientsCount =
    resolvedIngredients.length -
    availableIngredientsCount;

  return {
    ...recipe,
    ingredients: resolvedIngredients,
    requested_portions: requestedPortions,
    estimated_cost: Number(
      estimatedCost.toFixed(2)
    ),
    estimated_cost_per_portion:
      requestedPortions > 0
        ? Number(
            (
              estimatedCost / requestedPortions
            ).toFixed(2)
          )
        : 0,
    available_ingredients_count:
      availableIngredientsCount,
    unavailable_ingredients_count:
      unavailableIngredientsCount,
  };
}

function buildRecommendation(
  recipe: ChefRecipeWithIngredients,
  interpretation: ChefAssistantInterpretation
): ChefRecipeRecommendation {
  const { score, reasons } = calculateRecipeScore(
    recipe,
    interpretation
  );

  const fitsBudget =
    interpretation.maximum_budget === null ||
    recipe.estimated_cost <=
      interpretation.maximum_budget;

  const normalizedDietaryTags =
    recipe.dietary_tags.map((tag) =>
      normalizeText(tag)
    );

  const fitsDietaryPreferences =
    interpretation.dietary_preferences.length ===
      0 ||
    interpretation.dietary_preferences.every(
      (preference) =>
        normalizedDietaryTags.includes(
          normalizeText(preference)
        )
    );

  return {
    recipe,
    relevance_score: score,
    reasons,
    fits_budget: fitsBudget,
    fits_dietary_preferences:
      fitsDietaryPreferences,
  };
}

function buildResponseMessage(
  recommendations: ChefRecipeRecommendation[],
  interpretation: ChefAssistantInterpretation
): string {
  if (recommendations.length === 0) {
    return "No encontramos una receta compatible con tu consulta. Prueba escribiendo un plato, presupuesto o ingredientes disponibles.";
  }

  const primaryRecommendation =
    recommendations[0];

  if (
    interpretation.maximum_budget !== null &&
    !primaryRecommendation.fits_budget
  ) {
    return `Encontramos opciones relacionadas, pero la recomendación principal supera el presupuesto de $${interpretation.maximum_budget.toFixed(
      2
    )}.`;
  }

  if (
    interpretation.dietary_preferences.length > 0 &&
    !primaryRecommendation.fits_dietary_preferences
  ) {
    return "Encontramos recetas relacionadas, pero ninguna cumple completamente las preferencias alimentarias indicadas.";
  }

  return `Chef MercaNova GO recomienda ${primaryRecommendation.recipe.name} para ${interpretation.requested_portions} personas.`;
}

export async function getChefRecommendations(
  request: ChefAssistantRequest
): Promise<ChefAssistantResponse> {
  const interpretation = buildInterpretation(
    request
  );

  if (!interpretation.original_query) {
    return {
      success: false,
      message:
        "Escribe qué deseas preparar, tu presupuesto o los ingredientes que tienes disponibles.",
      interpretation,
      recommendations: [],
      primary_recommendation: null,
      generated_at: new Date().toISOString(),
    };
  }

  try {
    const recipes = await fetchActiveRecipes();

    if (recipes.length === 0) {
      return {
        success: false,
        message:
          "Chef MercaNova GO todavía no tiene recetas activas disponibles.",
        interpretation,
        recommendations: [],
        primary_recommendation: null,
        generated_at: new Date().toISOString(),
      };
    }

    const recipesWithIngredients =
      await Promise.all(
        recipes.map((recipe) =>
          buildRecipeWithIngredients(
            recipe,
            interpretation.requested_portions
          )
        )
      );

    const recommendations =
      recipesWithIngredients
        .map((recipe) =>
          buildRecommendation(
            recipe,
            interpretation
          )
        )
        .filter((recommendation) => {
          if (
            interpretation.excluded_ingredients
              .length === 0
          ) {
            return true;
          }

          const recipeIngredientNames =
            recommendation.recipe.ingredients.map(
              (ingredient) =>
                normalizeText(
                  ingredient.ingredient_name
                )
            );

          return !interpretation.excluded_ingredients.some(
            (excludedIngredient) =>
              recipeIngredientNames.some(
                (recipeIngredient) =>
                  recipeIngredient.includes(
                    normalizeText(
                      excludedIngredient
                    )
                  )
              )
          );
        })
        .sort(
          (first, second) =>
            second.relevance_score -
            first.relevance_score
        )
        .slice(0, MAX_RECOMMENDATIONS);

    const primaryRecommendation =
      recommendations[0] ?? null;

    return {
      success: recommendations.length > 0,
      message: buildResponseMessage(
        recommendations,
        interpretation
      ),
      interpretation,
      recommendations,
      primary_recommendation:
        primaryRecommendation,
      generated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      "Error en Chef MercaNova GO:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Chef MercaNova GO no pudo procesar la consulta.",
      interpretation,
      recommendations: [],
      primary_recommendation: null,
      generated_at: new Date().toISOString(),
    };
  }
}

export async function getChefRecipeBySlug(
  slug: string,
  portions = DEFAULT_PORTIONS
): Promise<ChefRecipeWithIngredients | null> {
  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    return null;
  }

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("slug", normalizedSlug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error(
      "Error consultando receta por slug:",
      error
    );

    throw new Error(
      "No fue posible consultar la receta."
    );
  }

  if (!data) {
    return null;
  }

  const recipe = mapRecipeRow(
    data as ChefRecipeRow
  );

  const requestedPortions = Math.min(
    Math.max(portions, recipe.minimum_portions),
    recipe.maximum_portions
  );

  return buildRecipeWithIngredients(
    recipe,
    requestedPortions
  );
}

export async function getFeaturedChefRecipes(
  limit = 6
): Promise<ChefRecipe[]> {
  const safeLimit = Math.min(
    Math.max(limit, 1),
    20
  );

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("active", true)
    .eq("featured", true)
    .order("name", { ascending: true })
    .limit(safeLimit);

  if (error) {
    console.error(
      "Error consultando recetas destacadas:",
      error
    );

    throw new Error(
      "No fue posible consultar las recetas destacadas."
    );
  }

  return ((data ?? []) as ChefRecipeRow[]).map(
    mapRecipeRow
  );
}