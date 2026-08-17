import {
  GoogleGenAI,
  Type,
} from "@google/genai";

import type {
  CatalogIntelligenceAIProposal,
  CatalogIntelligenceAIRequest,
} from "@/types/catalogIntelligenceAI";

export type CatalogAIErrorCode =
  | "configuration"
  | "authentication"
  | "quota"
  | "model_unavailable"
  | "invalid_response"
  | "provider_error";

export class CatalogAIError extends Error {
  code: CatalogAIErrorCode;
  httpStatus: number;

  constructor(
    code: CatalogAIErrorCode,
    message: string,
    httpStatus: number
  ) {
    super(message);
    this.name = "CatalogAIError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

const MODEL =
  process.env.GEMINI_CATALOG_MODEL?.trim() ||
  "gemini-3.5-flash-lite";

function getGeminiClient(): GoogleGenAI {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new CatalogAIError(
      "configuration",
      "GEMINI_API_KEY no está configurada en el servidor.",
      503
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    commercial_description: {
      type: Type.STRING,
    },
    long_description: {
      type: Type.STRING,
    },
    benefits: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    characteristics: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    storage_instructions: {
      type: Type.STRING,
    },
    storage_temperature: {
      type: Type.STRING,
    },
    shelf_life: {
      type: Type.STRING,
    },
    washing_instructions: {
      type: Type.STRING,
    },
    consumption_instructions: {
      type: Type.STRING,
    },
    chef_notes: {
      type: Type.STRING,
    },
    recipe_tips: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    suggested_uses: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    synonyms: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    search_keywords: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    seasonality: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    seo_title: {
      type: Type.STRING,
    },
    seo_description: {
      type: Type.STRING,
    },
    seo_keywords: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    warnings: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
  },
  required: [
    "commercial_description",
    "long_description",
    "benefits",
    "characteristics",
    "storage_instructions",
    "storage_temperature",
    "shelf_life",
    "washing_instructions",
    "consumption_instructions",
    "chef_notes",
    "recipe_tips",
    "suggested_uses",
    "synonyms",
    "search_keywords",
    "seasonality",
    "seo_title",
    "seo_description",
    "seo_keywords",
    "warnings",
  ],
};

function buildSystemInstruction(): string {
  return `
Eres el motor editorial privado de MercaNova GO, una plataforma local de comercio de alimentos y productos de consumo en Riobamba, Ecuador.

Tu tarea es generar una propuesta editorial específica para UN producto. La propuesta siempre será revisada por una persona antes de guardarse o publicarse.

REGLAS OBLIGATORIAS:

1. Escribe en español natural, comercial, claro y profesional.
2. Evita textos genéricos que podrían servir para cualquier producto.
3. Usa únicamente el contexto disponible del producto y conocimiento general seguro.
4. Conserva y mejora información actual válida; no la contradigas.
5. No inventes origen, productor, certificaciones, procedencia geográfica, disponibilidad, promociones ni condiciones de entrega.
6. No generes datos nutricionales ni cifras de nutrientes.
7. No inventes temperaturas exactas, días exactos de vida útil ni tiempos de conservación cuando no estén respaldados por el contexto.
8. No hagas afirmaciones médicas, terapéuticas, preventivas o curativas.
9. En beneficios, prioriza valor culinario, practicidad, versatilidad, sabor, textura, maduración, presentación y usos cotidianos seguros.
10. Si un campo no puede completarse con seguridad, devuelve "" para texto y [] para listas.
11. Usa warnings para advertir qué datos conviene verificar manualmente.
12. seasonality debe ser una lista de textos breves. No inventes meses, estaciones ni épocas concretas si no hay información suficiente.
13. SEO debe sonar natural y útil para una tienda local de Riobamba. Evita repetición artificial de palabras clave.
14. No decidas estado editorial, prioridad comercial, relaciones por IDs ni publicación.
15. No cambies ni inventes la clasificación del producto. Usa exactamente la categoría recibida como contexto.
`.trim();
}

function buildPrompt(
  request: CatalogIntelligenceAIRequest
): string {
  return JSON.stringify(
    {
      task:
        "Generar una propuesta editorial estructurada para el catálogo MercaNova GO.",
      location_context:
        "Riobamba, Ecuador",
      product:
        request.product,
      current_content:
        request.current,
    },
    null,
    2
  );
}

function cleanString(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function cleanStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map(cleanString)
        .filter(Boolean)
    )
  );
}

