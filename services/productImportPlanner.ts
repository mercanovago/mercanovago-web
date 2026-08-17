import {
  detectProductDuplicate,
} from "@/services/productDuplicateDetector";

import type {
  ProductDuplicateAnalysis,
  ProductImportAction,
} from "@/types/duplicateDetection";

import type {
  BulkImportPreviewRow,
} from "@/types/adminProduct";

import type {
  CreateProductImportPlanParams,
  PlannedProductImportRow,
  ProductImportDecisionStatus,
  ProductImportPlan,
} from "@/types/productImportPlan";

function getDefaultAction(
  row: BulkImportPreviewRow,
  analysis: ProductDuplicateAnalysis
): ProductImportAction {
  if (row.errors.length > 0) {
    return "skip";
  }

  if (analysis.matchType === "new") {
    return "create";
  }

  if (analysis.matchType === "exact") {
    return "update";
  }

  return "skip";
}

function getDecisionStatus(
  row: BulkImportPreviewRow,
  analysis: ProductDuplicateAnalysis,
  action: ProductImportAction
): ProductImportDecisionStatus {
  if (row.errors.length > 0) {
    return "blocked";
  }

  if (action === "skip") {
    if (
      analysis.matchType === "strong" ||
      analysis.matchType === "possible"
    ) {
      return "review";
    }

    return "skipped";
  }

  if (
    analysis.matchType === "strong" ||
    analysis.matchType === "possible"
  ) {
    return "review";
  }

  return "ready";
}

function createPlannedRow(
  row: BulkImportPreviewRow,
  currentProducts: CreateProductImportPlanParams["currentProducts"]
): PlannedProductImportRow {
  const duplicateAnalysis = detectProductDuplicate(
    row.data,
    currentProducts
  );

  const action = getDefaultAction(
    row,
    duplicateAnalysis
  );

  const decisionStatus = getDecisionStatus(
    row,
    duplicateAnalysis,
    action
  );

  return {
    ...row,
    selected:
      row.errors.length === 0 &&
      action !== "skip",

    duplicateAnalysis,
    action,
    decisionStatus,

    matchedProduct:
      duplicateAnalysis.matchedProduct,
  };
}

export function createProductImportPlan({
  parseResult,
  currentProducts,
}: CreateProductImportPlanParams): ProductImportPlan {
  const rows: PlannedProductImportRow[] =
    parseResult.rows.map((row) =>
      createPlannedRow(row, currentProducts)
    );

  return {
    fileName: parseResult.fileName,
    totalRows: rows.length,

    newRows: rows.filter(
      (row) =>
        row.duplicateAnalysis.matchType === "new"
    ).length,

    exactMatchRows: rows.filter(
      (row) =>
        row.duplicateAnalysis.matchType === "exact"
    ).length,

    strongMatchRows: rows.filter(
      (row) =>
        row.duplicateAnalysis.matchType === "strong"
    ).length,

    possibleMatchRows: rows.filter(
      (row) =>
        row.duplicateAnalysis.matchType === "possible"
    ).length,

    createRows: rows.filter(
      (row) => row.action === "create"
    ).length,

    updateRows: rows.filter(
      (row) => row.action === "update"
    ).length,

    skippedRows: rows.filter(
      (row) => row.action === "skip"
    ).length,

    blockedRows: rows.filter(
      (row) => row.decisionStatus === "blocked"
    ).length,

    rows,
  };
}

export function updatePlannedProductAction(
  plan: ProductImportPlan,
  rowNumber: number,
  action: ProductImportAction
): ProductImportPlan {
  const rows: PlannedProductImportRow[] =
    plan.rows.map(
      (row): PlannedProductImportRow => {
        if (row.rowNumber !== rowNumber) {
          return row;
        }

        if (row.errors.length > 0) {
          return {
            ...row,
            action: "skip",
            selected: false,
            decisionStatus: "blocked",
          };
        }

        if (
          action === "update" &&
          !row.matchedProduct
        ) {
          return {
            ...row,
            action: "create",
            selected: true,
            decisionStatus: "ready",
          };
        }

        return {
          ...row,
          action,
          selected: action !== "skip",

          decisionStatus: getDecisionStatus(
            row,
            row.duplicateAnalysis,
            action
          ),
        };
      }
    );

  return recalculateProductImportPlan(
    plan,
    rows
  );
}

