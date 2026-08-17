"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createProductFallbackImage } from "@/lib/productImages";
import { createProduct } from "@/services/createProduct";
import {
  createProductImage,
  deleteProductImage,
  getProductImages,
  removeProductImageFile,
  updateProductImage,
  uploadProductImageFile,
} from "@/services/productImages";
import { updateProduct } from "@/services/updateProduct";

import type { AdminProductRecord } from "@/types/adminProduct";
import type { ProductImage } from "@/types/catalogMaster";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  product?: AdminProductRecord | null;
}

interface ProductFormState {
  name: string;
  category: string;
  price: string;
  old_price: string;
  unit: string;
  approx: string;
  image: string;
  description: string;
  origin: string;
  delivery: string;
  badge: string;
  stock: boolean;
  featured: boolean;
}

const categoryOptions = [
  "Frutas",
  "Verduras y hortalizas",
  "Tubérculos",
  "Lácteos",
  "Carnes y proteínas",
  "Abarrotes",
  "Bebidas",
  "Panadería",
  "Hogar y limpieza",
  "Cuidado personal",
  "Otros",
];

const unitOptions = [
  "Unidad",
  "Libra",
  "Kilogramo",
  "Gramo",
  "Litro",
  "Mililitro",
  "Atado",
  "Paquete",
  "Bandeja",
  "Docena",
  "Caja",
  "Saco",
];

const originOptions = [
  "Proveedores seleccionados",
  "Productores locales",
  "Productores locales de Chimborazo",
  "Distribuidores autorizados",
  "Distribuidor nacional",
  "Producción nacional",
  "Granjas locales",
  "Lácteos seleccionados",
  "Producto importado",
];

const deliveryOptions = [
  "Entrega coordinada",
  "Entrega estimada 20–30 min",
  "Entrega el mismo día",
  "Entrega según disponibilidad",
];

const initialForm: ProductFormState = {
  name: "",
  category: "",
  price: "",
  old_price: "",
  unit: "",
  approx: "",
  image: "",
  description: "",
  origin: "Proveedores seleccionados",
  delivery: "Entrega coordinada",
  badge: "",
  stock: true,
  featured: false,
};