function normalizeProposal(
  value: Record<string, unknown>
): CatalogIntelligenceAIProposal {
  return {
    commercial_description:
      cleanString(
        value.commercial_description
      ),
    long_description:
      cleanString(
        value.long_description
      ),
    benefits:
      cleanStringArray(
        value.benefits
      ),
    characteristics:
      cleanStringArray(
        value.characteristics
      ),
    storage_instructions:
      cleanString(
        value.storage_instructions
      ),
    storage_temperature:
      cleanString(
        value.storage_temperature
      ),
    shelf_life:
      cleanString(
        value.shelf_life
      ),
    washing_instructions:
      cleanString(
        value.washing_instructions
      ),
    consumption_instructions:
      cleanString(
        value.consumption_instructions
      ),
    chef_notes:
      cleanString(
        value.chef_notes
      ),
    recipe_tips:
      cleanStringArray(
        value.recipe_tips
      ),
    suggested_uses:
      cleanStringArray(
        value.suggested_uses
      ),
    synonyms:
      cleanStringArray(
        value.synonyms
      ),
    search_keywords:
      cleanStringArray(
        value.search_keywords
      ),
    seasonality:
      cleanStringArray(
        value.seasonality
      ),
    seo_title:
      cleanString(
        value.seo_title
      ),
    seo_description:
      cleanString(
        value.seo_description
      ),
    seo_keywords:
      cleanStringArray(
        value.seo_keywords
      ),
    warnings:
      cleanStringArray(
        value.warnings
      ),
  };
}

function getProviderStatus(
  error: unknown
): number | null {
  if (
    error &&
    typeof error === "object" &&
    "status" in error
  ) {
    const status = Number(
      (error as { status?: unknown }).status
    );

    if (Number.isFinite(status)) {
      return status;
    }
  }

  return null;
}

function getProviderMessage(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error ?? "");
}

function translateProviderError(
  error: unknown
): CatalogAIError {
  if (error instanceof CatalogAIError) {
    return error;
  }

  const status =
    getProviderStatus(error);

  const message =
    getProviderMessage(error);

  const normalized =
    message.toLowerCase();

  if (
    status === 401 ||
    status === 403 ||
    normalized.includes("api key not valid") ||
    normalized.includes("permission denied")
  ) {
    return new CatalogAIError(
      "authentication",
      "Gemini rechazó la clave o los permisos del proyecto. Revisa la configuración de la API en Google AI Studio.",
      503
    );
  }

  if (
    status === 429 ||
    normalized.includes("resource_exhausted") ||
    normalized.includes("quota") ||
    normalized.includes("rate limit")
  ) {
    return new CatalogAIError(
      "quota",
      "Se alcanzó temporalmente el límite disponible de Gemini. No se realizó ningún reintento automático para evitar consumo innecesario.",
      429
    );
  }

  if (
    status === 404 ||
    normalized.includes("model") &&
      (
        normalized.includes("not found") ||
        normalized.includes("no longer available") ||
        normalized.includes("not supported")
      )
  ) {
    return new CatalogAIError(
      "model_unavailable",
      `El modelo Gemini configurado (${MODEL}) no está disponible. Revisa GEMINI_CATALOG_MODEL.`,
      503
    );
  }

  return new CatalogAIError(
    "provider_error",
    "Gemini no pudo generar la propuesta en este momento.",
    502
  );
}

export function getCatalogIntelligenceModel(): string {
  return MODEL;
}

export async function generateCatalogIntelligenceProposal(
  request: CatalogIntelligenceAIRequest
): Promise<CatalogIntelligenceAIProposal> {
  const ai =
    getGeminiClient();

  try {
    const response =
      await ai.models.generateContent({
        model: MODEL,

        contents:
          buildPrompt(request),

        config: {
          systemInstruction:
            buildSystemInstruction(),

          responseMimeType:
            "application/json",

          responseSchema:
            RESPONSE_SCHEMA,
        },
      });

    const content =
      response.text?.trim();

    if (!content) {
      throw new CatalogAIError(
        "invalid_response",
        "Gemini devolvió una respuesta vacía.",
        502
      );
    }

    let parsed: unknown;

    try {
      parsed =
        JSON.parse(content);
    } catch {
      throw new CatalogAIError(
        "invalid_response",
        "Gemini devolvió una respuesta que no pudo interpretarse como JSON.",
        502
      );
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      throw new CatalogAIError(
        "invalid_response",
        "Gemini devolvió una estructura de propuesta inválida.",
        502
      );
    }

    return normalizeProposal(
      parsed as Record<
        string,
        unknown
      >
    );
  } catch (error) {
    throw translateProviderError(
      error
    );
  }
}