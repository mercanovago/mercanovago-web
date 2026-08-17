import ExcelJS from "exceljs";

import { supabase } from "@/lib/supabase";

import type {
  AdminProductRecord,
  BulkImportParseResult,
  BulkImportPreviewRow,
  BulkImportProductData,
  BulkImportResult,
  BulkImportValidationMessage,
} from "@/types/adminProduct";

import type {
  PlannedProductImportRow,
  ProductImportPlan,
} from "@/types/productImportPlan";

const IMPORT_BATCH_SIZE = 100;

type ProductField = keyof BulkImportProductData;

interface ColumnDefinition {
  field: ProductField;
  label: string;
  required: boolean;
  aliases: string[];
}

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  {
    field: "name",
    label: "Nombre",
    required: true,
    aliases: [
      "nombre",
      "name",
      "producto",
      "nombre producto",
    ],
  },
  {
    field: "category",
    label: "Categoría",
    required: true,
    aliases: [
      "categoria",
      "categoría",
      "category",
    ],
  },
  {
    field: "price",
    label: "Precio",
    required: true,
    aliases: [
      "precio",
      "price",
      "precio venta",
      "precio actual",
    ],
  },
  {
    field: "old_price",
    label: "Precio anterior",
    required: false,
    aliases: [
      "precio anterior",
      "old price",
      "old_price",
      "precio regular",
      "precio antes",
    ],
  },
  {
    field: "unit",
    label: "Unidad",
    required: true,
    aliases: [
      "unidad",
      "unit",
      "presentacion",
      "presentación",
    ],
  },
  {
    field: "approx",
    label: "Aproximado",
    required: false,
    aliases: [
      "aproximado",
      "approx",
      "peso aproximado",
      "cantidad aproximada",
    ],
  },
  {
    field: "image",
    label: "Imagen",
    required: false,
    aliases: [
      "imagen",
      "image",
      "foto",
      "url imagen",
      "imagen url",
    ],
  },
  {
    field: "description",
    label: "Descripción",
    required: false,
    aliases: [
      "descripcion",
      "descripción",
      "description",
      "detalle",
    ],
  },
  {
    field: "origin",
    label: "Origen",
    required: false,
    aliases: [
      "origen",
      "origin",
      "procedencia",
    ],
  },
  {
    field: "delivery",
    label: "Entrega",
    required: false,
    aliases: [
      "entrega",
      "delivery",
      "tiempo entrega",
    ],
  },
  {
    field: "badge",
    label: "Etiqueta",
    required: false,
    aliases: [
      "etiqueta",
      "badge",
      "insignia",
    ],
  },
  {
    field: "stock",
    label: "Disponible",
    required: false,
    aliases: [
      "disponible",
      "stock",
      "activo",
      "en stock",
    ],
  },
  {
    field: "featured",
    label: "Destacado",
    required: false,
    aliases: [
      "destacado",
      "featured",
      "recomendado",
    ],
  },
  {
    field: "slug",
    label: "Slug",
    required: false,
    aliases: [
      "slug",
      "url",
      "identificador",
    ],
  },
];

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function getCellValue(
  value: ExcelJS.CellValue
): unknown {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    if (
      "text" in value &&
      typeof value.text === "string"
    ) {
      return value.text;
    }

    if ("result" in value) {
      return value.result ?? "";
    }

    if (
      "richText" in value &&
      Array.isArray(value.richText)
    ) {
      return value.richText
        .map((item) => item.text)
        .join("")
        .trim();
    }

    if (
      "hyperlink" in value &&
      typeof value.hyperlink === "string"
    ) {
      return value.text || value.hyperlink;
    }
  }

  return value;
}

function parseNullableText(
  value: unknown
): string | null {
  const text = normalizeText(value);

  return text.length > 0 ? text : null;
}

function parsePrice(
  value: unknown
): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : null;
  }

  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  const normalized = text
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/,/g, ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function parseBoolean(
  value: unknown,
  defaultValue: boolean
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  const normalized = normalizeHeader(value);

  if (
    [
      "si",
      "sí",
      "true",
      "verdadero",
      "1",
      "activo",
      "disponible",
    ].includes(normalized)
  ) {
    return true;
  }

  if (
    [
      "no",
      "false",
      "falso",
      "0",
      "inactivo",
      "agotado",
    ].includes(normalized)
  ) {
    return false;
  }

  return defaultValue;
}