function normalizeOptionalValue(
  value: string
): string | null {
  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function buildImageUpdateInput(
  image: ProductImage,
  overrides: Partial<{
    is_primary: boolean;
    active: boolean;
    image_type: ProductImage["image_type"];
  }> = {}
) {
  return {
    id: image.id,
    product_id: image.product_id,
    image_url: image.image_url,
    storage_path: image.storage_path,
    image_type:
      overrides.image_type ?? image.image_type,
    alt_text: image.alt_text,
    display_order: image.display_order,
    is_primary:
      overrides.is_primary ?? image.is_primary,
    active:
      overrides.active ?? image.active,
    width: image.width,
    height: image.height,
    file_size_bytes: image.file_size_bytes,
    mime_type: image.mime_type,
  };
}

export default function ProductModal({
  open,
  onClose,
  onCreated,
  product,
}: ProductModalProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const savedSuccessfullyRef =
    useRef(false);

  const [form, setForm] =
    useState<ProductFormState>(initialForm);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] =
    useState(false);
  const [removingImage, setRemovingImage] =
    useState(false);
  const [formError, setFormError] = useState("");
  const [imageMessage, setImageMessage] =
    useState("");
  const [imageError, setImageError] =
    useState(false);
  const [dragActive, setDragActive] =
    useState(false);
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] =
    useState("");
  const [selectedFileSize, setSelectedFileSize] =
    useState<number | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] =
    useState("");
  const [removeCurrentImage, setRemoveCurrentImage] =
    useState(false);
  const [suspiciousPriceConfirmed, setSuspiciousPriceConfirmed] =
    useState(false);

  const editing = Boolean(product);
  const parsedPrice = Number(form.price);
  const parsedOldPrice =
    form.old_price.trim() === ""
      ? null
      : Number(form.old_price);

  const suspiciousPrice =
    form.price.trim() !== "" &&
    Number.isFinite(parsedPrice) &&
    parsedPrice >= 50;

  const fallbackImage = useMemo(
    () =>
      createProductFallbackImage(
        form.name || "Nuevo producto",
        form.category || "MercaNova GO"
      ),
    [form.name, form.category]
  );

  const previewImage =
    localPreviewUrl ||
    (form.image.trim() && !imageError
      ? form.image.trim()
      : fallbackImage);

  const busy =
    loading || uploadingImage || removingImage;

  useEffect(() => {
    if (!open) {
      return;
    }

    savedSuccessfullyRef.current = false;

    if (product) {
      setForm({
        name: product.name ?? "",
        category: product.category ?? "",
        price: String(product.price ?? ""),
        old_price:
          product.old_price === null ||
          product.old_price === undefined
            ? ""
            : String(product.old_price),
        unit: product.unit ?? "",
        approx: product.approx ?? "",
        image: product.image ?? "",
        description: product.description ?? "",
        origin: product.origin ?? "",
        delivery:
          product.delivery ?? "Entrega coordinada",
        badge: product.badge ?? "",
        stock: product.stock ?? true,
        featured: product.featured ?? false,
      });
    } else {
      setForm(initialForm);
    }

    setFormError("");
    setImageMessage("");
    setImageError(false);
    setDragActive(false);
    setSelectedFile(null);
    setSelectedFileName("");
    setSelectedFileSize(null);
    setRemoveCurrentImage(false);
    setSuspiciousPriceConfirmed(false);

    setLocalPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return "";
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, product]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        void handleClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, busy]);

  useEffect(() => {
    setImageError(false);
  }, [form.image, localPreviewUrl]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  if (!open) {
    return null;
  }

  function updateField<
    Key extends keyof ProductFormState,
  >(
    field: Key,
    value: ProductFormState[Key]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFormError("");
    setImageMessage("");

    if (field === "price") {
      setSuspiciousPriceConfirmed(false);
    }
  }

  function handleTextChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    updateField(
      name as keyof ProductFormState,
      value as never
    );

    if (name === "image") {
      setSelectedFile(null);
      setSelectedFileName("");
      setSelectedFileSize(null);
      setRemoveCurrentImage(value.trim() === "");
      setLocalPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return "";
      });
    }
  }

  async function handleClose() {
    if (busy) {
      return;
    }

    setLocalPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return "";
    });

    onClose();
  }

  function validateLocalImageFile(file: File): void {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowed.includes(file.type)) {
      throw new Error(
        "La fotografía debe estar en formato JPG, PNG o WebP."
      );
    }

    if (file.size <= 0) {
      throw new Error(
        "El archivo seleccionado está vacío."
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(
        "La fotografía supera el límite permitido de 5 MB."
      );
    }
  }

  async function handleImageFile(file: File) {
    try {
      validateLocalImageFile(file);

      setUploadingImage(true);
      setFormError("");
      setImageMessage("");
      setImageError(false);

      setSelectedFile(file);
      setSelectedFileName(file.name);
      setSelectedFileSize(file.size);
      setRemoveCurrentImage(false);

      setLocalPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }

        return URL.createObjectURL(file);
      });

      setImageMessage(
        "Fotografía preparada. Se guardará en product-images al guardar el producto."
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No fue posible preparar la fotografía."
      );
    } finally {
      setUploadingImage(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileInputChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    void handleImageFile(file);
  }

  function handleDragEnter(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!busy) {
      setDragActive(true);
    }
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!busy) {
      setDragActive(true);
    }
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    if (busy) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    void handleImageFile(file);
  }

  async function handleRemoveImage() {
    if (busy) {
      return;
    }

    try {
      setRemovingImage(true);
      setFormError("");
      setImageMessage("");

      setSelectedFile(null);
      setSelectedFileName("");
      setSelectedFileSize(null);
      setRemoveCurrentImage(true);
      setImageError(false);

      setLocalPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return "";
      });

      setForm((current) => ({
        ...current,
        image: "",
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setImageMessage(
        "La fotografía principal dejará de utilizarse al guardar. El archivo no se eliminará automáticamente de la biblioteca."
      );
    } finally {
      setRemovingImage(false);
    }
  }

  function validateForm(): string | null {
    if (!form.name.trim()) {
      return "Ingresa el nombre del producto.";
    }

    if (!form.category.trim()) {
      return "Selecciona o ingresa una categoría.";
    }

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice <= 0
    ) {
      return "Ingresa un precio válido mayor que cero.";
    }

    if (!form.unit.trim()) {
      return "Selecciona o ingresa la unidad de venta.";
    }

    if (
      parsedOldPrice !== null &&
      (!Number.isFinite(parsedOldPrice) ||
        parsedOldPrice <= 0)
    ) {
      return "El precio anterior no es válido.";
    }

    if (
      parsedOldPrice !== null &&
      parsedOldPrice <= parsedPrice
    ) {
      return "El precio anterior debe ser mayor que el precio actual. Si el producto no tiene descuento, deja ese campo vacío.";
    }

    if (
      suspiciousPrice &&
      !suspiciousPriceConfirmed
    ) {
      return "El precio ingresado es igual o superior a $50.00. Verifica que no falte el separador decimal y confirma el valor antes de guardar.";
    }

    if (
      form.image.trim() &&
      !form.image.trim().startsWith("/") &&
      !form.image.trim().startsWith("https://") &&
      !form.image.trim().startsWith("http://")
    ) {
      return "La imagen debe ser una ruta local que comience con / o una URL válida.";
    }

    return null;
  }

  async function getCurrentPrimaryImage(
    productId: number
  ): Promise<ProductImage | null> {
    const images = await getProductImages(productId);

    return (
      images.find(
        (image) => image.is_primary
      ) ?? null
    );
  }

  async function createPrimaryFromFile(
    productId: number,
    file: File
  ): Promise<ProductImage> {
    const uploaded =
      await uploadProductImageFile(
        productId,
        file
      );

    try {
      return await createProductImage({
        product_id: productId,
        image_url: uploaded.publicUrl,
        storage_path: uploaded.storagePath,
        image_type: "primary",
        alt_text: form.name.trim() || null,
        display_order: 0,
        is_primary: true,
        active: true,
        width: uploaded.width,
        height: uploaded.height,
        file_size_bytes:
          uploaded.fileSizeBytes,
        mime_type: uploaded.mimeType,
      });
    } catch (error) {
      try {
        await removeProductImageFile(
          uploaded.storagePath
        );
      } catch (cleanupError) {
        console.error(
          "No fue posible limpiar el archivo tras fallar el registro:",
          cleanupError
        );
      }

      throw error;
    }
  }

  async function createOrPromoteUrlAsPrimary(
    productId: number,
    imageUrl: string
  ): Promise<ProductImage> {
    const images = await getProductImages(productId);
    const existing = images.find(
      (image) => image.image_url === imageUrl
    );

    if (existing) {
      return updateProductImage(
        buildImageUpdateInput(existing, {
          is_primary: true,
          active: true,
          image_type: "primary",
        })
      );
    }

    return createProductImage({
      product_id: productId,
      image_url: imageUrl,
      storage_path: null,
      image_type: "primary",
      alt_text: form.name.trim() || null,
      display_order: 0,
      is_primary: true,
      active: true,
      width: null,
      height: null,
      file_size_bytes: null,
      mime_type: null,
    });
  }

  async function deactivatePrimaryImage(
    productId: number
  ): Promise<ProductImage | null> {
    const primary =
      await getCurrentPrimaryImage(productId);

    if (!primary) {
      return null;
    }

    await updateProductImage(
      buildImageUpdateInput(primary, {
        is_primary: false,
        active: false,
        image_type: "gallery",
      })
    );

    return primary;
  }

  async function restorePrimaryImage(
    image: ProductImage | null
  ): Promise<void> {
    if (!image) {
      return;
    }

    await updateProductImage(
      buildImageUpdateInput(image, {
        is_primary: true,
        active: image.active,
        image_type: "primary",
      })
    );
  }

  function buildProductPayload(
    image: string
  ) {
    return {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(parsedPrice.toFixed(2)),
      old_price:
        parsedOldPrice === null
          ? null
          : Number(parsedOldPrice.toFixed(2)),
      unit: form.unit.trim(),
      approx: normalizeOptionalValue(form.approx),
      image,
      description:
        normalizeOptionalValue(form.description),
      origin: normalizeOptionalValue(form.origin),
      delivery:
        normalizeOptionalValue(form.delivery),
      badge: normalizeOptionalValue(form.badge),
      stock: form.stock,
      featured: form.featured,
    };
  }

  async function syncLegacyImageBestEffort(
    target: AdminProductRecord,
    imageUrl: string
  ): Promise<void> {
    if (target.image === imageUrl) {
      return;
    }

    try {
      await updateProduct({
        id: target.id,
        ...buildProductPayload(imageUrl),
      });
    } catch (error) {
      console.warn(
        "La fotografía oficial se guardó, pero no fue posible sincronizar products.image:",
        error
      );
    }
  }

  async function handleSubmit() {
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setLoading(true);
      setFormError("");
      setImageMessage("");

      if (product) {
        const originalPrimary =
          await getCurrentPrimaryImage(product.id);

        const baseImageUrl =
          removeCurrentImage
            ? ""
            : form.image.trim();

        const updatedProduct =
          await updateProduct({
            id: product.id,
            ...buildProductPayload(baseImageUrl),
          });

        if (removeCurrentImage) {
          await deactivatePrimaryImage(product.id);
        } else if (selectedFile) {
          let createdImage: ProductImage | null = null;

          try {
            createdImage =
              await createPrimaryFromFile(
                product.id,
                selectedFile
              );

            await syncLegacyImageBestEffort(
              updatedProduct,
              createdImage.image_url
            );
          } catch (error) {
            if (createdImage) {
              try {
                await deleteProductImage(
                  createdImage
                );
              } catch (cleanupError) {
                console.error(
                  "No fue posible revertir la nueva fotografía:",
                  cleanupError
                );
              }
            }

            try {
              await restorePrimaryImage(
                originalPrimary
              );
            } catch (restoreError) {
              console.error(
                "No fue posible restaurar la fotografía principal anterior:",
                restoreError
              );
            }

            throw error;
          }
        } else if (
          baseImageUrl &&
          baseImageUrl !== product.image
        ) {
          await createOrPromoteUrlAsPrimary(
            product.id,
            baseImageUrl
          );
        }
      } else {
        const initialImageUrl =
          selectedFile
            ? ""
            : form.image.trim();

        const createdProduct =
          await createProduct(
            buildProductPayload(
              initialImageUrl
            )
          );

        try {
          if (selectedFile) {
            const image =
              await createPrimaryFromFile(
                createdProduct.id,
                selectedFile
              );

            await syncLegacyImageBestEffort(
              createdProduct,
              image.image_url
            );
          } else if (initialImageUrl) {
            await createOrPromoteUrlAsPrimary(
              createdProduct.id,
              initialImageUrl
            );
          }
        } catch (imageError) {
          console.error(
            "El producto fue creado, pero la fotografía no pudo registrarse:",
            imageError
          );

          savedSuccessfullyRef.current = true;
          onCreated();
          onClose();

          window.alert(
            "El producto fue creado correctamente, pero la fotografía no pudo registrarse. Puedes agregarla desde Fotografías del catálogo."
          );
          return;
        }
      }

      savedSuccessfullyRef.current = true;
      onCreated();
      onClose();
    } catch (error) {
      console.error(
        editing
          ? "Error actualizando producto:"
          : "Error creando producto:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : editing
            ? "No fue posible actualizar el producto."
            : "No fue posible crear el producto."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleOverlayClick(
    event: React.MouseEvent<HTMLDivElement>
  ) {
    if (
      event.target === event.currentTarget &&
      !busy
    ) {
      void handleClose();
    }
  }

  return (
    <div
      role="presentation"
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 p-3 backdrop-blur-sm sm:p-6"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.65)]"
      >
        <header className="relative overflow-hidden border-b border-zinc-200 bg-zinc-950 px-5 py-5 text-white sm:px-8 sm:py-6">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-green-500/20 blur-3xl"
          />

          <div className="relative flex items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-500 text-white shadow-lg shadow-green-950/40">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="h-6 w-6"
                >
                  <path
                    d="M4.25 8.25 12 4l7.75 4.25v8.5L12 21l-7.75-4.25v-8.5Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />

                  <path
                    d="m4.75 8.5 7.25 4 7.25-4M12 12.5V21"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
                  Administración MercaNova GO
                </p>

                <h2
                  id="product-modal-title"
                  className="mt-2 text-2xl font-black tracking-tight sm:text-3xl"
                >
                  {editing
                    ? "Editar producto"
                    : "Registrar nuevo producto"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Completa la información comercial y
                  administra su fotografía oficial.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void handleClose()
              }
              disabled={busy}
              aria-label="Cerrar formulario de producto"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-zinc-200 transition hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path
                  d="m5 5 10 10M15 5 5 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </header>

        <div className="overflow-y-auto">
          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="product-name"
                    className="text-sm font-black text-zinc-950"
                  >
                    Nombre del producto
                  </label>

                  <input
                    id="product-name"
                    name="name"
                    value={form.name}
                    onChange={handleTextChange}
                    placeholder="Ejemplo: Papa Chola"
                    disabled={busy}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 font-semibold text-zinc-950 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-category"
                    className="text-sm font-black text-zinc-950"
                  >
                    Categoría
                  </label>

                  <input
                    id="product-category"
                    name="category"
                    list="product-category-options"
                    value={form.category}
                    onChange={handleTextChange}
                    placeholder="Selecciona una categoría"
                    disabled={busy}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 font-semibold text-zinc-950 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <datalist id="product-category-options">
                    {categoryOptions.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        />
                      )
                    )}
                  </datalist>
                </div>

                <div>
                  <label
                    htmlFor="product-unit"
                    className="text-sm font-black text-zinc-950"
                  >
                    Unidad de venta
                  </label>

                  <input
                    id="product-unit"
                    name="unit"
                    list="product-unit-options"
                    value={form.unit}
                    onChange={handleTextChange}
                    placeholder="Ejemplo: Libra"
                    disabled={busy}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 font-semibold text-zinc-950 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <datalist id="product-unit-options">
                    {unitOptions.map((unit) => (
                      <option
                        key={unit}
                        value={unit}
                      />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label
                    htmlFor="product-price"
                    className="text-sm font-black text-zinc-950"
                  >
                    Precio final
                  </label>

                  <div className="mt-2 flex overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 transition focus-within:border-green-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100">
                    <span className="flex items-center border-r border-zinc-200 px-4 font-black text-green-700">
                      $
                    </span>

                    <input
                      id="product-price"
                      name="price"
                      value={form.price}
                      onChange={handleTextChange}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      disabled={busy}
                      className="min-w-0 flex-1 bg-transparent px-4 py-4 font-black text-zinc-950 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="product-old-price"
                    className="text-sm font-black text-zinc-950"
                  >
                    Precio anterior
                    <span className="ml-2 font-semibold text-zinc-400">
                      Opcional
                    </span>
                  </label>

                  <div className="mt-2 flex overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 transition focus-within:border-green-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100">
                    <span className="flex items-center border-r border-zinc-200 px-4 font-black text-zinc-500">
                      $
                    </span>

                    <input
                      id="product-old-price"
                      name="old_price"
                      value={form.old_price}
                      onChange={handleTextChange}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Déjalo vacío sin descuento"
                      disabled={busy}
                      className="min-w-0 flex-1 bg-transparent px-4 py-4 font-semibold text-zinc-950 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {suspiciousPrice && (
                  <div className="md:col-span-2">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                            className="h-5 w-5"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="9"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />

                            <path
                              d="M12 8v5M12 17h.01"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>

                        <div>
                          <p className="font-black text-amber-900">
                            Verificación preventiva de
                            precio
                          </p>

                          <p className="mt-1 text-sm leading-6 text-amber-800">
                            El valor ingresado es de{" "}
                            <strong>
                              $
                              {parsedPrice.toFixed(
                                2
                              )}
                            </strong>
                            . Confirma que no querías
                            registrar un valor decimal
                            diferente.
                          </p>

                          <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm font-black text-amber-900">
                            <input
                              type="checkbox"
                              checked={
                                suspiciousPriceConfirmed
                              }
                              onChange={(event) =>
                                setSuspiciousPriceConfirmed(
                                  event.target
                                    .checked
                                )
                              }
                              disabled={busy}
                              className="h-4 w-4 accent-amber-700"
                            />

                            Confirmo que el precio es
                            correcto
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="product-approx"
                    className="text-sm font-black text-zinc-950"
                  >
                    Cantidad aproximada
                    <span className="ml-2 font-semibold text-zinc-400">
                      Opcional
                    </span>
                  </label>

                  <input
                    id="product-approx"
                    name="approx"
                    value={form.approx}
                    onChange={handleTextChange}
                    placeholder="Ejemplo: 4–5 unidades"
                    disabled={busy}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 font-semibold text-zinc-950 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-badge"
                    className="text-sm font-black text-zinc-950"
                  >
                    Distintivo comercial
                    <span className="ml-2 font-semibold text-zinc-400">
                      Opcional
                    </span>
                  </label>

                  <input
                    id="product-badge"
                    name="badge"
                    value={form.badge}
                    onChange={handleTextChange}
                    placeholder="Ejemplo: Fresco, Nuevo, Oferta"
                    disabled={busy}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 font-semibold text-zinc-950 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-origin"
                    className="text-sm font-black text-zinc-950"
                  >
                    Origen público
                    <span className="ml-2 font-semibold text-zinc-400">
                      Opcional
                    </span>
                  </label>

                  <input
                    id="product-origin"
                    name="origin"
                    list="product-origin-options"
                    value={form.origin}
                    onChange={handleTextChange}
                    placeholder="Ejemplo: Proveedores seleccionados"
                    disabled={busy}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 font-semibold text-zinc-950 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <datalist id="product-origin-options">
                    {originOptions.map(
                      (origin) => (
                        <option
                          key={origin}
                          value={origin}
                        />
                      )
                    )}
                  </datalist>

                  <p className="mt-2 text-xs leading-5 text-zinc-400">
                    Puede dejarse vacío. Nunca debe
                    mostrarse información interna de
                    abastecimiento.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="product-delivery"
                    className="text-sm font-black text-zinc-950"
                  >
                    Información de entrega
                  </label>

                  <input
                    id="product-delivery"
                    name="delivery"
                    list="product-delivery-options"
                    value={form.delivery}
                    onChange={handleTextChange}
                    placeholder="Entrega coordinada"
                    disabled={busy}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 font-semibold text-zinc-950 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <datalist id="product-delivery-options">
                    {deliveryOptions.map(
                      (delivery) => (
                        <option
                          key={delivery}
                          value={delivery}
                        />
                      )
                    )}
                  </datalist>
                </div>

                <div className="md:col-span-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-zinc-950">
                        Fotografía oficial del producto
                      </p>

                      <p className="mt-1 text-xs leading-5 text-zinc-400">
                        Formatos permitidos: JPG, PNG,
                        WebP. Tamaño máximo: 5 MB.
                      </p>
                    </div>

                    {form.image.trim() && (
                      <button
                        type="button"
                        onClick={() =>
                          void handleRemoveImage()
                        }
                        disabled={busy}
                        className="w-fit text-xs font-black text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Quitar fotografía
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`mt-3 rounded-3xl border-2 border-dashed p-6 text-center transition ${
                      dragActive
                        ? "border-green-500 bg-green-50"
                        : "border-zinc-300 bg-zinc-50"
                    }`}
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                      {uploadingImage ? (
                        <span className="h-7 w-7 animate-spin rounded-full border-2 border-green-300 border-t-green-700" />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                          className="h-7 w-7"
                        >
                          <path
                            d="M12 16V5M8 9l4-4 4 4"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <path
                            d="M5 14v5h14v-5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    <p className="mt-4 font-black text-zinc-950">
                      {uploadingImage
                        ? "Subiendo fotografía..."
                        : "Arrastra una imagen o selecciónala desde tu equipo"}
                    </p>

                    <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-500">
                      La imagen se almacenará de forma
                      segura en Supabase Storage dentro
                      del bucket oficial product-images.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={busy}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-black text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-zinc-300"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="h-5 w-5"
                      >
                        <path
                          d="M4.5 6.5h4l1.4-2h4.2l1.4 2h4v12h-15v-12Z"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinejoin="round"
                        />

                        <circle
                          cx="12"
                          cy="12.5"
                          r="3.25"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        />
                      </svg>

                      Seleccionar fotografía
                    </button>

                    {selectedFileName && (
                      <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold text-green-800">
                        <span className="truncate">
                          {selectedFileName}
                        </span>

                        {selectedFileSize !== null && (
                          <span className="shrink-0 text-green-600">
                            ·{" "}
                            {formatFileSize(
                              selectedFileSize
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="product-image"
                      className="text-xs font-black uppercase tracking-[0.12em] text-zinc-500"
                    >
                      URL o ruta alternativa
                    </label>

                    <input
                      id="product-image"
                      name="image"
                      value={form.image}
                      onChange={handleTextChange}
                      placeholder="/products/producto.webp o https://..."
                      disabled={busy}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-950 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <p className="mt-2 text-xs leading-5 text-zinc-400">
                      Este campo se completa
                      automáticamente después de subir la
                      fotografía.
                    </p>
                  </div>

                  {imageMessage && (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          aria-hidden="true"
                          className="h-4 w-4"
                        >
                          <path
                            d="m5 10 3 3 7-7"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>

                      <p className="text-sm font-semibold leading-6 text-green-800">
                        {imageMessage}
                      </p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="product-description"
                    className="text-sm font-black text-zinc-950"
                  >
                    Descripción comercial
                    <span className="ml-2 font-semibold text-zinc-400">
                      Opcional
                    </span>
                  </label>

                  <textarea
                    id="product-description"
                    name="description"
                    value={form.description}
                    onChange={handleTextChange}
                    rows={5}
                    maxLength={500}
                    placeholder="Describe las características, beneficios, presentación y uso del producto."
                    disabled={busy}
                    className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 font-semibold leading-7 text-zinc-950 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-2 text-right text-xs font-semibold text-zinc-400">
                    {form.description.length}/500
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                    form.stock
                      ? "border-green-200 bg-green-50"
                      : "border-zinc-200 bg-zinc-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.stock}
                    onChange={(event) =>
                      updateField(
                        "stock",
                        event.target.checked
                      )
                    }
                    disabled={busy}
                    className="h-5 w-5 accent-green-600"
                  />

                  <div>
                    <p className="font-black text-zinc-950">
                      Producto disponible
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Permite agregarlo a la canasta.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                    form.featured
                      ? "border-green-200 bg-green-50"
                      : "border-zinc-200 bg-zinc-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      updateField(
                        "featured",
                        event.target.checked
                      )
                    }
                    disabled={busy}
                    className="h-5 w-5 accent-green-600"
                  />

                  <div>
                    <p className="font-black text-zinc-950">
                      Producto destacado
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Aparecerá en espacios prioritarios.
                    </p>
                  </div>
                </label>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />

                      <path
                        d="M12 8v5M12 17h.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>

                  <div>
                    <p className="font-black text-red-900">
                      Revisa la información
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-800">
                      {formError}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-0 lg:self-start">
              <div className="overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-[0_24px_65px_-40px_rgba(15,23,42,0.4)]">
                <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
                    Vista previa
                  </p>

                  <h3 className="mt-1 font-black text-zinc-950">
                    Así verá el cliente el producto
                  </h3>
                </div>

                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                  <img
                    src={previewImage}
                    alt={
                      form.name ||
                      "Vista previa del producto"
                    }
                    onError={() =>
                      setImageError(true)
                    }
                    className="h-full w-full object-cover"
                  />

                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/55 backdrop-blur-sm">
                      <div className="text-center text-white">
                        <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        <p className="mt-3 text-xs font-black uppercase tracking-wider">
                          Subiendo imagen
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    {form.featured && (
                      <span className="rounded-full bg-zinc-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">
                        Selección MercaNova
                      </span>
                    )}

                    {form.badge.trim() && (
                      <span className="rounded-full bg-green-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">
                        {form.badge.trim()}
                      </span>
                    )}
                  </div>

                  <span
                    className={`absolute bottom-3 left-3 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                      form.stock
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {form.stock
                      ? "Disponible"
                      : "Agotado"}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-600">
                    {form.category ||
                      "Categoría del producto"}
                  </p>

                  <h4 className="mt-2 text-xl font-black text-zinc-950">
                    {form.name ||
                      "Nombre del producto"}
                  </h4>

                  <p className="mt-3 text-sm text-zinc-500">
                    {form.unit ||
                      "Unidad de venta"}
                    {form.approx.trim()
                      ? ` · ${form.approx.trim()}`
                      : ""}
                  </p>

                  <div className="mt-5">
                    {parsedOldPrice !== null &&
                      Number.isFinite(
                        parsedOldPrice
                      ) &&
                      parsedOldPrice >
                        parsedPrice && (
                        <p className="text-sm font-bold text-zinc-400 line-through">
                          $
                          {parsedOldPrice.toFixed(
                            2
                          )}
                        </p>
                      )}

                    <p className="text-3xl font-black tracking-tight text-zinc-950">
                      {Number.isFinite(
                        parsedPrice
                      ) && parsedPrice > 0
                        ? `$${parsedPrice.toFixed(
                            2
                          )}`
                        : "$0.00"}
                    </p>

                    <p className="mt-1 text-[11px] font-bold text-zinc-400">
                      Precio final
                    </p>
                  </div>

                  {form.origin.trim() && (
                    <div className="mt-5 rounded-2xl bg-zinc-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Origen
                      </p>

                      <p className="mt-1 text-sm font-black text-zinc-700">
                        {form.origin}
                      </p>
                    </div>
                  )}

                  {form.delivery.trim() && (
                    <div className="mt-3 rounded-2xl bg-green-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-green-600">
                        Entrega
                      </p>

                      <p className="mt-1 text-sm font-black text-green-800">
                        {form.delivery}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-zinc-200 bg-zinc-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={() =>
              void handleClose()
            }
            disabled={busy}
            className="rounded-2xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-black text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy}
            className="flex items-center justify-center gap-3 rounded-2xl bg-green-600 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Guardando producto...
              </>
            ) : uploadingImage ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Subiendo fotografía...
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <path
                    d="M5.25 4.75h11.5l2.5 2.5v12h-14v-14Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M8.25 4.75v5h7.5v-5M8.25 19.25v-5.5h7.5v5.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                </svg>

                {editing
                  ? "Actualizar producto"
                  : "Guardar producto"}
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}