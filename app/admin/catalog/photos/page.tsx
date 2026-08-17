"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminGuard from "@/components/admin/AdminGuard";

import {
  getAdminProducts,
} from "@/services/getAdminProducts";

import {
  createProductImage,
  deleteProductImage,
  getProductImages,
  PRODUCT_IMAGE_ALLOWED_MIME_TYPES,
  PRODUCT_IMAGE_MAX_SIZE_BYTES,
  removeProductImageFile,
  updateProductImage,
  uploadProductImageFile,
} from "@/services/productImages";

import type {
  AdminProductRecord,
} from "@/types/adminProduct";

import type {
  ProductImage,
} from "@/types/catalogMaster";

type ImageType =
  | "primary"
  | "gallery"
  | "side"
  | "nutrition"
  | "preparation"
  | "presentation"
  | "market_source";

type ImageSourceMode =
  | "upload"
  | "url";

interface ImageFormState {
  product_id: number | "";
  image_url: string;
  image_type: ImageType;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
  active: boolean;
}

const EMPTY_FORM: ImageFormState = {
  product_id: "",
  image_url: "",
  image_type: "gallery",
  alt_text: "",
  display_order: 0,
  is_primary: false,
  active: true,
};

const IMAGE_TYPE_OPTIONS: Array<{
  value: ImageType;
  label: string;
}> = [
  {
    value: "primary",
    label: "Principal",
  },
  {
    value: "gallery",
    label: "Galería",
  },
  {
    value: "side",
    label: "Vista lateral",
  },
  {
    value: "nutrition",
    label: "Información nutricional",
  },
  {
    value: "preparation",
    label: "Preparación",
  },
  {
    value: "presentation",
    label: "Presentación comercial",
  },
  {
    value: "market_source",
    label: "Fuente de mercado",
  },
];