function createSlug(value: string): string {
  return value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function createUniqueSlug(
  requestedSlug: string,
  productName: string,
  usedSlugs: Set<string>
): string {
  const baseSlug =
    createSlug(requestedSlug || productName) ||
    "producto";

  if (!usedSlugs.has(baseSlug)) {
    usedSlugs.add(baseSlug);

    return baseSlug;
  }

  let suffix = 2;
  let candidate = `${baseSlug}-${suffix}`;

  while (usedSlugs.has(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }

  usedSlugs.add(candidate);

  return candidate;
}

function findColumnMap(
  worksheet: ExcelJS.Worksheet
): Map<ProductField, number> {
  const columnMap =
    new Map<ProductField, number>();

  const headerRow = worksheet.getRow(1);

  headerRow.eachCell(
    { includeEmpty: false },
    (cell, columnNumber) => {
      const normalizedCellValue =
        normalizeHeader(
          getCellValue(cell.value)
        );

      const definition =
        COLUMN_DEFINITIONS.find((item) =>
          item.aliases.some(
            (alias) =>
              normalizeHeader(alias) ===
              normalizedCellValue
          )
        );

      if (
        definition &&
        !columnMap.has(definition.field)
      ) {
        columnMap.set(
          definition.field,
          columnNumber
        );
      }
    }
  );

  return columnMap;
}

function validateRequiredColumns(
  columnMap: Map<ProductField, number>
): void {
  const missingColumns =
    COLUMN_DEFINITIONS.filter(
      (column) =>
        column.required &&
        !columnMap.has(column.field)
    );

  if (missingColumns.length > 0) {
    throw new Error(
      `El archivo no contiene las columnas obligatorias: ${missingColumns
        .map((column) => column.label)
        .join(", ")}.`
    );
  }
}

function readField(
  row: ExcelJS.Row,
  columnMap: Map<ProductField, number>,
  field: ProductField
): unknown {
  const columnNumber =
    columnMap.get(field);

  if (!columnNumber) {
    return "";
  }

  return getCellValue(
    row.getCell(columnNumber).value
  );
}

function rowHasContent(
  row: ExcelJS.Row,
  columnMap: Map<ProductField, number>
): boolean {
  return Array.from(
    columnMap.values()
  ).some((columnNumber) => {
    const value = getCellValue(
      row.getCell(columnNumber).value
    );

    return normalizeText(value).length > 0;
  });
}

function validateProductData(
  data: BulkImportProductData
): {
  errors: BulkImportValidationMessage[];
  warnings: BulkImportValidationMessage[];
} {
  const errors:
    BulkImportValidationMessage[] = [];

  const warnings:
    BulkImportValidationMessage[] = [];

  if (!data.name) {
    errors.push({
      field: "name",
      message:
        "El nombre del producto es obligatorio.",
    });
  }

  if (data.name.length > 150) {
    errors.push({
      field: "name",
      message:
        "El nombre no puede superar los 150 caracteres.",
    });
  }

  if (!data.category) {
    errors.push({
      field: "category",
      message:
        "La categoría es obligatoria.",
    });
  }

  if (
    !Number.isFinite(data.price) ||
    data.price <= 0
  ) {
    errors.push({
      field: "price",
      message:
        "El precio debe ser un número mayor que cero.",
    });
  }

  if (
    data.old_price !== null &&
    (
      !Number.isFinite(data.old_price) ||
      data.old_price <= 0
    )
  ) {
    errors.push({
      field: "old_price",
      message:
        "El precio anterior debe ser mayor que cero.",
    });
  }

  if (
    data.old_price !== null &&
    Number.isFinite(data.old_price) &&
    data.old_price <= data.price
  ) {
    warnings.push({
      field: "old_price",
      message:
        "El precio anterior no es mayor que el precio actual; no se mostrará como oferta.",
    });
  }

  if (!data.unit) {
    errors.push({
      field: "unit",
      message:
        "La unidad o presentación es obligatoria.",
    });
  }

  if (
    data.image &&
    !/^https?:\/\//i.test(data.image)
  ) {
    warnings.push({
      field: "image",
      message:
        "La imagen no parece ser una dirección web válida.",
    });
  }

  if (!data.image) {
    warnings.push({
      field: "image",
      message:
        "El producto será importado sin fotografía.",
    });
  }

  if (!data.description) {
    warnings.push({
      field: "description",
      message:
        "El producto no contiene descripción.",
    });
  }

  return {
    errors,
    warnings,
  };
}

function createProductData(
  row: ExcelJS.Row,
  columnMap: Map<ProductField, number>,
  usedSlugs: Set<string>
): BulkImportProductData {
  const name = normalizeText(
    readField(row, columnMap, "name")
  );

  const requestedSlug = normalizeText(
    readField(row, columnMap, "slug")
  );

  const parsedPrice = parsePrice(
    readField(row, columnMap, "price")
  );

  const parsedOldPrice = parsePrice(
    readField(
      row,
      columnMap,
      "old_price"
    )
  );

  return {
    slug: createUniqueSlug(
      requestedSlug,
      name,
      usedSlugs
    ),

    name,

    category: normalizeText(
      readField(
        row,
        columnMap,
        "category"
      )
    ),

    price: parsedPrice ?? 0,
    old_price: parsedOldPrice,

    unit: normalizeText(
      readField(row, columnMap, "unit")
    ),

    approx: parseNullableText(
      readField(row, columnMap, "approx")
    ),

    image: normalizeText(
      readField(row, columnMap, "image")
    ),

    description: parseNullableText(
      readField(
        row,
        columnMap,
        "description"
      )
    ),

    origin: parseNullableText(
      readField(
        row,
        columnMap,
        "origin"
      )
    ),

    delivery: parseNullableText(
      readField(
        row,
        columnMap,
        "delivery"
      )
    ),

    badge: parseNullableText(
      readField(row, columnMap, "badge")
    ),

    stock: parseBoolean(
      readField(row, columnMap, "stock"),
      true
    ),

    featured: parseBoolean(
      readField(
        row,
        columnMap,
        "featured"
      ),
      false
    ),
  };
}

export async function parseProductImportFile(
  file: File,
  currentProducts: AdminProductRecord[]
): Promise<BulkImportParseResult> {
  const fileExtension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  if (fileExtension !== "xlsx") {
    throw new Error(
      "El archivo debe estar en formato Excel .xlsx."
    );
  }

  const workbook =
    new ExcelJS.Workbook();

  const buffer =
    await file.arrayBuffer();

  await workbook.xlsx.load(buffer);

  const worksheet =
    workbook.worksheets[0];

  if (!worksheet) {
    throw new Error(
      "El archivo Excel no contiene ninguna hoja."
    );
  }

  if (worksheet.rowCount < 2) {
    throw new Error(
      "El archivo no contiene productos para importar."
    );
  }

  const columnMap =
    findColumnMap(worksheet);

  validateRequiredColumns(columnMap);

  /*
   * Conservamos los slugs existentes para evitar
   * colisiones técnicas al crear productos nuevos.
   *
   * La detección comercial se realiza posteriormente
   * mediante productDuplicateDetector.
   */
  const usedSlugs = new Set(
    currentProducts.map(
      (product) => product.slug
    )
  );

  const rows:
    BulkImportPreviewRow[] = [];

  for (
    let rowNumber = 2;
    rowNumber <= worksheet.rowCount;
    rowNumber += 1
  ) {
    const worksheetRow =
      worksheet.getRow(rowNumber);

    if (
      !rowHasContent(
        worksheetRow,
        columnMap
      )
    ) {
      continue;
    }

    const data = createProductData(
      worksheetRow,
      columnMap,
      usedSlugs
    );

    const validation =
      validateProductData(data);

    const status =
      validation.errors.length > 0
        ? "error"
        : validation.warnings.length > 0
          ? "warning"
          : "valid";

    rows.push({
      rowNumber,

      selected:
        validation.errors.length === 0,

      status,
      data,

      errors: validation.errors,
      warnings: validation.warnings,
    });
  }

  if (rows.length === 0) {
    throw new Error(
      "No se encontraron filas con información de productos."
    );
  }

  return {
    fileName: file.name,
    totalRows: rows.length,

    validRows: rows.filter(
      (row) => row.status === "valid"
    ).length,

    warningRows: rows.filter(
      (row) => row.status === "warning"
    ).length,

    errorRows: rows.filter(
      (row) => row.status === "error"
    ).length,

    rows,
  };
}

function splitIntoBatches<T>(
  items: T[],
  batchSize: number
): T[][] {
  const batches: T[][] = [];

  for (
    let index = 0;
    index < items.length;
    index += batchSize
  ) {
    batches.push(
      items.slice(
        index,
        index + batchSize
      )
    );
  }

  return batches;
}

function createProductPayload(
  row: PlannedProductImportRow
) {
  return {
    slug: row.data.slug,
    name: row.data.name,
    category: row.data.category,
    price: row.data.price,
    old_price: row.data.old_price,
    unit: row.data.unit,
    approx: row.data.approx,
    image: row.data.image,
    description: row.data.description,
    origin: row.data.origin,
    delivery: row.data.delivery,
    badge: row.data.badge,
    stock: row.data.stock,
    featured: row.data.featured,
  };
}

async function createPlannedProducts(
  rows: PlannedProductImportRow[]
): Promise<{
  created: number;
  failed: number;
  errors: string[];
}> {
  const batches = splitIntoBatches(
    rows,
    IMPORT_BATCH_SIZE
  );

  let created = 0;
  let failed = 0;

  const errors: string[] = [];

  for (
    let batchIndex = 0;
    batchIndex < batches.length;
    batchIndex += 1
  ) {
    const batch = batches[batchIndex];

    const payload = batch.map(
      createProductPayload
    );

    const { data, error } =
      await supabase
        .from("products")
        .insert(payload)
        .select("id");

    if (error) {
      failed += batch.length;

      errors.push(
        `Creación, lote ${batchIndex + 1}: ${error.message}`
      );

      continue;
    }

    created +=
      data?.length ??
      batch.length;
  }

  return {
    created,
    failed,
    errors,
  };
}

async function updatePlannedProducts(
  rows: PlannedProductImportRow[]
): Promise<{
  updated: number;
  failed: number;
  errors: string[];
}> {
  let updated = 0;
  let failed = 0;

  const errors: string[] = [];

  for (const row of rows) {
    const existingProduct =
      row.matchedProduct;

    if (!existingProduct) {
      failed += 1;

      errors.push(
        `Fila ${row.rowNumber}: no se encontró el producto existente que debía actualizarse.`
      );

      continue;
    }

    /*
     * Conservamos el slug original del producto existente.
     *
     * Esto evita romper enlaces públicos,
     * referencias del carrito y URLs ya publicadas.
     */
    const updatePayload = {
      name: row.data.name,
      category: row.data.category,
      price: row.data.price,
      old_price: row.data.old_price,
      unit: row.data.unit,
      approx: row.data.approx,
      image: row.data.image,
      description: row.data.description,
      origin: row.data.origin,
      delivery: row.data.delivery,
      badge: row.data.badge,
      stock: row.data.stock,
      featured: row.data.featured,
    };

    const { error } =
      await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", existingProduct.id);

    if (error) {
      failed += 1;

      errors.push(
        `Fila ${row.rowNumber}, "${row.data.name}": ${error.message}`
      );

      continue;
    }

    updated += 1;
  }

  return {
    updated,
    failed,
    errors,
  };
}

export async function executeProductImportPlan(
  plan: ProductImportPlan
): Promise<BulkImportResult> {
  const executableRows =
    plan.rows.filter(
      (row) =>
        row.selected &&
        row.errors.length === 0 &&
        row.action !== "skip"
    );

  const createRows =
    executableRows.filter(
      (row) => row.action === "create"
    );

  const updateRows =
    executableRows.filter(
      (row) => row.action === "update"
    );

  const skipped =
    plan.rows.filter(
      (row) =>
        row.action === "skip" ||
        !row.selected
    ).length;

  if (
    createRows.length === 0 &&
    updateRows.length === 0
  ) {
    throw new Error(
      "No existen productos seleccionados para crear o actualizar."
    );
  }

  const createResult =
    await createPlannedProducts(
      createRows
    );

  const updateResult =
    await updatePlannedProducts(
      updateRows
    );

  const created =
    createResult.created;

  const updated =
    updateResult.updated;

  const failed =
    createResult.failed +
    updateResult.failed;

  return {
    imported: created + updated,
    created,
    updated,
    skipped,
    failed,

    errors: [
      ...createResult.errors,
      ...updateResult.errors,
    ],
  };
}

/*
 * Compatibilidad con el flujo anterior.
 *
 * Puede eliminarse en una fase posterior cuando ningún
 * componente utilice la importación directa.
 */
export async function importProductsToSupabase(
  rows: BulkImportPreviewRow[]
): Promise<BulkImportResult> {
  const selectedRows =
    rows.filter(
      (row) =>
        row.selected &&
        row.errors.length === 0
    );

  if (selectedRows.length === 0) {
    throw new Error(
      "No existen productos válidos seleccionados para importar."
    );
  }

  const batches = splitIntoBatches(
    selectedRows,
    IMPORT_BATCH_SIZE
  );

  let created = 0;
  let failed = 0;

  const errors: string[] = [];

  for (
    let batchIndex = 0;
    batchIndex < batches.length;
    batchIndex += 1
  ) {
    const batch =
      batches[batchIndex];

    const payload = batch.map(
      (row) => ({
        slug: row.data.slug,
        name: row.data.name,
        category: row.data.category,
        price: row.data.price,
        old_price: row.data.old_price,
        unit: row.data.unit,
        approx: row.data.approx,
        image: row.data.image,
        description:
          row.data.description,
        origin: row.data.origin,
        delivery: row.data.delivery,
        badge: row.data.badge,
        stock: row.data.stock,
        featured: row.data.featured,
      })
    );

    const { data, error } =
      await supabase
        .from("products")
        .insert(payload)
        .select("id");

    if (error) {
      failed += batch.length;

      errors.push(
        `Lote ${batchIndex + 1}: ${error.message}`
      );

      continue;
    }

    created +=
      data?.length ??
      batch.length;
  }

  return {
    imported: created,
    created,
    updated: 0,
    skipped:
      rows.length -
      selectedRows.length,
    failed,
    errors,
  };
}

export async function downloadProductImportTemplate(): Promise<void> {
  const workbook =
    new ExcelJS.Workbook();

  workbook.creator =
    "MercaNova GO";

  workbook.created =
    new Date();

  const worksheet =
    workbook.addWorksheet("Productos");

  worksheet.columns = [
    {
      header: "Nombre",
      key: "name",
      width: 28,
    },
    {
      header: "Categoría",
      key: "category",
      width: 22,
    },
    {
      header: "Precio",
      key: "price",
      width: 14,
    },
    {
      header: "Precio anterior",
      key: "old_price",
      width: 18,
    },
    {
      header: "Unidad",
      key: "unit",
      width: 20,
    },
    {
      header: "Aproximado",
      key: "approx",
      width: 22,
    },
    {
      header: "Imagen",
      key: "image",
      width: 42,
    },
    {
      header: "Descripción",
      key: "description",
      width: 42,
    },
    {
      header: "Origen",
      key: "origin",
      width: 26,
    },
    {
      header: "Entrega",
      key: "delivery",
      width: 24,
    },
    {
      header: "Etiqueta",
      key: "badge",
      width: 18,
    },
    {
      header: "Disponible",
      key: "stock",
      width: 16,
    },
    {
      header: "Destacado",
      key: "featured",
      width: 16,
    },
    {
      header: "Slug",
      key: "slug",
      width: 28,
    },
  ];

  worksheet.addRow({
    name: "Papa Chola",
    category: "Frutas y verduras",
    price: 1.25,
    old_price: 1.5,
    unit: "Libra",
    approx: "4 a 6 unidades",
    image: "",
    description:
      "Papa seleccionada para sopas, locros y preparaciones tradicionales.",
    origin:
      "Proveedores seleccionados",
    delivery:
      "Entrega programada",
    badge: "Oferta",
    stock: "Sí",
    featured: "Sí",
    slug: "papa-chola",
  });

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  const headerRow =
    worksheet.getRow(1);

  headerRow.font = {
    bold: true,
    color: {
      argb: "FFFFFFFF",
    },
  };

  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "FF16A34A",
    },
  };

  headerRow.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  headerRow.height = 28;

  worksheet.autoFilter = {
    from: "A1",
    to: "N1",
  };

  worksheet.getColumn("C").numFmt =
    "$0.00";

  worksheet.getColumn("D").numFmt =
    "$0.00";

  worksheet
    .getColumn("L")
    .eachCell(
      { includeEmpty: true },
      (cell, rowNumber) => {
        if (rowNumber > 1) {
          cell.dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: ['"Sí,No"'],
          };
        }
      }
    );

  worksheet
    .getColumn("M")
    .eachCell(
      { includeEmpty: true },
      (cell, rowNumber) => {
        if (rowNumber > 1) {
          cell.dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: ['"Sí,No"'],
          };
        }
      }
    );

  const buffer =
    await workbook.xlsx.writeBuffer();

  const blob = new Blob(
    [buffer],
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  const downloadUrl =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = downloadUrl;

  anchor.download =
    "Plantilla_Importacion_Productos_MercaNova_GO.xlsx";

  document.body.appendChild(anchor);

  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(downloadUrl);
}