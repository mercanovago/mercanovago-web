import { NextResponse } from "next/server";

import {
  CatalogAIError,
  generateCatalogIntelligenceProposal,
} from "@/services/catalogIntelligenceAI";

import type {
  CatalogIntelligenceAIErrorResponse,
  CatalogIntelligenceAIRequest,
  CatalogIntelligenceAIResponse,
} from "@/types/catalogIntelligenceAI";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isStringArray(
  value: unknown
): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "string"
    )
  );
}

function isRequestBody(
  value: unknown
): value is CatalogIntelligenceAIRequest {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const candidate =
    value as Partial<CatalogIntelligenceAIRequest>;

  const product =
    candidate.product;

  const current =
    candidate.current;

  if (
    !product ||
    typeof product !== "object" ||
    !current ||
    typeof current !== "object"
  ) {
    return false;
  }

  return (
    Number.isFinite(
      Number(product.id)
    ) &&
    typeof product.slug === "string" &&
    typeof product.name === "string" &&
    typeof product.category === "string" &&
    typeof product.unit === "string" &&
    (
      product.approx === null ||
      typeof product.approx === "string"
    ) &&
    (
      product.description === null ||
      typeof product.description === "string"
    ) &&
    (
      product.origin === null ||
      typeof product.origin === "string"
    ) &&
    (
      product.delivery === null ||
      typeof product.delivery === "string"
    ) &&
    typeof current.commercial_description === "string" &&
    typeof current.long_description === "string" &&
    isStringArray(
      current.benefits
    ) &&
    isStringArray(
      current.characteristics
    ) &&
    typeof current.storage_instructions === "string" &&
    typeof current.storage_temperature === "string" &&
    typeof current.shelf_life === "string" &&
    typeof current.washing_instructions === "string" &&
    typeof current.consumption_instructions === "string" &&
    typeof current.chef_notes === "string" &&
    isStringArray(
      current.recipe_tips
    ) &&
    isStringArray(
      current.suggested_uses
    ) &&
    isStringArray(
      current.synonyms
    ) &&
    isStringArray(
      current.search_keywords
    ) &&
    typeof current.seasonality === "string" &&
    typeof current.seo_title === "string" &&
    typeof current.seo_description === "string" &&
    isStringArray(
      current.seo_keywords
    )
  );
}

function errorResponse(
  error: string,
  status: number,
  detail?: string
) {
  const response:
    CatalogIntelligenceAIErrorResponse = {
    error,
    detail:
      process.env.NODE_ENV === "development"
        ? detail
        : undefined,
  };

  return NextResponse.json(
    response,
    {
      status,
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}

export async function POST(
  request: Request
) {
  try {
    let body: unknown;

    try {
      body =
        await request.json();
    } catch {
      return errorResponse(
        "La solicitud debe contener un JSON válido.",
        400
      );
    }

    if (!isRequestBody(body)) {
      return errorResponse(
        "La solicitud para generar inteligencia de catálogo es inválida.",
        400
      );
    }

    const proposal =
      await generateCatalogIntelligenceProposal(
        body
      );

    const response:
      CatalogIntelligenceAIResponse = {
      proposal,
      generated_at:
        new Date().toISOString(),
    };

    return NextResponse.json(
      response,
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error generando Inteligencia IA del catálogo:",
      error
    );

    if (error instanceof CatalogAIError) {
      return errorResponse(
        error.message,
        error.httpStatus,
        `${error.code}: ${error.message}`
      );
    }

    return errorResponse(
      "No fue posible generar la propuesta de Inteligencia IA.",
      500,
      error instanceof Error
        ? error.message
        : "Error desconocido."
    );
  }
}