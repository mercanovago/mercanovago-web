import { supabase } from "@/lib/supabase";

import type {
  ProductImage,
} from "@/types/catalogMaster";

export const PRODUCT_IMAGES_BUCKET =
  "product-images";

export const PRODUCT_IMAGE_MAX_SIZE_BYTES =
  5 * 1024 * 1024;

export const PRODUCT_IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export interface CreateProductImageInput {
  product_id: number;
  image_url: string;
  storage_path?: string | null;
  image_type?:
    | "primary"
    | "gallery"
    | "side"
    | "nutrition"
    | "preparation"
    | "presentation"
    | "market_source";
  alt_text?: string | null;
  display_order?: number;
  is_primary?: boolean;
  active?: boolean;
  width?: number | null;
  height?: number | null;
  file_size_bytes?: number | null;
  mime_type?: string | null;
}

export interface UpdateProductImageInput
  extends CreateProductImageInput {
  id: number;
}

export interface UploadedProductImageFile {
  publicUrl: string;
  storagePath: string;
  width: number | null;
  height: number | null;
  fileSizeBytes: number;
  mimeType: string;
}

function normalizeRequiredText(
  value: string,
  fieldName: string
): string {
  const normalizedValue =
    value.trim();

  if (!normalizedValue) {
    throw new Error(
      `El campo ${fieldName} es obligatorio.`
    );
  }

  return normalizedValue;
}

function normalizeOptionalText(
  value: string | null | undefined
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalizedValue =
    value.trim();

  return normalizedValue || null;
}

function normalizePositiveInteger(
  value: number | null | undefined
): number | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const normalizedValue =
    Math.trunc(Number(value));

  if (
    !Number.isFinite(
      normalizedValue
    ) ||
    normalizedValue <= 0
  ) {
    return null;
  }

  return normalizedValue;
}

function normalizeNonNegativeInteger(
  value: number | undefined
): number {
  const normalizedValue =
    Math.trunc(
      Number(value ?? 0)
    );

  if (
    !Number.isFinite(
      normalizedValue
    ) ||
    normalizedValue < 0
  ) {
    return 0;
  }

  return normalizedValue;
}

function validateProductId(
  value: number
): number {
  const productId =
    Number(value);

  if (
    !Number.isInteger(
      productId
    ) ||
    productId <= 0
  ) {
    throw new Error(
      "El identificador del producto no es válido."
    );
  }

  return productId;
}

function validateImageUrl(
  value: string
): string {
  const imageUrl =
    normalizeRequiredText(
      value,
      "URL de imagen"
    );

  try {
    const parsedUrl =
      new URL(imageUrl);

    if (
      parsedUrl.protocol !==
        "http:" &&
      parsedUrl.protocol !==
        "https:"
    ) {
      throw new Error();
    }
  } catch {
    throw new Error(
      "La URL de la imagen no es válida."
    );
  }

  return imageUrl;
}

function sanitizeFileName(
  value: string
): string {
  const normalized = value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9.]+/g,
      "-"
    )
    .replace(/^-+|-+$/g, "");

  return (
    normalized ||
    "product-image"
  );
}

function validateImageFile(
  file: File
): void {
  if (
    !PRODUCT_IMAGE_ALLOWED_MIME_TYPES.includes(
      file.type as
        (typeof PRODUCT_IMAGE_ALLOWED_MIME_TYPES)[number]
    )
  ) {
    throw new Error(
      "Formato no permitido. Utiliza JPG, PNG o WEBP."
    );
  }

  if (
    file.size >
    PRODUCT_IMAGE_MAX_SIZE_BYTES
  ) {
    throw new Error(
      "La imagen supera el límite máximo de 5 MB."
    );
  }

  if (file.size <= 0) {
    throw new Error(
      "El archivo seleccionado está vacío."
    );
  }
}

