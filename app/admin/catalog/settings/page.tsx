"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

import AdminGuard from "@/components/admin/AdminGuard";

import {
  createCatalogCategory,
  deleteCatalogCategory,
  getCatalogCategories,
  getCatalogFoundationSummary,
  updateCatalogCategory,
} from "@/services/catalogMaster";

import type {
  CatalogCategory,
  CatalogFoundationSummary,
  CreateCatalogCategoryData,
} from "@/types/catalogMaster";

const EMPTY_SUMMARY: CatalogFoundationSummary = {
  categories: 0,
  activeCategories: 0,
  suppliers: 0,
  activeSuppliers: 0,
  productImages: 0,
  currentPrices: 0,
  inventoryRecords: 0,
  aiRecords: 0,
  aiReadyProducts: 0,
};

const EMPTY_FORM: CreateCatalogCategoryData = {
  parent_id: null,
  name: "",
  slug: "",
  description: "",
  icon: "",
  image_url: "",
  display_order: 0,
  active: true,
  featured: false,
};

export default function CatalogSettingsPage() {
  const [categories, setCategories] = useState<
    CatalogCategory[]
  >([]);

  const [summary, setSummary] =
    useState<CatalogFoundationSummary>(
      EMPTY_SUMMARY
    );

  const [form, setForm] =
    useState<CreateCatalogCategoryData>(
      EMPTY_FORM
    );

  const [editingCategory, setEditingCategory] =
    useState<CatalogCategory | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [showInactive, setShowInactive] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [
        categoriesData,
        summaryData,
      ] = await Promise.all([
        getCatalogCategories(true),
        getCatalogFoundationSummary(),
      ]);

      setCategories(categoriesData);
      setSummary(summaryData);
    } catch (error) {
      console.error(
        "Error cargando la configuración del catálogo:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar la configuración del catálogo."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredCategories =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return categories.filter(
        (category) => {
          if (
            !showInactive &&
            !category.active
          ) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          return [
            category.name,
            category.slug,
            category.description ?? "",
          ].some((value) =>
            value
              .toLowerCase()
              .includes(normalizedSearch)
          );
        }
      );
    }, [
      categories,
      search,
      showInactive,
    ]);

  const parentOptions =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            category.id !==
            editingCategory?.id
        ),
      [
        categories,
        editingCategory,
      ]
    );

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingCategory(null);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function startEditing(
    category: CatalogCategory
  ) {
    setEditingCategory(category);

    setForm({
      parent_id: category.parent_id,
      name: category.name,
      slug: category.slug,
      description:
        category.description ?? "",
      icon: category.icon ?? "",
      image_url:
        category.image_url ?? "",
      display_order:
        category.display_order,
      active: category.active,
      featured: category.featured,
    });

    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (editingCategory) {
        await updateCatalogCategory({
          id: editingCategory.id,
          ...form,
        });

        setSuccessMessage(
          "La categoría fue actualizada correctamente."
        );
      } else {
        await createCatalogCategory(
          form
        );

        setSuccessMessage(
          "La categoría fue creada correctamente."
        );
      }

      setForm(EMPTY_FORM);
      setEditingCategory(null);

      await loadData();
    } catch (error) {
      console.error(
        "Error guardando la categoría:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la categoría."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    category: CatalogCategory
  ) {
    if (
      deletingId !== null ||
      saving
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `¿Eliminar la categoría "${category.name}"? Esta acción solo será posible si no tiene productos asociados.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(category.id);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteCatalogCategory(
        category.id
      );

      setSuccessMessage(
        "La categoría fue eliminada correctamente."
      );

      if (
        editingCategory?.id ===
        category.id
      ) {
        resetForm();
      }

      await loadData();
    } catch (error) {
      console.error(
        "Error eliminando la categoría:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar la categoría."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleCategoryStatus(
    category: CatalogCategory
  ) {
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await updateCatalogCategory({
        id: category.id,
        parent_id: category.parent_id,
        name: category.name,
        slug: category.slug,
        description:
          category.description,
        icon: category.icon,
        image_url:
          category.image_url,
        display_order:
          category.display_order,
        active: !category.active,
        featured: category.featured,
      });

      setSuccessMessage(
        category.active
          ? "La categoría fue desactivada."
          : "La categoría fue activada."
      );

      await loadData();
    } catch (error) {
      console.error(
        "Error actualizando el estado de la categoría:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el estado."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleFeatured(
    category: CatalogCategory
  ) {
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await updateCatalogCategory({
        id: category.id,
        parent_id: category.parent_id,
        name: category.name,
        slug: category.slug,
        description:
          category.description,
        icon: category.icon,
        image_url:
          category.image_url,
        display_order:
          category.display_order,
        active: category.active,
        featured: !category.featured,
      });

      setSuccessMessage(
        category.featured
          ? "La categoría dejó de estar destacada."
          : "La categoría fue marcada como destacada."
      );

      await loadData();
    } catch (error) {
      console.error(
        "Error actualizando la categoría destacada:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar la categoría."
      );
    } finally {
      setSaving(false);
    }
  }

  function getParentName(
    parentId: number | null
  ): string {
    if (!parentId) {
      return "Categoría principal";
    }

    return (
      categories.find(
        (category) =>
          category.id === parentId
      )?.name ??
      "Categoría superior"
    );
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#f4f7f4] px-4 py-8 text-zinc-950 sm:px-6 lg:px-10">
        <section className="mx-auto max-w-[1500px]">
          <header className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-9 text-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.8)] sm:px-10 lg:px-12 lg:py-12">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-green-500/20 blur-3xl"
            />

            <div className="relative">
              <Link
                href="/admin/catalog"
                className="inline-flex items-center gap-2 text-sm font-black text-green-300 transition hover:text-white"
              >
                <BackIcon />
                Volver al centro de catálogo
              </Link>

              <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-green-300">
                Catálogo Maestro
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Categorías y reglas del catálogo
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
                Administra la estructura comercial que se utilizará
                para cargar el catálogo real de MercaNova GO.
              </p>

              <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-green-300">
                <span className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_18px_rgba(74,222,128,0.85)]" />
                Fundación ERP 11.0 activa
              </div>
            </div>
          </header>

          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Categorías"
              value={summary.categories}
              detail={`${summary.activeCategories} activas`}
            />

            <SummaryCard
              label="Proveedores"
              value={summary.suppliers}
              detail={`${summary.activeSuppliers} activos`}
            />

            <SummaryCard
              label="Precios vigentes"
              value={summary.currentPrices}
              detail="Registros actuales"
            />

            <SummaryCard
              label="Productos preparados"
              value={summary.aiRecords}
              detail={`${summary.aiReadyProducts} listos para IA`}
            />
          </section>

          <div className="mt-7 grid gap-7 xl:grid-cols-[0.82fr_1.18fr]">
            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)] sm:p-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
                  {editingCategory
                    ? "Edición"
                    : "Nueva categoría"}
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  {editingCategory
                    ? "Actualizar categoría"
                    : "Crear categoría"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Define nombre, jerarquía, orden y estado antes
                  de cargar los productos reales.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
              >
                <Field
                  label="Nombre"
                  required
                >
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Ej. Frutas"
                    disabled={saving}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Slug">
                  <input
                    type="text"
                    value={form.slug ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        slug: event.target.value,
                      }))
                    }
                    placeholder="Se genera automáticamente"
                    disabled={saving}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Categoría superior">
                  <select
                    value={
                      form.parent_id ?? ""
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        parent_id:
                          event.target.value
                            ? Number(
                                event.target.value
                              )
                            : null,
                      }))
                    }
                    disabled={saving}
                    className={inputClassName}
                  >
                    <option value="">
                      Categoría principal
                    </option>

                    {parentOptions.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="Descripción">
                  <textarea
                    value={
                      form.description ?? ""
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description:
                          event.target.value,
                      }))
                    }
                    placeholder="Descripción comercial breve"
                    rows={4}
                    disabled={saving}
                    className={inputClassName}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Orden">
                    <input
                      type="number"
                      min="0"
                      value={
                        form.display_order ??
                        0
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            display_order:
                              Number(
                                event.target
                                  .value
                              ),
                          })
                        )
                      }
                      disabled={saving}
                      className={inputClassName}
                    />
                  </Field>

                  <Field label="Ícono">
                    <input
                      type="text"
                      value={form.icon ?? ""}
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            icon: event.target
                              .value,
                          })
                        )
                      }
                      placeholder="Nombre o referencia SVG"
                      disabled={saving}
                      className={inputClassName}
                    />
                  </Field>
                </div>

                <Field label="Imagen de categoría">
                  <input
                    type="url"
                    value={
                      form.image_url ?? ""
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        image_url:
                          event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    disabled={saving}
                    className={inputClassName}
                  />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ToggleField
                    label="Categoría activa"
                    description="Disponible para uso comercial."
                    checked={
                      form.active ?? true
                    }
                    disabled={saving}
                    onChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        active: checked,
                      }))
                    }
                  />

                  <ToggleField
                    label="Categoría destacada"
                    description="Podrá mostrarse con prioridad."
                    checked={
                      form.featured ?? false
                    }
                    disabled={saving}
                    onChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        featured: checked,
                      }))
                    }
                  />
                </div>

                {errorMessage && (
                  <MessagePanel
                    type="error"
                    message={errorMessage}
                  />
                )}

                {successMessage && (
                  <MessagePanel
                    type="success"
                    message={successMessage}
                  />
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !form.name.trim()
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-4 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                  >
                    {saving ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Guardando...
                      </>
                    ) : editingCategory ? (
                      "Actualizar categoría"
                    ) : (
                      "Crear categoría"
                    )}
                  </button>

                  {editingCategory && (
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={saving}
                      className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm font-black text-zinc-700 transition hover:bg-zinc-50"
                    >
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)] sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
                    Estructura comercial
                  </p>

                  <h2 className="mt-2 text-3xl font-black tracking-tight">
                    Categorías registradas
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void loadData()
                  }
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-black text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
                >
                  <RefreshIcon
                    spinning={loading}
                  />
                  Actualizar
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Buscar categoría..."
                  className={inputClassName}
                />

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(event) =>
                      setShowInactive(
                        event.target.checked
                      )
                    }
                    className="h-4 w-4 accent-green-600"
                  />

                  <span className="text-sm font-black text-zinc-700">
                    Mostrar inactivas
                  </span>
                </label>
              </div>

              {loading ? (
                <div className="mt-7 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-12 text-center">
                  <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

                  <p className="mt-4 font-black text-zinc-700">
                    Cargando categorías...
                  </p>
                </div>
              ) : filteredCategories.length ===
                0 ? (
                <div className="mt-7 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
                  <p className="text-lg font-black text-zinc-700">
                    Todavía no existen categorías
                  </p>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                    Crea la primera categoría maestra
                    para comenzar a estructurar el
                    catálogo real.
                  </p>
                </div>
              ) : (
                <div className="mt-7 space-y-4">
                  {filteredCategories.map(
                    (category) => (
                      <article
                        key={category.id}
                        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-black text-zinc-950">
                                {category.name}
                              </h3>

                              <StatusBadge
                                active={
                                  category.active
                                }
                              />

                              {category.featured && (
                                <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
                                  Destacada
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-xs font-black uppercase tracking-wider text-zinc-400">
                              {category.slug}
                            </p>

                            <p className="mt-3 text-sm leading-6 text-zinc-600">
                              {category.description ||
                                "Sin descripción"}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-zinc-500">
                              <span className="rounded-full bg-white px-3 py-1.5">
                                {getParentName(
                                  category.parent_id
                                )}
                              </span>

                              <span className="rounded-full bg-white px-3 py-1.5">
                                Orden{" "}
                                {
                                  category.display_order
                                }
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                startEditing(
                                  category
                                )
                              }
                              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-black text-zinc-700 transition hover:border-green-300 hover:text-green-700"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void toggleFeatured(
                                  category
                                )
                              }
                              disabled={saving}
                              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-black text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                            >
                              {category.featured
                                ? "Quitar destacado"
                                : "Destacar"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void toggleCategoryStatus(
                                  category
                                )
                              }
                              disabled={saving}
                              className={`rounded-xl border px-4 py-2.5 text-xs font-black transition disabled:opacity-50 ${
                                category.active
                                  ? "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                                  : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              {category.active
                                ? "Desactivar"
                                : "Activar"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleDelete(
                                  category
                                )
                              }
                              disabled={
                                deletingId ===
                                  category.id ||
                                saving
                              }
                              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              {deletingId ===
                              category.id
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
      </main>
    </AdminGuard>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60";

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
    <article className="rounded-[1.6rem] border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.6)]">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>

      <p className="mt-3 text-4xl font-black tracking-tight text-zinc-950">
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
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
        className="mt-1 h-4 w-4 accent-green-600"
      />

      <span>
        <span className="block text-sm font-black text-zinc-900">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-zinc-500">
          {description}
        </span>
      </span>
    </label>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
        active
          ? "bg-green-100 text-green-700"
          : "bg-zinc-200 text-zinc-600"
      }`}
    >
      {active ? "Activa" : "Inactiva"}
    </span>
  );
}

function MessagePanel({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  const success =
    type === "success";

  return (
    <div
      role={
        success ? "status" : "alert"
      }
      className={`rounded-2xl border p-4 text-sm font-bold ${
        success
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {message}
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon({
  spinning,
}: {
  spinning: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`h-4 w-4 ${
        spinning
          ? "animate-spin"
          : ""
      }`}
    >
      <path
        d="M20 7v5h-5M4 17v-5h5M6.1 8.2A7 7 0 0 1 18.5 6M17.9 15.8A7 7 0 0 1 5.5 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}