export default function CatalogPhotosPage() {
  const [products, setProducts] =
    useState<AdminProductRecord[]>(
      []
    );

  const [images, setImages] =
    useState<ProductImage[]>([]);

  const [form, setForm] =
    useState<ImageFormState>(
      EMPTY_FORM
    );

  const [
    sourceMode,
    setSourceMode,
  ] = useState<ImageSourceMode>(
    "upload"
  );

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(
    null
  );

  const [
    localPreviewUrl,
    setLocalPreviewUrl,
  ] = useState("");

  const [
    editingImage,
    setEditingImage,
  ] = useState<ProductImage | null>(
    null
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<number | null>(
    null
  );

  const [search, setSearch] =
    useState("");

  const [
    productFilter,
    setProductFilter,
  ] = useState<number | "all">(
    "all"
  );

  const [
    showInactive,
    setShowInactive,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const loadData =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const [
          productsData,
          imagesData,
        ] = await Promise.all([
          getAdminProducts(),
          getProductImages(),
        ]);

        setProducts(
          productsData
        );

        setImages(
          imagesData
        );
      } catch (error) {
        console.error(
          "Error cargando fotografías del catálogo:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar las fotografías del catálogo."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (
        localPreviewUrl
      ) {
        URL.revokeObjectURL(
          localPreviewUrl
        );
      }
    };
  }, [localPreviewUrl]);

  const filteredImages =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return images.filter(
        (image) => {
          if (
            !showInactive &&
            !image.active
          ) {
            return false;
          }

          if (
            productFilter !==
              "all" &&
            image.product_id !==
              productFilter
          ) {
            return false;
          }

          if (
            !normalizedSearch
          ) {
            return true;
          }

          const product =
            products.find(
              (item) =>
                item.id ===
                image.product_id
            );

          return [
            product?.name ?? "",
            image.alt_text ?? "",
            image.image_url,
            image.image_type,
          ].some((value) =>
            value
              .toLowerCase()
              .includes(
                normalizedSearch
              )
          );
        }
      );
    }, [
      images,
      productFilter,
      products,
      search,
      showInactive,
    ]);

  const productsWithImages =
    useMemo(
      () =>
        new Set(
          images.map(
            (image) =>
              image.product_id
          )
        ).size,
      [images]
    );

  const primaryImages =
    useMemo(
      () =>
        images.filter(
          (image) =>
            image.is_primary
        ).length,
      [images]
    );

  function clearLocalFile() {
    if (
      localPreviewUrl
    ) {
      URL.revokeObjectURL(
        localPreviewUrl
      );
    }

    setSelectedFile(null);
    setLocalPreviewUrl("");
  }

  function resetForm() {
    clearLocalFile();
    setForm(EMPTY_FORM);
    setSourceMode("upload");
    setEditingImage(null);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function startEditing(
    image: ProductImage
  ) {
    clearLocalFile();

    setEditingImage(image);
    setSourceMode(
      image.storage_path
        ? "upload"
        : "url"
    );

    setForm({
      product_id:
        image.product_id,
      image_url:
        image.image_url,
      image_type:
        image.image_type,
      alt_text:
        image.alt_text ?? "",
      display_order:
        image.display_order,
      is_primary:
        image.is_primary,
      active:
        image.active,
    });

    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0] ??
      null;

    setErrorMessage("");
    setSuccessMessage("");

    if (!file) {
      clearLocalFile();
      return;
    }

    if (
      !PRODUCT_IMAGE_ALLOWED_MIME_TYPES.includes(
        file.type as
          (typeof PRODUCT_IMAGE_ALLOWED_MIME_TYPES)[number]
      )
    ) {
      event.target.value = "";

      setErrorMessage(
        "Formato no permitido. Utiliza JPG, PNG o WEBP."
      );

      return;
    }

    if (
      file.size >
      PRODUCT_IMAGE_MAX_SIZE_BYTES
    ) {
      event.target.value = "";

      setErrorMessage(
        "La imagen supera el límite máximo de 5 MB."
      );

      return;
    }

    clearLocalFile();

    const previewUrl =
      URL.createObjectURL(
        file
      );

    setSelectedFile(file);
    setLocalPreviewUrl(
      previewUrl
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (
      form.product_id === ""
    ) {
      setErrorMessage(
        "Selecciona un producto."
      );
      return;
    }

    if (
      sourceMode ===
        "upload" &&
      !selectedFile &&
      !editingImage
    ) {
      setErrorMessage(
        "Selecciona una fotografía para subir."
      );
      return;
    }

    if (
      sourceMode ===
        "url" &&
      !form.image_url.trim()
    ) {
      setErrorMessage(
        "Ingresa la URL de la imagen."
      );
      return;
    }

    let uploadedStoragePath:
      | string
      | null = null;

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const productId =
        Number(
          form.product_id
        );

      let imageUrl =
        form.image_url;

      let storagePath =
        editingImage
          ?.storage_path ??
        null;

      let width =
        editingImage?.width ??
        null;

      let height =
        editingImage?.height ??
        null;

      let fileSizeBytes =
        editingImage
          ?.file_size_bytes ??
        null;

      let mimeType =
        editingImage
          ?.mime_type ??
        null;

      if (
        sourceMode ===
          "upload" &&
        selectedFile
      ) {
        const uploaded =
          await uploadProductImageFile(
            productId,
            selectedFile
          );

        imageUrl =
          uploaded.publicUrl;

        storagePath =
          uploaded.storagePath;

        uploadedStoragePath =
          uploaded.storagePath;

        width =
          uploaded.width;

        height =
          uploaded.height;

        fileSizeBytes =
          uploaded.fileSizeBytes;

        mimeType =
          uploaded.mimeType;
      }

      if (
        sourceMode ===
          "url"
      ) {
        storagePath = null;
        width = null;
        height = null;
        fileSizeBytes = null;
        mimeType = null;
      }

      const payload = {
        product_id:
          productId,
        image_url:
          imageUrl,
        storage_path:
          storagePath,
        image_type:
          form.is_primary
            ? "primary" as const
            : form.image_type,
        alt_text:
          form.alt_text,
        display_order:
          form.display_order,
        is_primary:
          form.is_primary,
        active:
          form.active,
        width,
        height,
        file_size_bytes:
          fileSizeBytes,
        mime_type:
          mimeType,
      };

      if (editingImage) {
        const previousStoragePath =
          editingImage.storage_path;

        await updateProductImage({
          id:
            editingImage.id,
          ...payload,
        });

        if (
          previousStoragePath &&
          previousStoragePath !==
            storagePath
        ) {
          try {
            await removeProductImageFile(
              previousStoragePath
            );
          } catch (
            storageCleanupError
          ) {
            console.error(
              "No fue posible retirar el archivo anterior:",
              storageCleanupError
            );
          }
        }

        setSuccessMessage(
          "La fotografía fue actualizada correctamente."
        );
      } else {
        await createProductImage(
          payload
        );

        setSuccessMessage(
          "La fotografía fue subida y registrada correctamente."
        );
      }

      clearLocalFile();
      setForm(EMPTY_FORM);
      setSourceMode("upload");
      setEditingImage(null);

      await loadData();
    } catch (error) {
      console.error(
        "Error guardando fotografía:",
        error
      );

      if (
        uploadedStoragePath
      ) {
        try {
          await removeProductImageFile(
            uploadedStoragePath
          );
        } catch (
          cleanupError
        ) {
          console.error(
            "No fue posible limpiar el archivo subido:",
            cleanupError
          );
        }
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la fotografía."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    image: ProductImage
  ) {
    if (
      deletingId !== null ||
      saving
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "¿Eliminar esta fotografía del catálogo y su archivo almacenado?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        image.id
      );

      setErrorMessage("");
      setSuccessMessage("");

      await deleteProductImage(
        image
      );

      if (
        editingImage?.id ===
        image.id
      ) {
        resetForm();
      }

      setSuccessMessage(
        "La fotografía fue eliminada correctamente."
      );

      await loadData();
    } catch (error) {
      console.error(
        "Error eliminando fotografía:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar la fotografía."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function getProductName(
    productId: number
  ): string {
    return (
      products.find(
        (product) =>
          product.id ===
          productId
      )?.name ??
      "Producto no encontrado"
    );
  }

  const previewUrl =
    localPreviewUrl ||
    form.image_url;

  return (
    <AdminGuard>
      <section className="space-y-7">
        <header className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
            Gestión visual
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Fotografías del catálogo
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
            Sube imágenes propias a Supabase Storage,
            define la fotografía principal y organiza la
            galería comercial de cada producto.
          </p>

          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-black text-green-900">
              Storage oficial: product-images
            </p>

            <p className="mt-1 text-xs leading-5 text-green-800">
              Formatos permitidos: JPG, PNG y WEBP.
              Tamaño máximo: 5 MB por archivo.
            </p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Fotografías"
            value={
              images.length
            }
            detail="Registros totales"
          />

          <SummaryCard
            label="Productos con imágenes"
            value={
              productsWithImages
            }
            detail={`${products.length} productos disponibles`}
          />

          <SummaryCard
            label="Imágenes principales"
            value={
              primaryImages
            }
            detail="Una por producto"
          />
        </section>

        <div className="grid gap-7 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
              {editingImage
                ? "Edición"
                : "Nueva fotografía"}
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              {editingImage
                ? "Actualizar fotografía"
                : "Subir fotografía"}
            </h2>

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-7 space-y-5"
            >
              <Field
                label="Producto"
                required
              >
                <select
                  value={
                    form.product_id
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        product_id:
                          event
                            .target
                            .value
                            ? Number(
                                event
                                  .target
                                  .value
                              )
                            : "",
                      })
                    )
                  }
                  disabled={saving}
                  className={
                    inputClassName
                  }
                >
                  <option value="">
                    Selecciona un producto
                  </option>

                  {products.map(
                    (
                      product
                    ) => (
                      <option
                        key={
                          product.id
                        }
                        value={
                          product.id
                        }
                      >
                        {
                          product.name
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSourceMode(
                      "upload"
                    );

                    setErrorMessage(
                      ""
                    );
                  }}
                  className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                    sourceMode ===
                    "upload"
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-zinc-500"
                  }`}
                >
                  Subir archivo
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSourceMode(
                      "url"
                    );

                    clearLocalFile();
                    setErrorMessage(
                      ""
                    );
                  }}
                  className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                    sourceMode ===
                    "url"
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-zinc-500"
                  }`}
                >
                  Usar URL
                </button>
              </div>

              {sourceMode ===
              "upload" ? (
                <Field
                  label="Archivo de imagen"
                  required={
                    !editingImage
                  }
                >
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center transition hover:border-green-400 hover:bg-green-50">
                    <span className="text-sm font-black text-zinc-800">
                      Seleccionar fotografía
                    </span>

                    <span className="mt-2 text-xs leading-5 text-zinc-500">
                      JPG, PNG o WEBP ·
                      máximo 5 MB
                    </span>

                    {selectedFile && (
                      <span className="mt-3 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                        {
                          selectedFile.name
                        }
                      </span>
                    )}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={
                        handleFileChange
                      }
                      disabled={
                        saving
                      }
                      className="sr-only"
                    />
                  </label>
                </Field>
              ) : (
                <Field
                  label="URL de la imagen"
                  required
                >
                  <input
                    type="url"
                    value={
                      form.image_url
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          image_url:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="https://..."
                    disabled={
                      saving
                    }
                    className={
                      inputClassName
                    }
                  />
                </Field>
              )}

              {previewUrl && (
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                  <div className="aspect-[4/3] bg-white">
                    <img
                      src={
                        previewUrl
                      }
                      alt="Vista previa"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              )}

              <Field label="Tipo de imagen">
                <select
                  value={
                    form.image_type
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        image_type:
                          event
                            .target
                            .value as ImageType,
                      })
                    )
                  }
                  disabled={
                    saving ||
                    form.is_primary
                  }
                  className={
                    inputClassName
                  }
                >
                  {IMAGE_TYPE_OPTIONS.map(
                    (
                      option
                    ) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Texto alternativo">
                <input
                  type="text"
                  value={
                    form.alt_text
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        alt_text:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Descripción accesible de la imagen"
                  disabled={
                    saving
                  }
                  className={
                    inputClassName
                  }
                />
              </Field>

              <Field label="Orden de visualización">
                <input
                  type="number"
                  min="0"
                  value={
                    form.display_order
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        display_order:
                          Number(
                            event
                              .target
                              .value
                          ),
                      })
                    )
                  }
                  disabled={
                    saving
                  }
                  className={
                    inputClassName
                  }
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleField
                  label="Imagen principal"
                  checked={
                    form.is_primary
                  }
                  disabled={
                    saving
                  }
                  onChange={(
                    checked
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        is_primary:
                          checked,
                        image_type:
                          checked
                            ? "primary"
                            : current.image_type ===
                                "primary"
                              ? "gallery"
                              : current.image_type,
                      })
                    )
                  }
                />

                <ToggleField
                  label="Imagen activa"
                  checked={
                    form.active
                  }
                  disabled={
                    saving
                  }
                  onChange={(
                    checked
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        active:
                          checked,
                      })
                    )
                  }
                />
              </div>

              {errorMessage && (
                <MessagePanel
                  type="error"
                  message={
                    errorMessage
                  }
                />
              )}

              {successMessage && (
                <MessagePanel
                  type="success"
                  message={
                    successMessage
                  }
                />
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={
                    saving ||
                    form.product_id ===
                      "" ||
                    (sourceMode ===
                      "upload" &&
                      !selectedFile &&
                      !editingImage) ||
                    (sourceMode ===
                      "url" &&
                      !form.image_url.trim())
                  }
                  className="flex flex-1 items-center justify-center rounded-2xl bg-green-600 px-6 py-4 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  {saving
                    ? "Guardando..."
                    : editingImage
                      ? "Actualizar fotografía"
                      : "Subir fotografía"}
                </button>

                {editingImage && (
                  <button
                    type="button"
                    onClick={
                      resetForm
                    }
                    disabled={
                      saving
                    }
                    className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm font-black text-zinc-700"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
                Biblioteca visual
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Fotografías registradas
              </h2>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_220px_auto]">
              <input
                type="search"
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Buscar fotografía..."
                className={
                  inputClassName
                }
              />

              <select
                value={
                  productFilter
                }
                onChange={(
                  event
                ) =>
                  setProductFilter(
                    event.target
                      .value ===
                      "all"
                      ? "all"
                      : Number(
                          event
                            .target
                            .value
                        )
                  )
                }
                className={
                  inputClassName
                }
              >
                <option value="all">
                  Todos los productos
                </option>

                {products.map(
                  (
                    product
                  ) => (
                    <option
                      key={
                        product.id
                      }
                      value={
                        product.id
                      }
                    >
                      {
                        product.name
                      }
                    </option>
                  )
                )}
              </select>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    showInactive
                  }
                  onChange={(
                    event
                  ) =>
                    setShowInactive(
                      event.target
                        .checked
                    )
                  }
                  className="h-4 w-4 accent-green-600"
                />

                <span className="text-sm font-black text-zinc-700">
                  Inactivas
                </span>
              </label>
            </div>

            {loading ? (
              <LoadingPanel />
            ) : filteredImages.length ===
              0 ? (
              <EmptyPanel />
            ) : (
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {filteredImages.map(
                  (
                    image
                  ) => (
                    <article
                      key={
                        image.id
                      }
                      className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50"
                    >
                      <div className="aspect-[4/3] bg-white">
                        <img
                          src={
                            image.image_url
                          }
                          alt={
                            image.alt_text ??
                            getProductName(
                              image.product_id
                            )
                          }
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-zinc-950">
                            {getProductName(
                              image.product_id
                            )}
                          </h3>

                          {image.is_primary && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-green-700">
                              Principal
                            </span>
                          )}

                          {image.storage_path && (
                            <span className="rounded-full bg-sky-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-sky-700">
                              Storage
                            </span>
                          )}

                          {!image.active && (
                            <span className="rounded-full bg-zinc-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-600">
                              Inactiva
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                          {getImageTypeLabel(
                            image.image_type
                          )}
                        </p>

                        {image.file_size_bytes && (
                          <p className="mt-3 text-xs font-bold text-zinc-500">
                            {formatBytes(
                              image.file_size_bytes
                            )}
                            {image.width &&
                            image.height
                              ? ` · ${image.width} × ${image.height} px`
                              : ""}
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                image
                              )
                            }
                            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-black text-zinc-700"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(
                                image
                              )
                            }
                            disabled={
                              deletingId ===
                              image.id
                            }
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-black text-red-700 disabled:opacity-50"
                          >
                            {deletingId ===
                            image.id
                              ? "Eliminando..."
                              : "Eliminar"}
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </section>
    </AdminGuard>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60";

function getImageTypeLabel(
  value: ImageType
): string {
  return (
    IMAGE_TYPE_OPTIONS.find(
      (option) =>
        option.value === value
    )?.label ??
    "Imagen"
  );
}

function formatBytes(
  value: number
): string {
  if (
    value < 1024
  ) {
    return `${value} B`;
  }

  if (
    value <
    1024 * 1024
  ) {
    return `${(
      value / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    value /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-[1.6rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>

      <p className="mt-3 text-4xl font-black tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-xs font-bold text-zinc-500">
        {detail}
      </p>
    </article>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-black text-zinc-950">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (
    checked: boolean
  ) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(
          event
        ) =>
          onChange(
            event.target.checked
          )
        }
        className="h-4 w-4 accent-green-600"
      />

      <span className="text-sm font-black text-zinc-900">
        {label}
      </span>
    </label>
  );
}

function MessagePanel({
  type,
  message,
}: {
  type:
    | "success"
    | "error";
  message: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 text-sm font-bold ${
        type === "success"
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {message}
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="mt-7 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-12 text-center">
      <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

      <p className="mt-4 font-black text-zinc-700">
        Cargando fotografías...
      </p>
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="mt-7 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
      <p className="text-lg font-black text-zinc-700">
        Todavía no existen fotografías
      </p>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        Sube la primera imagen para
        comenzar a preparar el catálogo real.
      </p>
    </div>
  );
}