async function readImageDimensions(
  file: File
): Promise<{
  width: number | null;
  height: number | null;
}> {
  if (
    typeof window ===
    "undefined"
  ) {
    return {
      width: null,
      height: null,
    };
  }

  return new Promise(
    (resolve) => {
      const objectUrl =
        URL.createObjectURL(file);

      const image =
        new Image();

      image.onload = () => {
        resolve({
          width:
            image.naturalWidth ||
            null,
          height:
            image.naturalHeight ||
            null,
        });

        URL.revokeObjectURL(
          objectUrl
        );
      };

      image.onerror = () => {
        resolve({
          width: null,
          height: null,
        });

        URL.revokeObjectURL(
          objectUrl
        );
      };

      image.src = objectUrl;
    }
  );
}

async function unsetCurrentPrimaryImage(
  productId: number,
  excludedImageId?: number
): Promise<void> {
  let query = supabase
    .from("product_images")
    .update({
      is_primary: false,
      image_type: "gallery",
    })
    .eq(
      "product_id",
      productId
    )
    .eq(
      "is_primary",
      true
    );

  if (excludedImageId) {
    query = query.neq(
      "id",
      excludedImageId
    );
  }

  const { error } =
    await query;

  if (error) {
    console.error(
      "Error actualizando la imagen principal anterior:",
      error
    );

    throw new Error(
      "No fue posible actualizar la imagen principal anterior."
    );
  }
}

export async function uploadProductImageFile(
  productId: number,
  file: File
): Promise<UploadedProductImageFile> {
  const normalizedProductId =
    validateProductId(
      productId
    );

  validateImageFile(file);

  const dimensions =
    await readImageDimensions(
      file
    );

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ||
    file.type
      .split("/")
      .pop() ||
    "jpg";

  const baseName =
    sanitizeFileName(
      file.name.replace(
        /\.[^.]+$/,
        ""
      )
    );

  const storagePath =
    `products/${normalizedProductId}/` +
    `${Date.now()}-${baseName}.${extension}`;

  const {
    error: uploadError,
  } = await supabase.storage
    .from(
      PRODUCT_IMAGES_BUCKET
    )
    .upload(
      storagePath,
      file,
      {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      }
    );

  if (uploadError) {
    console.error(
      "Error subiendo fotografía:",
      uploadError
    );

    throw new Error(
      uploadError.message ||
        "No fue posible subir la fotografía."
    );
  }

  const { data } =
    supabase.storage
      .from(
        PRODUCT_IMAGES_BUCKET
      )
      .getPublicUrl(
        storagePath
      );

  if (!data.publicUrl) {
    await supabase.storage
      .from(
        PRODUCT_IMAGES_BUCKET
      )
      .remove([
        storagePath,
      ]);

    throw new Error(
      "No fue posible obtener la URL pública de la fotografía."
    );
  }

  return {
    publicUrl:
      data.publicUrl,
    storagePath,
    width:
      dimensions.width,
    height:
      dimensions.height,
    fileSizeBytes:
      file.size,
    mimeType:
      file.type,
  };
}

export async function removeProductImageFile(
  storagePath: string
): Promise<void> {
  const normalizedPath =
    normalizeOptionalText(
      storagePath
    );

  if (!normalizedPath) {
    return;
  }

  const { error } =
    await supabase.storage
      .from(
        PRODUCT_IMAGES_BUCKET
      )
      .remove([
        normalizedPath,
      ]);

  if (error) {
    console.error(
      "Error eliminando archivo de Storage:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible eliminar el archivo de Storage."
    );
  }
}

