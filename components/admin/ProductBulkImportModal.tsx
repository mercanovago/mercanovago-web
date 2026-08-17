"use client";

import {
  ChangeEvent,
  DragEvent,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  downloadProductImportTemplate,
  executeProductImportPlan,
  parseProductImportFile,
} from "@/services/adminProductImport";

import {
  createProductImportPlan,
  updatePlannedProductAction,
} from "@/services/productImportPlanner";

import {
  registerProductImportAudit,
} from "@/services/productImportAudit";

import type {
  AdminProductRecord,
  BulkImportResult,
} from "@/types/adminProduct";

import type {
  ProductImportAction,
  ProductDuplicateMatchType,
} from "@/types/duplicateDetection";

import type {
  PlannedProductImportRow,
  ProductImportPlan,
} from "@/types/productImportPlan";

interface ProductBulkImportModalProps {
  open: boolean;
  products: AdminProductRecord[];
  onClose: () => void;
  onImported: () => Promise<void> | void;
}

export default function ProductBulkImportModal({
  open,
  products,
  onClose,
  onImported,
}: ProductBulkImportModalProps) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [dragging, setDragging] =
    useState(false);

  const [
    processingFile,
    setProcessingFile,
  ] = useState(false);

  const [importing, setImporting] =
    useState(false);

  const [
    downloadingTemplate,
    setDownloadingTemplate,
  ] = useState(false);

  const [importPlan, setImportPlan] =
    useState<ProductImportPlan | null>(
      null
    );

  const [importResult, setImportResult] =
    useState<BulkImportResult | null>(
      null
    );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const executableRows = useMemo(
    () =>
      importPlan?.rows.filter(
        (row) =>
          row.selected &&
          row.errors.length === 0 &&
          row.action !== "skip"
      ).length ?? 0,
    [importPlan]
  );

  const reviewRows = useMemo(
    () =>
      importPlan?.rows.filter(
        (row) =>
          row.decisionStatus === "review"
      ).length ?? 0,
    [importPlan]
  );

  if (!open) {
    return null;
  }

  function resetState() {
    setDragging(false);
    setProcessingFile(false);
    setImporting(false);
    setImportPlan(null);
    setImportResult(null);
    setErrorMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    if (
      processingFile ||
      importing
    ) {
      return;
    }

    resetState();
    onClose();
  }

  async function processFile(
    file: File
  ) {
    try {
      setProcessingFile(true);
      setErrorMessage("");
      setImportResult(null);

      const parseResult =
        await parseProductImportFile(
          file,
          products
        );

      const plan =
        createProductImportPlan({
          parseResult,
          currentProducts: products,
        });

      setImportPlan(plan);
    } catch (error) {
      console.error(
        "Error procesando archivo Excel:",
        error
      );

      setImportPlan(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible procesar el archivo Excel."
      );
    } finally {
      setProcessingFile(false);
    }
  }

  function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    void processFile(file);
  }

  function handleDragOver(
    event:
      DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(
    event:
      DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragging(false);
  }

  function handleDrop(
    event:
      DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    void processFile(file);
  }

  function handleActionChange(
    rowNumber: number,
    action: ProductImportAction
  ) {
    setImportPlan(
      (currentPlan) => {
        if (!currentPlan) {
          return currentPlan;
        }

        return updatePlannedProductAction(
          currentPlan,
          rowNumber,
          action
        );
      }
    );
  }

  async function handleImport() {
    if (
      !importPlan ||
      executableRows === 0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Se crearán ${importPlan.createRows} productos y se actualizarán ${importPlan.updateRows}. ¿Deseas continuar?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setImporting(true);
      setErrorMessage("");
      setImportResult(null);

      const startedAt = Date.now();

      const result =
        await executeProductImportPlan(
          importPlan
        );

      await registerProductImportAudit({
        plan: importPlan,
        result,
        startedAt,
      });

      setImportResult(result);

      if (result.imported > 0) {
        await onImported();
      }
    } catch (error) {
      console.error(
        "Error ejecutando importación:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible completar la importación."
      );
    } finally {
      setImporting(false);
    }
  }

  async function handleDownloadTemplate() {
    try {
      setDownloadingTemplate(true);
      setErrorMessage("");

      await downloadProductImportTemplate();
    } catch (error) {
      console.error(
        "Error descargando plantilla:",
        error
      );

      setErrorMessage(
        "No fue posible generar la plantilla de importación."
      );
    } finally {
      setDownloadingTemplate(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/70 px-4 py-6 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex min-h-full max-w-[1500px] items-center justify-center">
        <section className="w-full overflow-hidden rounded-[32px] bg-white shadow-2xl">
          <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-6 text-white sm:px-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-green-400">
                  MercaNova GO
                </p>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  Importación inteligente
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                  Valida productos, detecta coincidencias y decide si crear,
                  actualizar u omitir cada registro.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={
                  processingFile ||
                  importing
                }
                aria-label="Cerrar importación"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl font-black text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>
          </header>

          <div className="max-h-[calc(100vh-110px)] overflow-y-auto p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <div
                onDragOver={
                  handleDragOver
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={handleDrop}
                className={`rounded-3xl border-2 border-dashed p-8 text-center transition ${
                  dragging
                    ? "border-green-500 bg-green-50"
                    : "border-zinc-300 bg-zinc-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />

                <UploadIcon />

                <h3 className="mt-5 text-xl font-black text-zinc-900">
                  Selecciona o arrastra el archivo Excel
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  El sistema comparará el archivo con el catálogo actual.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={
                    processingFile ||
                    importing
                  }
                  className="mt-6 rounded-2xl bg-green-600 px-7 py-3 font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processingFile
                    ? "Analizando archivo..."
                    : "Seleccionar archivo"}
                </button>
              </div>

              <aside className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                  Archivo compatible
                </p>

                <h3 className="mt-2 text-xl font-black text-zinc-900">
                  Plantilla oficial
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Utiliza la plantilla para mantener las columnas y formatos
                  correctos.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void handleDownloadTemplate()
                  }
                  disabled={
                    downloadingTemplate ||
                    importing
                  }
                  className="mt-6 w-full rounded-2xl border border-zinc-300 bg-white px-5 py-3 font-black text-zinc-900 transition hover:border-green-500 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloadingTemplate
                    ? "Generando plantilla..."
                    : "Descargar plantilla Excel"}
                </button>
              </aside>
            </div>

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                {errorMessage}
              </div>
            )}

            {importPlan && (
              <section className="mt-8">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">
                      Análisis inteligente
                    </p>

                    <h3 className="mt-2 text-2xl font-black text-zinc-900">
                      {importPlan.fileName}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Revisa las coincidencias y confirma la acción de cada
                      producto.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
                    <SummaryCard
                      label="Total"
                      value={
                        importPlan.totalRows
                      }
                    />

                    <SummaryCard
                      label="Nuevos"
                      value={
                        importPlan.newRows
                      }
                    />

                    <SummaryCard
                      label="Exactos"
                      value={
                        importPlan.exactMatchRows
                      }
                    />

                    <SummaryCard
                      label="Revisar"
                      value={reviewRows}
                    />

                    <SummaryCard
                      label="Crear"
                      value={
                        importPlan.createRows
                      }
                    />

                    <SummaryCard
                      label="Actualizar"
                      value={
                        importPlan.updateRows
                      }
                    />

                    <SummaryCard
                      label="Omitir"
                      value={
                        importPlan.skippedRows
                      }
                    />
                  </div>
                </div>

                {reviewRows > 0 && (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                    <p className="font-black text-amber-800">
                      Existen {reviewRows} coincidencias que requieren revisión.
                    </p>

                    <p className="mt-1 text-sm text-amber-700">
                      Permanecen omitidas hasta que selecciones una acción.
                    </p>
                  </div>
                )}

                <div className="mt-5 overflow-x-auto rounded-3xl border border-zinc-200">
                  <table className="w-full min-w-[1450px] border-collapse">
                    <thead className="bg-zinc-950 text-left text-xs uppercase tracking-wider text-white">
                      <tr>
                        <th className="px-4 py-4">
                          Fila
                        </th>

                        <th className="px-4 py-4">
                          Estado
                        </th>

                        <th className="px-4 py-4">
                          Producto Excel
                        </th>

                        <th className="px-4 py-4">
                          Coincidencia
                        </th>

                        <th className="px-4 py-4">
                          Confianza
                        </th>

                        <th className="px-4 py-4">
                          Precio Excel
                        </th>

                        <th className="px-4 py-4">
                          Precio actual
                        </th>

                        <th className="px-4 py-4">
                          Acción
                        </th>

                        <th className="px-4 py-4">
                          Observaciones
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {importPlan.rows.map(
                        (row) => (
                          <ProductImportRow
                            key={
                              row.rowNumber
                            }
                            row={row}
                            importing={
                              importing
                            }
                            onActionChange={
                              handleActionChange
                            }
                          />
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {importResult && (
              <section
                className={`mt-8 rounded-3xl border p-6 ${
                  importResult.failed > 0
                    ? "border-amber-200 bg-amber-50"
                    : "border-green-200 bg-green-50"
                }`}
              >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                  Resultado final
                </p>

                <h3 className="mt-2 text-2xl font-black text-zinc-900">
                  {importResult.imported} productos procesados
                </h3>

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  <ResultCard
                    label="Creados"
                    value={
                      importResult.created
                    }
                  />

                  <ResultCard
                    label="Actualizados"
                    value={
                      importResult.updated
                    }
                  />

                  <ResultCard
                    label="Omitidos"
                    value={
                      importResult.skipped
                    }
                  />

                  <ResultCard
                    label="Fallidos"
                    value={
                      importResult.failed
                    }
                  />
                </div>

                {importResult.errors.length > 0 && (
                  <div className="mt-5 space-y-2">
                    {importResult.errors.map(
                      (
                        message,
                        index
                      ) => (
                        <p
                          key={`${message}-${index}`}
                          className="text-sm font-bold text-red-700"
                        >
                          {message}
                        </p>
                      )
                    )}
                  </div>
                )}
              </section>
            )}

            <footer className="mt-8 flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={
                  processingFile ||
                  importing
                }
                className="rounded-2xl border border-zinc-300 bg-white px-7 py-3 font-black text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleImport()
                }
                disabled={
                  !importPlan ||
                  executableRows === 0 ||
                  processingFile ||
                  importing
                }
                className="rounded-2xl bg-green-600 px-8 py-3 font-black text-white shadow-lg transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
              >
                {importing
                  ? "Procesando catálogo..."
                  : `Procesar ${executableRows} productos`}
              </button>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
}

interface ProductImportRowProps {
  row: PlannedProductImportRow;
  importing: boolean;
  onActionChange: (
    rowNumber: number,
    action: ProductImportAction
  ) => void;
}

function ProductImportRow({
  row,
  importing,
  onActionChange,
}: ProductImportRowProps) {
  const matchAppearance =
    getMatchAppearance(
      row.duplicateAnalysis.matchType
    );

  const rowAppearance =
    row.errors.length > 0
      ? "bg-red-50"
      : row.decisionStatus ===
          "review"
        ? "bg-amber-50"
        : row.action === "update"
          ? "bg-blue-50"
          : row.action === "create"
            ? "bg-green-50"
            : "bg-zinc-50";

  return (
    <tr
      className={`border-t border-zinc-200 align-top ${rowAppearance}`}
    >
      <td className="px-4 py-4 text-sm font-black text-zinc-700">
        {row.rowNumber}
      </td>

      <td className="px-4 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${matchAppearance.badge}`}
        >
          {matchAppearance.label}
        </span>
      </td>

      <td className="px-4 py-4">
        <p className="font-black text-zinc-900">
          {row.data.name ||
            "Sin nombre"}
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          {row.data.category}
        </p>

        <p className="mt-1 text-xs text-zinc-400">
          {row.data.unit}
        </p>
      </td>

      <td className="px-4 py-4">
        {row.matchedProduct ? (
          <>
            <p className="font-black text-zinc-900">
              {
                row.matchedProduct
                  .name
              }
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {
                row.matchedProduct
                  .category
              }
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              ID:{" "}
              {
                row.matchedProduct
                  .id
              }
            </p>
          </>
        ) : (
          <p className="text-sm font-bold text-green-700">
            Sin coincidencia
          </p>
        )}
      </td>

      <td className="px-4 py-4">
        <p className="text-lg font-black text-zinc-900">
          {
            row.duplicateAnalysis
              .confidence
          }
          %
        </p>

        <p className="mt-1 max-w-[240px] text-xs leading-5 text-zinc-500">
          {
            row.duplicateAnalysis
              .summary
          }
        </p>
      </td>

      <td className="px-4 py-4 text-lg font-black text-green-700">
        $
        {Number(
          row.data.price
        ).toFixed(2)}
      </td>

      <td className="px-4 py-4">
        {row.matchedProduct ? (
          <p className="text-lg font-black text-zinc-900">
            $
            {Number(
              row.matchedProduct
                .price
            ).toFixed(2)}
          </p>
        ) : (
          <p className="text-sm text-zinc-400">
            —
          </p>
        )}
      </td>

      <td className="px-4 py-4">
        <select
          value={row.action}
          disabled={
            row.errors.length > 0 ||
            importing
          }
          onChange={(event) =>
            onActionChange(
              row.rowNumber,
              event.target
                .value as ProductImportAction
            )
          }
          className="min-w-[180px] rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-black text-zinc-900 outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:bg-zinc-200"
        >
          <option value="create">
            Crear nuevo
          </option>

          {row.matchedProduct && (
            <option value="update">
              Actualizar existente
            </option>
          )}

          <option value="skip">
            Omitir
          </option>
        </select>
      </td>

      <td className="max-w-[340px] px-4 py-4">
        <div className="space-y-2">
          {row.errors.map(
            (error, index) => (
              <p
                key={`error-${row.rowNumber}-${index}`}
                className="text-xs font-bold leading-5 text-red-700"
              >
                {error.message}
              </p>
            )
          )}

          {row.warnings.map(
            (warning, index) => (
              <p
                key={`warning-${row.rowNumber}-${index}`}
                className="text-xs font-bold leading-5 text-amber-700"
              >
                {warning.message}
              </p>
            )
          )}

          {row.errors.length === 0 &&
            row.warnings.length ===
              0 && (
              <p className="text-xs font-bold text-green-700">
                Sin errores de validación.
              </p>
            )}
        </div>
      </td>
    </tr>
  );
}

function getMatchAppearance(
  matchType: ProductDuplicateMatchType
) {
  if (matchType === "exact") {
    return {
      label:
        "Coincidencia exacta",
      badge:
        "bg-blue-100 text-blue-700",
    };
  }

  if (matchType === "strong") {
    return {
      label:
        "Coincidencia alta",
      badge:
        "bg-amber-100 text-amber-700",
    };
  }

  if (
    matchType === "possible"
  ) {
    return {
      label:
        "Posible duplicado",
      badge:
        "bg-orange-100 text-orange-700",
    };
  }

  return {
    label:
      "Producto nuevo",
    badge:
      "bg-green-100 text-green-700",
  };
}

function UploadIcon() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-8 w-8"
        aria-hidden="true"
      >
        <path
          d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
}

function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="min-w-[105px] rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-zinc-900">
        {value}
      </p>
    </div>
  );
}

interface ResultCardProps {
  label: string;
  value: number;
}

function ResultCard({
  label,
  value,
}: ResultCardProps) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 px-5 py-4">
      <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black text-zinc-950">
        {value}
      </p>
    </div>
  );
}