export function updatePlannedRowSelection(
  plan: ProductImportPlan,
  rowNumber: number,
  selected: boolean
): ProductImportPlan {
  const rows: PlannedProductImportRow[] =
    plan.rows.map(
      (row): PlannedProductImportRow => {
        if (row.rowNumber !== rowNumber) {
          return row;
        }

        if (row.errors.length > 0) {
          return {
            ...row,
            selected: false,
            action: "skip",
            decisionStatus: "blocked",
          };
        }

        if (!selected) {
          return {
            ...row,
            selected: false,
            action: "skip",
            decisionStatus: "skipped",
          };
        }

        const restoredAction: ProductImportAction =
          row.duplicateAnalysis.matchType === "new"
            ? "create"
            : row.duplicateAnalysis.matchType === "exact"
              ? "update"
              : "skip";

        return {
          ...row,
          selected: restoredAction !== "skip",
          action: restoredAction,

          decisionStatus: getDecisionStatus(
            row,
            row.duplicateAnalysis,
            restoredAction
          ),
        };
      }
    );

  return recalculateProductImportPlan(
    plan,
    rows
  );
}

export function applyActionToAllPlannedRows(
  plan: ProductImportPlan,
  action: ProductImportAction
): ProductImportPlan {
  const rows: PlannedProductImportRow[] =
    plan.rows.map(
      (row): PlannedProductImportRow => {
        if (row.errors.length > 0) {
          return {
            ...row,
            selected: false,
            action: "skip",
            decisionStatus: "blocked",
          };
        }

        if (
          action === "update" &&
          !row.matchedProduct
        ) {
          return {
            ...row,
            selected: true,
            action: "create",
            decisionStatus: "ready",
          };
        }

        return {
          ...row,
          selected: action !== "skip",
          action,

          decisionStatus: getDecisionStatus(
            row,
            row.duplicateAnalysis,
            action
          ),
        };
      }
    );

  return recalculateProductImportPlan(
    plan,
    rows
  );
}

function recalculateProductImportPlan(
  currentPlan: ProductImportPlan,
  rows: PlannedProductImportRow[]
): ProductImportPlan {
  return {
    ...currentPlan,
    totalRows: rows.length,

    newRows: rows.filter(
      (row) =>
        row.duplicateAnalysis.matchType === "new"
    ).length,

    exactMatchRows: rows.filter(
      (row) =>
        row.duplicateAnalysis.matchType === "exact"
    ).length,

    strongMatchRows: rows.filter(
      (row) =>
        row.duplicateAnalysis.matchType === "strong"
    ).length,

    possibleMatchRows: rows.filter(
      (row) =>
        row.duplicateAnalysis.matchType === "possible"
    ).length,

    createRows: rows.filter(
      (row) => row.action === "create"
    ).length,

    updateRows: rows.filter(
      (row) => row.action === "update"
    ).length,

    skippedRows: rows.filter(
      (row) => row.action === "skip"
    ).length,

    blockedRows: rows.filter(
      (row) =>
        row.decisionStatus === "blocked"
    ).length,

    rows,
  };
}

export function getExecutablePlannedRows(
  plan: ProductImportPlan
): PlannedProductImportRow[] {
  return plan.rows.filter(
    (row) =>
      row.selected &&
      row.errors.length === 0 &&
      row.action !== "skip"
  );
}

export function hasPendingProductReviews(
  plan: ProductImportPlan
): boolean {
  return plan.rows.some(
    (row) =>
      row.decisionStatus === "review"
  );
}