export async function getProductImages(
  productId?: number
): Promise<ProductImage[]> {
  let query = supabase
    .from("product_images")
    .select("*")
    .order(
      "is_primary",
      {
        ascending: false,
      }
    )
    .order(
      "display_order",
      {
        ascending: true,
      }
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (
    productId !== undefined
  ) {
    query = query.eq(
      "product_id",
      validateProductId(
        productId
      )
    );
  }

  const { data, error } =
    await query;

  if (error) {
    console.error(
      "Error cargando fotografías del catálogo:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible cargar las fotografías del catálogo."
    );
  }

  return (
    data ?? []
  ) as ProductImage[];
}

export async function createProductImage(
  input: CreateProductImageInput
): Promise<ProductImage> {
  const productId =
    validateProductId(
      input.product_id
    );

  const isPrimary =
    Boolean(
      input.is_primary
    );

  if (isPrimary) {
    await unsetCurrentPrimaryImage(
      productId
    );
  }

  const payload = {
    product_id: productId,
    image_url:
      validateImageUrl(
        input.image_url
      ),
    storage_path:
      normalizeOptionalText(
        input.storage_path
      ),
    image_type: isPrimary
      ? "primary"
      : input.image_type ??
        "gallery",
    alt_text:
      normalizeOptionalText(
        input.alt_text
      ),
    display_order:
      normalizeNonNegativeInteger(
        input.display_order
      ),
    is_primary:
      isPrimary,
    active:
      input.active ?? true,
    width:
      normalizePositiveInteger(
        input.width
      ),
    height:
      normalizePositiveInteger(
        input.height
      ),
    file_size_bytes:
      normalizePositiveInteger(
        input.file_size_bytes
      ),
    mime_type:
      normalizeOptionalText(
        input.mime_type
      ),
  };

  const { data, error } =
    await supabase
      .from(
        "product_images"
      )
      .insert(payload)
      .select("*")
      .single();

  if (error) {
    console.error(
      "Error creando fotografía de producto:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible registrar la fotografía."
    );
  }

  return data as ProductImage;
}

export async function updateProductImage(
  input: UpdateProductImageInput
): Promise<ProductImage> {
  const id = Number(input.id);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "El identificador de la fotografía no es válido."
    );
  }

  const productId =
    validateProductId(
      input.product_id
    );

  const isPrimary =
    Boolean(
      input.is_primary
    );

  if (isPrimary) {
    await unsetCurrentPrimaryImage(
      productId,
      id
    );
  }

  const payload = {
    product_id: productId,
    image_url:
      validateImageUrl(
        input.image_url
      ),
    storage_path:
      normalizeOptionalText(
        input.storage_path
      ),
    image_type: isPrimary
      ? "primary"
      : input.image_type ??
        "gallery",
    alt_text:
      normalizeOptionalText(
        input.alt_text
      ),
    display_order:
      normalizeNonNegativeInteger(
        input.display_order
      ),
    is_primary:
      isPrimary,
    active:
      input.active ?? true,
    width:
      normalizePositiveInteger(
        input.width
      ),
    height:
      normalizePositiveInteger(
        input.height
      ),
    file_size_bytes:
      normalizePositiveInteger(
        input.file_size_bytes
      ),
    mime_type:
      normalizeOptionalText(
        input.mime_type
      ),
  };

  const { data, error } =
    await supabase
      .from(
        "product_images"
      )
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

  if (error) {
    console.error(
      "Error actualizando fotografía de producto:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible actualizar la fotografía."
    );
  }

  return data as ProductImage;
}

export async function deleteProductImage(
  image:
    | ProductImage
    | number
): Promise<boolean> {
  let imageRecord:
    | ProductImage
    | null =
    typeof image === "number"
      ? null
      : image;

  const imageId =
    typeof image === "number"
      ? Number(image)
      : Number(image.id);

  if (
    !Number.isInteger(
      imageId
    ) ||
    imageId <= 0
  ) {
    throw new Error(
      "El identificador de la fotografía no es válido."
    );
  }

  if (!imageRecord) {
    const {
      data,
      error: readError,
    } = await supabase
      .from(
        "product_images"
      )
      .select("*")
      .eq("id", imageId)
      .maybeSingle();

    if (readError) {
      console.error(
        "Error consultando fotografía:",
        readError
      );

      throw new Error(
        "No fue posible consultar la fotografía."
      );
    }

    imageRecord =
      data as
        | ProductImage
        | null;
  }

  const { error } =
    await supabase
      .from(
        "product_images"
      )
      .delete()
      .eq(
        "id",
        imageId
      );

  if (error) {
    console.error(
      "Error eliminando fotografía:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible eliminar la fotografía."
    );
  }

  if (
    imageRecord?.storage_path
  ) {
    try {
      await removeProductImageFile(
        imageRecord.storage_path
      );
    } catch (storageError) {
      console.error(
        "La fila fue eliminada, pero el archivo no pudo eliminarse:",
        storageError
      );

      throw new Error(
        "La fotografía fue retirada del catálogo, pero el archivo no pudo eliminarse de Storage."
      );
    }
  }

  return true;
}