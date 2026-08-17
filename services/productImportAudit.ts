import { tryCreateAuditLog } from "@/services/auditLog";

import type {
  BulkImportResult,
} from "@/types/adminProduct";

import type {
  ProductImportPlan,
} from "@/types/productImportPlan";

interface RegisterProductImportAuditParams {
  plan: ProductImportPlan;
  result: BulkImportResult;
  startedAt: number;
}

function getImportStatus(
  result: BulkImportResult
): "success" | "partial" | "failed" {
  if (
    result.failed > 0 &&
    result.imported === 0
  ) {
    return "failed";
  }

  if (result.failed > 0) {
    return "partial";
  }

  return "success";
}

function getImportSummary(
  plan: ProductImportPlan,
  result: BulkImportResult
): string {
  if (
    result.failed > 0 &&
    result.imported === 0
  ) {
    return `La importación del archivo "${plan.fileName}" no pudo completarse.`;
  }

  if (result.failed > 0) {
    return `La importación del archivo "${plan.fileName}" se completó parcialmente.`;
  }

  return `Se procesó correctamente la importación del archivo "${plan.fileName}".`;
}

export async function registerProductImportAudit({
  plan,
  result,
  startedAt,
}: RegisterProductImportAuditParams): Promise<void> {
  const finishedAt = Date.now();

  const executableRows =
    plan.rows.filter(
      (row) =>
        row.selected &&
        row.errors.length === 0 &&
        row.action !== "skip"
    );

  const createdRows =
    executableRows.filter(
      (row) =>
        row.action === "create"
    );

  const updatedRows =
    executableRows.filter(
      (row) =>
        row.action === "update"
    );

  const skippedRows =
    plan.rows.filter(
      (row) =>
        row.action === "skip" ||
        !row.selected
    );

  await tryCreateAuditLog({
    module: "catalog",
    entity: "product_import",
    action: "import",
    status: getImportStatus(result),

    summary: getImportSummary(
      plan,
      result
    ),

    newValues: {
      fileName: plan.fileName,
      totalRows: plan.totalRows,
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
      failed: result.failed,
    },

    metadata: {
      fileName: plan.fileName,

      totalRows:
        plan.totalRows,

      newRows:
        plan.newRows,

      exactMatchRows:
        plan.exactMatchRows,

      strongMatchRows:
        plan.strongMatchRows,

      possibleMatchRows:
        plan.possibleMatchRows,

      requestedCreates:
        createdRows.length,

      requestedUpdates:
        updatedRows.length,

      requestedSkips:
        skippedRows.length,

      created:
        result.created,

      updated:
        result.updated,

      skipped:
        result.skipped,

      failed:
        result.failed,

      imported:
        result.imported,

      createdProducts:
        createdRows.map(
          (row) => ({
            rowNumber:
              row.rowNumber,

            name:
              row.data.name,

            slug:
              row.data.slug,

            category:
              row.data.category,

            price:
              row.data.price,
          })
        ),

      updatedProducts:
        updatedRows.map(
          (row) => ({
            rowNumber:
              row.rowNumber,

            productId:
              row.matchedProduct?.id ??
              null,

            name:
              row.data.name,

            currentSlug:
              row.matchedProduct?.slug ??
              null,

            previousPrice:
              row.matchedProduct?.price ??
              null,

            importedPrice:
              row.data.price,

            confidence:
              row.duplicateAnalysis
                .confidence,
          })
        ),

      skippedProducts:
        skippedRows.map(
          (row) => ({
            rowNumber:
              row.rowNumber,

            name:
              row.data.name,

            reason:
              row.errors.length > 0
                ? "validation_error"
                : row.decisionStatus ===
                    "review"
                  ? "pending_review"
                  : "manually_skipped",

            matchType:
              row.duplicateAnalysis
                .matchType,

            confidence:
              row.duplicateAnalysis
                .confidence,
          })
        ),

      errors:
        result.errors,
    },

    errorMessage:
      result.errors.length > 0
        ? result.errors.join(" | ")
        : null,

    durationMs:
      Math.max(
        0,
        finishedAt - startedAt
      ),
  });
}