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
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from "@/services/suppliers";

import type {
  SupplierInput,
} from "@/services/suppliers";

import type {
  Supplier,
} from "@/types/catalogMaster";

const EMPTY_FORM: SupplierInput = {
  name: "",
  legal_name: "",
  tax_id: "",
  phone: "",
  email: "",
  address: "",
  city: "Riobamba",
  province: "Chimborazo",
  country: "Ecuador",
  contact_name: "",
  notes: "",
  active: true,
  preferred: false,
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [form, setForm] =
    useState<SupplierInput>(
      EMPTY_FORM
    );

  const [editingSupplier, setEditingSupplier] =
    useState<Supplier | null>(
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

  const loadSuppliers =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await getSuppliers(true);

        setSuppliers(data);
      } catch (error) {
        console.error(
          "Error cargando proveedores:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar los proveedores."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadSuppliers();
  }, [loadSuppliers]);

  const filteredSuppliers =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return suppliers.filter(
        (supplier) => {
          if (
            !showInactive &&
            !supplier.active
          ) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          return [
            supplier.name,
            supplier.legal_name ?? "",
            supplier.tax_id ?? "",
            supplier.contact_name ?? "",
            supplier.phone ?? "",
            supplier.email ?? "",
            supplier.city ?? "",
          ].some((value) =>
            value
              .toLowerCase()
              .includes(normalizedSearch)
          );
        }
      );
    }, [
      suppliers,
      search,
      showInactive,
    ]);

  const activeCount =
    suppliers.filter(
      (supplier) =>
        supplier.active
    ).length;

  const preferredCount =
    suppliers.filter(
      (supplier) =>
        supplier.preferred
    ).length;

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingSupplier(null);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function startEditing(
    supplier: Supplier
  ) {
    setEditingSupplier(supplier);

    setForm({
      name: supplier.name,
      legal_name:
        supplier.legal_name ?? "",
      tax_id:
        supplier.tax_id ?? "",
      phone:
        supplier.phone ?? "",
      email:
        supplier.email ?? "",
      address:
        supplier.address ?? "",
      city:
        supplier.city ?? "Riobamba",
      province:
        supplier.province ??
        "Chimborazo",
      country:
        supplier.country ??
        "Ecuador",
      contact_name:
        supplier.contact_name ?? "",
      notes:
        supplier.notes ?? "",
      active: supplier.active,
      preferred:
        supplier.preferred,
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

      if (editingSupplier) {
        await updateSupplier({
          id: editingSupplier.id,
          ...form,
        });

        setSuccessMessage(
          "El proveedor fue actualizado correctamente."
        );
      } else {
        await createSupplier(form);

        setSuccessMessage(
          "El proveedor fue creado correctamente."
        );
      }

      setForm(EMPTY_FORM);
      setEditingSupplier(null);

      await loadSuppliers();
    } catch (error) {
      console.error(
        "Error guardando proveedor:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el proveedor."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleSupplier(
    supplier: Supplier,
    field: "active" | "preferred"
  ) {
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await updateSupplier({
        id: supplier.id,
        name: supplier.name,
        legal_name:
          supplier.legal_name,
        tax_id:
          supplier.tax_id,
        phone:
          supplier.phone,
        email:
          supplier.email,
        address:
          supplier.address,
        city:
          supplier.city,
        province:
          supplier.province,
        country:
          supplier.country,
        contact_name:
          supplier.contact_name,
        notes:
          supplier.notes,
        active:
          field === "active"
            ? !supplier.active
            : supplier.active,
        preferred:
          field === "preferred"
            ? !supplier.preferred
            : supplier.preferred,
      });

      setSuccessMessage(
        field === "active"
          ? supplier.active
            ? "El proveedor fue desactivado."
            : "El proveedor fue activado."
          : supplier.preferred
            ? "El proveedor dejó de ser preferente."
            : "El proveedor fue marcado como preferente."
      );

      await loadSuppliers();
    } catch (error) {
      console.error(
        "Error actualizando proveedor:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el proveedor."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    supplier: Supplier
  ) {
    if (
      deletingId !== null ||
      saving
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `¿Eliminar al proveedor "${supplier.name}"? Esta acción solo será posible si no tiene productos relacionados.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(supplier.id);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteSupplier(
        supplier.id
      );

      if (
        editingSupplier?.id ===
        supplier.id
      ) {
        resetForm();
      }

      setSuccessMessage(
        "El proveedor fue eliminado correctamente."
      );

      await loadSuppliers();
    } catch (error) {
      console.error(
        "Error eliminando proveedor:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar el proveedor."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminGuard>
      <section className="space-y-7">
        <header className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
            Abastecimiento
          </p>

          <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Gestión de proveedores
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
                Registra proveedores, contactos y referencias
                para preparar Mercado IA, precios e inventario.
              </p>
            </div>

            <Link
              href="/admin/catalog/settings"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-black text-zinc-700 transition hover:border-green-300 hover:text-green-700"
            >
              Ver categorías
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Proveedores"
            value={suppliers.length}
            detail="Registrados"
          />

          <SummaryCard
            label="Activos"
            value={activeCount}
            detail="Disponibles"
          />

          <SummaryCard
            label="Preferentes"
            value={preferredCount}
            detail="Con prioridad comercial"
          />
        </section>

        <div className="grid gap-7 xl:grid-cols-[0.86fr_1.14fr]">
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
              {editingSupplier
                ? "Edición"
                : "Nuevo registro"}
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              {editingSupplier
                ? "Actualizar proveedor"
                : "Crear proveedor"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              <Field label="Nombre comercial" required>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  disabled={saving}
                  placeholder="Ej. Distribuidora Andina"
                  className={inputClassName}
                />
              </Field>

              <Field label="Razón social">
                <input
                  value={form.legal_name ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      legal_name:
                        event.target.value,
                    }))
                  }
                  disabled={saving}
                  className={inputClassName}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="RUC / identificación">
                  <input
                    value={form.tax_id ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        tax_id:
                          event.target.value,
                      }))
                    }
                    disabled={saving}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Persona de contacto">
                  <input
                    value={
                      form.contact_name ?? ""
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        contact_name:
                          event.target.value,
                      }))
                    }
                    disabled={saving}
                    className={inputClassName}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Teléfono">
                  <input
                    type="tel"
                    value={form.phone ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone:
                          event.target.value,
                      }))
                    }
                    disabled={saving}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Correo">
                  <input
                    type="email"
                    value={form.email ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email:
                          event.target.value,
                      }))
                    }
                    disabled={saving}
                    className={inputClassName}
                  />
                </Field>
              </div>

              <Field label="Dirección">
                <input
                  value={form.address ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      address:
                        event.target.value,
                    }))
                  }
                  disabled={saving}
                  className={inputClassName}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Ciudad">
                  <input
                    value={form.city ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        city:
                          event.target.value,
                      }))
                    }
                    disabled={saving}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Provincia">
                  <input
                    value={
                      form.province ?? ""
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        province:
                          event.target.value,
                      }))
                    }
                    disabled={saving}
                    className={inputClassName}
                  />
                </Field>

                <Field label="País">
                  <input
                    value={form.country ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        country:
                          event.target.value,
                      }))
                    }
                    disabled={saving}
                    className={inputClassName}
                  />
                </Field>
              </div>

              <Field label="Notas">
                <textarea
                  rows={4}
                  value={form.notes ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes:
                        event.target.value,
                    }))
                  }
                  disabled={saving}
                  className={inputClassName}
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleField
                  label="Proveedor activo"
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
                  label="Proveedor preferente"
                  checked={
                    form.preferred ?? false
                  }
                  disabled={saving}
                  onChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      preferred: checked,
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
                  {saving
                    ? "Guardando..."
                    : editingSupplier
                      ? "Actualizar proveedor"
                      : "Crear proveedor"}
                </button>

                {editingSupplier && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm font-black text-zinc-700"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
                  Red comercial
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  Proveedores registrados
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadSuppliers()
                }
                disabled={loading}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-black text-zinc-700"
              >
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
                placeholder="Buscar proveedor..."
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
                  Mostrar inactivos
                </span>
              </label>
            </div>

            {loading ? (
              <LoadingPanel />
            ) : filteredSuppliers.length ===
              0 ? (
              <EmptyPanel />
            ) : (
              <div className="mt-7 space-y-4">
                {filteredSuppliers.map(
                  (supplier) => (
                    <article
                      key={supplier.id}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-black text-zinc-950">
                              {supplier.name}
                            </h3>

                            <StatusBadge
                              active={
                                supplier.active
                              }
                            />

                            {supplier.preferred && (
                              <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
                                Preferente
                              </span>
                            )}
                          </div>

                          <p className="mt-3 text-sm font-bold text-zinc-600">
                            {supplier.contact_name ||
                              "Sin contacto asignado"}
                          </p>

                          <div className="mt-3 space-y-1 text-xs text-zinc-500">
                            <p>
                              {supplier.phone ||
                                "Sin teléfono"}
                            </p>

                            <p className="break-all">
                              {supplier.email ||
                                "Sin correo"}
                            </p>

                            <p>
                              {[
                                supplier.city,
                                supplier.province,
                              ]
                                .filter(Boolean)
                                .join(", ") ||
                                "Sin ubicación"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                supplier
                              )
                            }
                            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-black text-zinc-700"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void toggleSupplier(
                                supplier,
                                "preferred"
                              )
                            }
                            disabled={saving}
                            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-black text-amber-700 disabled:opacity-50"
                          >
                            {supplier.preferred
                              ? "Quitar preferente"
                              : "Marcar preferente"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void toggleSupplier(
                                supplier,
                                "active"
                              )
                            }
                            disabled={saving}
                            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-black text-zinc-700 disabled:opacity-50"
                          >
                            {supplier.active
                              ? "Desactivar"
                              : "Activar"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(
                                supplier
                              )
                            }
                            disabled={
                              deletingId ===
                                supplier.id ||
                              saving
                            }
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-black text-red-700 disabled:opacity-50"
                          >
                            {deletingId ===
                            supplier.id
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
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) =>
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
      {active ? "Activo" : "Inactivo"}
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
        Cargando proveedores...
      </p>
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="mt-7 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
      <p className="text-lg font-black text-zinc-700">
        Todavía no existen proveedores
      </p>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        Crea el primer proveedor para
        preparar el abastecimiento y Mercado IA.
      </p>
    </div>
  );
}