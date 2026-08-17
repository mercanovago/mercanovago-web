"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import AdminGuard from "@/components/admin/AdminGuard";

import {
  createDeliveryDriver,
  deleteDeliveryDriver,
  DRIVER_STATUSES,
  DRIVER_VEHICLE_TYPES,
  getDeliveryDrivers,
  setDeliveryDriverActive,
  updateDeliveryDriver,
  updateDeliveryDriverStatus,
  type DeliveryDriver,
  type DeliveryDriverFormData,
  type DriverStatus,
  type DriverVehicleType,
} from "@/services/deliveryDrivers";

type StatusFilter = "Todos" | DriverStatus;
type SortOption = "name" | "newest" | "oldest" | "status";

interface DriverFormState {
  first_name: string;
  last_name: string;
  identification: string;
  phone: string;
  email: string;
  vehicle_type: DriverVehicleType;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_color: string;
  vehicle_plate: string;
  status: DriverStatus;
  active: boolean;
  notes: string;
}

const EMPTY_FORM: DriverFormState = {
  first_name: "",
  last_name: "",
  identification: "",
  phone: "",
  email: "",
  vehicle_type: "Moto",
  vehicle_brand: "",
  vehicle_model: "",
  vehicle_color: "",
  vehicle_plate: "",
  status: "Disponible",
  active: true,
  notes: "",
};

const STATUS_FILTERS: StatusFilter[] = [
  "Todos",
  ...DRIVER_STATUSES,
];

export default function AdminDeliveryPage() {
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilter>("Todos");
  const [sortOption, setSortOption] =
    useState<SortOption>("name");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] =
    useState<DeliveryDriver | null>(null);
  const [form, setForm] =
    useState<DriverFormState>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [updatingDriverId, setUpdatingDriverId] =
    useState<number | null>(null);
  const [deletingDriverId, setDeletingDriverId] =
    useState<number | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadDrivers = useCallback(
    async (showFullLoader = false) => {
      try {
        if (showFullLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setErrorMessage("");

        const data = await getDeliveryDrivers();

        setDrivers(data);
      } catch (error) {
        console.error(error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar los repartidores."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadDrivers(true);
  }, [loadDrivers]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const summary = useMemo(() => {
    return {
      total: drivers.length,
      available: drivers.filter(
        (driver) =>
          driver.active &&
          driver.status === "Disponible"
      ).length,
      busy: drivers.filter(
        (driver) =>
          driver.active &&
          driver.status === "Ocupado"
      ).length,
      outOfService: drivers.filter(
        (driver) =>
          driver.active &&
          driver.status === "Fuera de servicio"
      ).length,
      inactive: drivers.filter(
        (driver) =>
          !driver.active ||
          driver.status === "Inactivo"
      ).length,
    };
  }, [drivers]);

  const visibleDrivers = useMemo(() => {
    const cleanSearch = normalizeText(searchTerm);

    const filtered = drivers.filter((driver) => {
      const matchesStatus =
        selectedStatus === "Todos" ||
        driver.status === selectedStatus;

      if (!matchesStatus) {
        return false;
      }

      if (!cleanSearch) {
        return true;
      }

      const searchable = normalizeText(
        [
          driver.first_name,
          driver.last_name,
          driver.identification ?? "",
          driver.phone,
          driver.email ?? "",
          driver.vehicle_type,
          driver.vehicle_brand ?? "",
          driver.vehicle_model ?? "",
          driver.vehicle_color ?? "",
          driver.vehicle_plate ?? "",
          driver.status,
          driver.notes ?? "",
        ].join(" ")
      );

      return searchable.includes(cleanSearch);
    });

    return [...filtered].sort((first, second) => {
      if (sortOption === "newest") {
        return (
          new Date(second.created_at).getTime() -
          new Date(first.created_at).getTime()
        );
      }

      if (sortOption === "oldest") {
        return (
          new Date(first.created_at).getTime() -
          new Date(second.created_at).getTime()
        );
      }

      if (sortOption === "status") {
        return first.status.localeCompare(
          second.status,
          "es"
        );
      }

      const firstName =
        `${first.first_name} ${first.last_name}`.trim();

      const secondName =
        `${second.first_name} ${second.last_name}`.trim();

      return firstName.localeCompare(
        secondName,
        "es"
      );
    });
  }, [
    drivers,
    searchTerm,
    selectedStatus,
    sortOption,
  ]);

  function openCreateModal() {
    setEditingDriver(null);
    setForm(EMPTY_FORM);
    setErrorMessage("");
    setModalOpen(true);
  }

  function openEditModal(driver: DeliveryDriver) {
    setEditingDriver(driver);

    setForm({
      first_name: driver.first_name,
      last_name: driver.last_name,
      identification: driver.identification ?? "",
      phone: driver.phone,
      email: driver.email ?? "",
      vehicle_type: driver.vehicle_type,
      vehicle_brand: driver.vehicle_brand ?? "",
      vehicle_model: driver.vehicle_model ?? "",
      vehicle_color: driver.vehicle_color ?? "",
      vehicle_plate: driver.vehicle_plate ?? "",
      status: driver.status,
      active: driver.active,
      notes: driver.notes ?? "",
    });

    setErrorMessage("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingDriver(null);
    setForm(EMPTY_FORM);
  }

  function updateFormField<K extends keyof DriverFormState>(
    field: K,
    value: DriverFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setErrorMessage("");

      const payload: DeliveryDriverFormData = {
        first_name: form.first_name,
        last_name: form.last_name,
        identification:
          form.identification || null,
        phone: form.phone,
        email: form.email || null,
        vehicle_type: form.vehicle_type,
        vehicle_brand:
          form.vehicle_brand || null,
        vehicle_model:
          form.vehicle_model || null,
        vehicle_color:
          form.vehicle_color || null,
        vehicle_plate:
          form.vehicle_plate || null,
        status: form.active
          ? form.status
          : "Inactivo",
        active: form.active,
        notes: form.notes || null,
      };

      if (editingDriver) {
        const updatedDriver =
          await updateDeliveryDriver(
            editingDriver.id,
            payload
          );

        setDrivers((currentDrivers) =>
          currentDrivers.map((driver) =>
            driver.id === updatedDriver.id
              ? updatedDriver
              : driver
          )
        );

        setSuccessMessage(
          `Repartidor ${updatedDriver.first_name} ${updatedDriver.last_name} actualizado correctamente.`
        );
      } else {
        const createdDriver =
          await createDeliveryDriver(payload);

        setDrivers((currentDrivers) => [
          createdDriver,
          ...currentDrivers,
        ]);

        setSuccessMessage(
          `Repartidor ${createdDriver.first_name} ${createdDriver.last_name} registrado correctamente.`
        );
      }

      closeModal();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el repartidor."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    driver: DeliveryDriver,
    status: DriverStatus
  ) {
    if (driver.status === status) {
      return;
    }

    if (
      driver.status === "Ocupado" &&
      status !== "Ocupado"
    ) {
      const confirmed = window.confirm(
        "Este repartidor aparece como ocupado. ¿Deseas cambiar manualmente su estado?"
      );

      if (!confirmed) {
        return;
      }
    }

    const previousDriver = driver;

    try {
      setUpdatingDriverId(driver.id);
      setErrorMessage("");

      setDrivers((currentDrivers) =>
        currentDrivers.map((currentDriver) =>
          currentDriver.id === driver.id
            ? {
                ...currentDriver,
                status,
                active: status !== "Inactivo",
              }
            : currentDriver
        )
      );

      const updatedDriver =
        await updateDeliveryDriverStatus(
          driver.id,
          status
        );

      setDrivers((currentDrivers) =>
        currentDrivers.map((currentDriver) =>
          currentDriver.id === driver.id
            ? updatedDriver
            : currentDriver
        )
      );

      setSuccessMessage(
        `Estado de ${updatedDriver.first_name} actualizado a “${updatedDriver.status}”.`
      );
    } catch (error) {
      console.error(error);

      setDrivers((currentDrivers) =>
        currentDrivers.map((currentDriver) =>
          currentDriver.id === driver.id
            ? previousDriver
            : currentDriver
        )
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el estado."
      );
    } finally {
      setUpdatingDriverId(null);
    }
  }

  async function handleActiveChange(
    driver: DeliveryDriver
  ) {
    const nextActive = !driver.active;

    if (
      !nextActive &&
      !window.confirm(
        `¿Deseas desactivar a ${driver.first_name} ${driver.last_name}?`
      )
    ) {
      return;
    }

    const previousDriver = driver;

    try {
      setUpdatingDriverId(driver.id);
      setErrorMessage("");

      const updatedDriver =
        await setDeliveryDriverActive(
          driver.id,
          nextActive
        );

      setDrivers((currentDrivers) =>
        currentDrivers.map((currentDriver) =>
          currentDriver.id === driver.id
            ? updatedDriver
            : currentDriver
        )
      );

      setSuccessMessage(
        nextActive
          ? "Repartidor activado correctamente."
          : "Repartidor desactivado correctamente."
      );
    } catch (error) {
      console.error(error);

      setDrivers((currentDrivers) =>
        currentDrivers.map((currentDriver) =>
          currentDriver.id === driver.id
            ? previousDriver
            : currentDriver
        )
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cambiar la disponibilidad del repartidor."
      );
    } finally {
      setUpdatingDriverId(null);
    }
  }

  async function handleDelete(
    driver: DeliveryDriver
  ) {
    const confirmed = window.confirm(
      `¿Confirmas la eliminación de ${driver.first_name} ${driver.last_name}? Esta acción solo será posible si no tiene asignaciones históricas o activas.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingDriverId(driver.id);
      setErrorMessage("");

      await deleteDeliveryDriver(driver.id);

      setDrivers((currentDrivers) =>
        currentDrivers.filter(
          (currentDriver) =>
            currentDriver.id !== driver.id
        )
      );

      setSuccessMessage(
        "Repartidor eliminado correctamente."
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar el repartidor."
      );
    } finally {
      setDeletingDriverId(null);
    }
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#f3f5f3] px-4 py-6 text-zinc-950 sm:px-6 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <Header
            refreshing={refreshing}
            onRefresh={() =>
              void loadDrivers(false)
            }
            onCreate={openCreateModal}
          />

          {successMessage && (
            <Notification
              type="success"
              message={successMessage}
              onClose={() =>
                setSuccessMessage("")
              }
            />
          )}

          {errorMessage && (
            <Notification
              type="error"
              message={errorMessage}
              onClose={() =>
                setErrorMessage("")
              }
            />
          )}

          <SummaryCards summary={summary} />

          <section className="mt-6 rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
              />

              <select
                value={sortOption}
                onChange={(event) =>
                  setSortOption(
                    event.target.value as SortOption
                  )
                }
                className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-black text-zinc-700 outline-none transition focus:border-green-500"
              >
                <option value="name">
                  Nombre A-Z
                </option>

                <option value="newest">
                  Más recientes
                </option>

                <option value="oldest">
                  Más antiguos
                </option>

                <option value="status">
                  Estado operativo
                </option>
              </select>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {STATUS_FILTERS.map((status) => {
                const selected =
                  selectedStatus === status;

                const count =
                  status === "Todos"
                    ? drivers.length
                    : drivers.filter(
                        (driver) =>
                          driver.status === status
                      ).length;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setSelectedStatus(status)
                    }
                    className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition ${
                      selected
                        ? "bg-green-600 text-white shadow-lg shadow-green-900/15"
                        : "border border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                    }`}
                  >
                    {status}

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        selected
                          ? "bg-white/20 text-white"
                          : "bg-white text-zinc-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {loading ? (
            <LoadingPanel />
          ) : visibleDrivers.length === 0 ? (
            <EmptyPanel
              hasDrivers={drivers.length > 0}
              onClear={() => {
                setSearchTerm("");
                setSelectedStatus("Todos");
              }}
              onCreate={openCreateModal}
            />
          ) : (
            <section className="mt-6">
              <div className="mb-4 flex items-center justify-between gap-4 px-1">
                <p className="text-sm font-bold text-zinc-500">
                  Mostrando{" "}
                  <strong className="text-zinc-950">
                    {visibleDrivers.length}
                  </strong>{" "}
                  repartidor
                  {visibleDrivers.length === 1
                    ? ""
                    : "es"}
                </p>

                <p className="text-xs font-bold text-zinc-400">
                  Estados sincronizados con asignaciones
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                {visibleDrivers.map((driver) => (
                  <DriverCard
                    key={driver.id}
                    driver={driver}
                    updating={
                      updatingDriverId === driver.id
                    }
                    deleting={
                      deletingDriverId === driver.id
                    }
                    onEdit={() =>
                      openEditModal(driver)
                    }
                    onStatusChange={(status) =>
                      void handleStatusChange(
                        driver,
                        status
                      )
                    }
                    onActiveChange={() =>
                      void handleActiveChange(driver)
                    }
                    onDelete={() =>
                      void handleDelete(driver)
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {modalOpen && (
          <DriverModal
            form={form}
            editing={Boolean(editingDriver)}
            saving={saving}
            onChange={updateFormField}
            onClose={closeModal}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </AdminGuard>
  );
}

function Header({
  refreshing,
  onRefresh,
  onCreate,
}: {
  refreshing: boolean;
  onRefresh: () => void;
  onCreate: () => void;
}) {
  return (
    <header className="overflow-hidden rounded-[2rem] bg-zinc-950 text-white shadow-xl">
      <div className="relative px-6 py-8 sm:px-9 lg:px-12 lg:py-10">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-green-500/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-black text-green-300 transition hover:text-white"
            >
              <BackIcon />
              Volver al panel
            </Link>

            <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-green-300">
              MercaNova GO · Operación logística
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Centro Delivery
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
              Administra repartidores, disponibilidad,
              vehículos y capacidad operativa desde un
              único módulo.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 text-sm font-black text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshIcon spinning={refreshing} />

              {refreshing
                ? "Actualizando..."
                : "Actualizar"}
            </button>

            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-green-500 px-6 text-sm font-black text-zinc-950 transition hover:bg-green-400"
            >
              <PlusIcon />
              Nuevo repartidor
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function SummaryCards({
  summary,
}: {
  summary: {
    total: number;
    available: number;
    busy: number;
    outOfService: number;
    inactive: number;
  };
}) {
  const cards = [
    {
      label: "Total repartidores",
      value: summary.total,
      helper: "Registro completo",
      tone: "default",
      icon: <DriverIcon />,
    },
    {
      label: "Disponibles",
      value: summary.available,
      helper: "Listos para asignación",
      tone: "success",
      icon: <CheckIcon />,
    },
    {
      label: "Ocupados",
      value: summary.busy,
      helper: "Con entrega activa",
      tone: "blue",
      icon: <RouteIcon />,
    },
    {
      label: "Fuera de servicio",
      value: summary.outOfService,
      helper: "No asignables",
      tone: "warning",
      icon: <ToolIcon />,
    },
    {
      label: "Inactivos",
      value: summary.inactive,
      helper: "Registro deshabilitado",
      tone: "danger",
      icon: <PauseIcon />,
    },
  ];

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${getMetricTone(
                card.tone
              )}`}
            >
              {card.icon}
            </span>

            <span className="rounded-full bg-zinc-100 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-500">
              En vivo
            </span>
          </div>

          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
            {card.label}
          </p>

          <p
            className={`mt-2 text-3xl font-black ${getMetricValueTone(
              card.tone
            )}`}
          >
            {card.value}
          </p>

          <p className="mt-2 text-xs font-bold text-zinc-500">
            {card.helper}
          </p>
        </article>
      ))}
    </section>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">
        Buscar repartidor
      </span>

      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-400">
        <SearchIcon />
      </span>

      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Buscar por nombre, celular, identificación, placa, vehículo o estado..."
        className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-4 text-sm font-bold text-zinc-800 outline-none transition placeholder:font-medium placeholder:text-zinc-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
      />
    </label>
  );
}

function DriverCard({
  driver,
  updating,
  deleting,
  onEdit,
  onStatusChange,
  onActiveChange,
  onDelete,
}: {
  driver: DeliveryDriver;
  updating: boolean;
  deleting: boolean;
  onEdit: () => void;
  onStatusChange: (status: DriverStatus) => void;
  onActiveChange: () => void;
  onDelete: () => void;
}) {
  const fullName =
    `${driver.first_name} ${driver.last_name}`.trim();

  const whatsappUrl =
    buildWhatsAppUrl(driver.phone, fullName);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm transition hover:shadow-lg">
      <div className="p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white">
              <DriverIcon large />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <DriverStatusBadge
                  status={driver.status}
                />

                <span
                  className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                    driver.active
                      ? "bg-green-100 text-green-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {driver.active
                    ? "Activo"
                    : "Inactivo"}
                </span>
              </div>

              <h2 className="mt-3 truncate text-2xl font-black tracking-tight">
                {fullName}
              </h2>

              <p className="mt-1 text-sm font-bold text-zinc-500">
                Repartidor #{driver.id}
              </p>
            </div>
          </div>

          <label className="block min-w-[190px]">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Estado operativo
            </span>

            <select
              value={driver.status}
              disabled={updating}
              onChange={(event) =>
                onStatusChange(
                  event.target.value as DriverStatus
                )
              }
              className={`h-11 w-full rounded-xl border px-3 text-sm font-black outline-none transition disabled:cursor-wait disabled:opacity-60 ${getStatusSelectClass(
                driver.status
              )}`}
            >
              {DRIVER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <InfoBlock
            icon={<PhoneIcon />}
            label="Celular"
            value={driver.phone}
          />

          <InfoBlock
            icon={<MailIcon />}
            label="Correo"
            value={
              driver.email ??
              "No registrado"
            }
          />

          <InfoBlock
            icon={<IdentityIcon />}
            label="Identificación"
            value={
              driver.identification ??
              "No registrada"
            }
          />

          <InfoBlock
            icon={<VehicleIcon />}
            label="Vehículo"
            value={formatVehicle(driver)}
          />

          <InfoBlock
            icon={<PlateIcon />}
            label="Placa"
            value={
              driver.vehicle_plate ??
              "No registrada"
            }
          />

          <InfoBlock
            icon={<LocationIcon />}
            label="Última ubicación"
            value={
              driver.last_location_at
                ? formatDate(
                    driver.last_location_at
                  )
                : "Sin ubicación registrada"
            }
          />
        </div>

        {driver.notes && (
          <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Observaciones
            </p>

            <p className="mt-2 text-sm font-medium leading-6 text-zinc-700">
              {driver.notes}
            </p>
          </div>
        )}

        {(updating || deleting) && (
          <p className="mt-4 flex items-center gap-2 text-xs font-bold text-zinc-500">
            <RefreshIcon spinning />

            {deleting
              ? "Eliminando repartidor..."
              : "Guardando cambio..."}
          </p>
        )}
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-4 sm:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 text-sm font-black text-white transition hover:bg-green-700"
              >
                <WhatsAppIcon />
                Contactar
              </a>
            )}

            <button
              type="button"
              onClick={onEdit}
              disabled={updating || deleting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-black text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50"
            >
              <EditIcon />
              Editar
            </button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onActiveChange}
              disabled={updating || deleting}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black transition disabled:opacity-50 ${
                driver.active
                  ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "border border-green-200 bg-green-50 text-green-800 hover:bg-green-100"
              }`}
            >
              {driver.active ? (
                <PauseIcon />
              ) : (
                <CheckIcon />
              )}

              {driver.active
                ? "Desactivar"
                : "Activar"}
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={updating || deleting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50"
            >
              <TrashIcon />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function DriverModal({
  form,
  editing,
  saving,
  onChange,
  onClose,
  onSubmit,
}: {
  form: DriverFormState;
  editing: boolean;
  saving: boolean;
  onChange: <K extends keyof DriverFormState>(
    field: K,
    value: DriverFormState[K]
  ) => void;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="driver-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-zinc-950 px-6 py-6 text-white sm:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
              Centro Delivery
            </p>

            <h2
              id="driver-modal-title"
              className="mt-2 text-3xl font-black"
            >
              {editing
                ? "Editar repartidor"
                : "Registrar repartidor"}
            </h2>

            <p className="mt-2 text-sm text-zinc-300">
              Completa los datos personales y operativos.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar modal"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20 disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="max-h-[calc(92vh-150px)] overflow-y-auto"
        >
          <div className="space-y-8 p-6 sm:p-8">
            <FormSection
              title="Datos personales"
              description="Información básica del repartidor."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Nombres" required>
                  <input
                    value={form.first_name}
                    onChange={(event) =>
                      onChange(
                        "first_name",
                        event.target.value
                      )
                    }
                    required
                    autoComplete="given-name"
                    placeholder="Ingresa los nombres"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Apellidos" required>
                  <input
                    value={form.last_name}
                    onChange={(event) =>
                      onChange(
                        "last_name",
                        event.target.value
                      )
                    }
                    required
                    autoComplete="family-name"
                    placeholder="Ingresa los apellidos"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Identificación">
                  <input
                    value={form.identification}
                    onChange={(event) =>
                      onChange(
                        "identification",
                        event.target.value
                      )
                    }
                    placeholder="Cédula o documento"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Celular" required>
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      onChange(
                        "phone",
                        event.target.value
                      )
                    }
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Ejemplo: 0987654321"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Correo electrónico">
                  <input
                    value={form.email}
                    onChange={(event) =>
                      onChange(
                        "email",
                        event.target.value
                      )
                    }
                    type="email"
                    autoComplete="email"
                    placeholder="Opcional"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Estado operativo">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      onChange(
                        "status",
                        event.target.value as DriverStatus
                      )
                    }
                    disabled={!form.active}
                    className={`${inputClassName} disabled:cursor-not-allowed disabled:bg-zinc-100`}
                  >
                    {DRIVER_STATUSES.filter(
                      (status) =>
                        status !== "Inactivo"
                    ).map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </FormSection>

            <FormSection
              title="Vehículo"
              description="Datos necesarios para la operación y asignación."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Tipo de vehículo"
                  required
                >
                  <select
                    value={form.vehicle_type}
                    onChange={(event) =>
                      onChange(
                        "vehicle_type",
                        event.target
                          .value as DriverVehicleType
                      )
                    }
                    className={inputClassName}
                  >
                    {DRIVER_VEHICLE_TYPES.map(
                      (vehicleType) => (
                        <option
                          key={vehicleType}
                          value={vehicleType}
                        >
                          {vehicleType}
                        </option>
                      )
                    )}
                  </select>
                </FormField>

                <FormField label="Marca">
                  <input
                    value={form.vehicle_brand}
                    onChange={(event) =>
                      onChange(
                        "vehicle_brand",
                        event.target.value
                      )
                    }
                    placeholder="Ejemplo: Honda"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Modelo">
                  <input
                    value={form.vehicle_model}
                    onChange={(event) =>
                      onChange(
                        "vehicle_model",
                        event.target.value
                      )
                    }
                    placeholder="Ejemplo: CB 125"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Color">
                  <input
                    value={form.vehicle_color}
                    onChange={(event) =>
                      onChange(
                        "vehicle_color",
                        event.target.value
                      )
                    }
                    placeholder="Ejemplo: Negro"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Placa">
                  <input
                    value={form.vehicle_plate}
                    onChange={(event) =>
                      onChange(
                        "vehicle_plate",
                        event.target.value.toUpperCase()
                      )
                    }
                    placeholder="Ejemplo: ABC-1234"
                    className={inputClassName}
                  />
                </FormField>

                <div className="flex items-end">
                  <label className="flex w-full items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div>
                      <p className="font-black text-zinc-900">
                        Repartidor activo
                      </p>

                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        Puede aparecer en el Centro Delivery.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(event) =>
                        onChange(
                          "active",
                          event.target.checked
                        )
                      }
                      className="h-5 w-5 accent-green-600"
                    />
                  </label>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Observaciones"
              description="Información operativa adicional."
            >
              <textarea
                value={form.notes}
                onChange={(event) =>
                  onChange(
                    "notes",
                    event.target.value
                  )
                }
                rows={5}
                maxLength={500}
                placeholder="Licencias, horarios, restricciones, referencias u otras observaciones..."
                className={`${inputClassName} resize-none`}
              />

              <p className="mt-2 text-right text-xs font-bold text-zinc-400">
                {form.notes.length}/500
              </p>
            </FormSection>
          </div>

          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-zinc-200 bg-white px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-12 rounded-xl border border-zinc-200 bg-white px-6 text-sm font-black text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-7 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {saving && <RefreshIcon spinning />}

              {saving
                ? "Guardando..."
                : editing
                  ? "Actualizar repartidor"
                  : "Registrar repartidor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-5">
        <h3 className="text-xl font-black text-zinc-950">
          {title}
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-zinc-700">
        {label}
        {required && (
          <span className="ml-1 text-green-600">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-bold text-zinc-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function DriverStatusBadge({
  status,
}: {
  status: DriverStatus;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${getStatusBadgeClass(
        status
      )}`}
    >
      {status}
    </span>
  );
}

function Notification({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  const success = type === "success";

  return (
    <div
      className={`mt-5 flex items-start justify-between gap-4 rounded-2xl border p-4 ${
        success
          ? "border-green-200 bg-green-50 text-green-900"
          : "border-red-200 bg-red-50 text-red-900"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {success ? <CheckIcon /> : <WarningIcon />}
        </span>

        <div>
          <p className="font-black">
            {success
              ? "Operación completada"
              : "No fue posible completar la acción"}
          </p>

          <p className="mt-1 text-sm font-medium">
            {message}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar mensaje"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-black/5"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function LoadingPanel() {
  return (
    <section className="mt-6 rounded-[2rem] border border-zinc-200 bg-white p-12 text-center shadow-sm">
      <span className="mx-auto block h-14 w-14 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

      <h2 className="mt-6 text-2xl font-black">
        Consultando repartidores
      </h2>

      <p className="mt-2 text-sm text-zinc-500">
        Recuperando disponibilidad y datos operativos
        desde Supabase.
      </p>
    </section>
  );
}

function EmptyPanel({
  hasDrivers,
  onClear,
  onCreate,
}: {
  hasDrivers: boolean;
  onClear: () => void;
  onCreate: () => void;
}) {
  return (
    <section className="mt-6 rounded-[2rem] border border-zinc-200 bg-white p-12 text-center shadow-sm">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
        {hasDrivers ? (
          <SearchIcon large />
        ) : (
          <DriverIcon large />
        )}
      </span>

      <h2 className="mt-6 text-2xl font-black">
        {hasDrivers
          ? "No encontramos repartidores"
          : "Registra tu primer repartidor"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {hasDrivers
          ? "Revisa la búsqueda o selecciona otro estado operativo."
          : "El Centro Delivery está listo para comenzar a operar."}
      </p>

      <button
        type="button"
        onClick={
          hasDrivers ? onClear : onCreate
        }
        className="mt-6 rounded-xl bg-green-600 px-6 py-3 text-sm font-black text-white transition hover:bg-green-700"
      >
        {hasDrivers
          ? "Limpiar filtros"
          : "Nuevo repartidor"}
      </button>
    </section>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-zinc-300 bg-white p-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-green-600 focus:ring-4 focus:ring-green-100";

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatVehicle(
  driver: DeliveryDriver
): string {
  const details = [
    driver.vehicle_type,
    driver.vehicle_brand,
    driver.vehicle_model,
    driver.vehicle_color,
  ].filter(Boolean);

  return details.join(" · ");
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function normalizeEcuadorianPhone(
  phone: string
): string {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("593")) {
    return digits;
  }

  if (
    digits.startsWith("0") &&
    digits.length === 10
  ) {
    return `593${digits.slice(1)}`;
  }

  if (digits.length === 9) {
    return `593${digits}`;
  }

  return digits;
}

function buildWhatsAppUrl(
  phone: string,
  fullName: string
): string | null {
  const normalizedPhone =
    normalizeEcuadorianPhone(phone);

  if (!normalizedPhone) {
    return null;
  }

  const message = [
    `Hola ${fullName}.`,
    "Te contactamos desde el Centro Delivery de MercaNova GO.",
  ].join(" ");

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(
    message
  )}`;
}

function getMetricTone(tone: string): string {
  const tones: Record<string, string> = {
    default: "bg-zinc-100 text-zinc-700",
    success: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
  };

  return tones[tone] ?? tones.default;
}

function getMetricValueTone(tone: string): string {
  const tones: Record<string, string> = {
    default: "text-zinc-950",
    success: "text-green-600",
    blue: "text-blue-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };

  return tones[tone] ?? tones.default;
}

function getStatusBadgeClass(
  status: DriverStatus
): string {
  const classes: Record<DriverStatus, string> = {
    Disponible:
      "border-green-200 bg-green-50 text-green-700",
    Ocupado:
      "border-blue-200 bg-blue-50 text-blue-700",
    "Fuera de servicio":
      "border-amber-200 bg-amber-50 text-amber-700",
    Inactivo:
      "border-zinc-200 bg-zinc-100 text-zinc-600",
  };

  return classes[status];
}

function getStatusSelectClass(
  status: DriverStatus
): string {
  const classes: Record<DriverStatus, string> = {
    Disponible:
      "border-green-200 bg-green-50 text-green-800",
    Ocupado:
      "border-blue-200 bg-blue-50 text-blue-800",
    "Fuera de servicio":
      "border-amber-200 bg-amber-50 text-amber-800",
    Inactivo:
      "border-zinc-200 bg-zinc-100 text-zinc-700",
  };

  return classes[status];
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

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RefreshIcon({
  spinning = false,
}: {
  spinning?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`h-4 w-4 ${
        spinning ? "animate-spin" : ""
      }`}
    >
      <path
        d="M20 7v5h-5M4 17v-5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M18.5 10A7 7 0 0 0 6 7.5L4 12M5.5 14A7 7 0 0 0 18 16.5l2-4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({
  large = false,
}: {
  large?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={large ? "h-7 w-7" : "h-5 w-5"}
    >
      <circle
        cx="11"
        cy="11"
        r="6"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="m16 16 4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DriverIcon({
  large = false,
}: {
  large?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={large ? "h-8 w-8" : "h-6 w-6"}
    >
      <circle
        cx="12"
        cy="7"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M5 20c.5-4.2 3-6.5 7-6.5s6.5 2.3 7 6.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <circle
        cx="6"
        cy="18"
        r="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <circle
        cx="18"
        cy="6"
        r="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M8 18h2.5a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3H16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2 2-3-3 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M9 6v12M15 6v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="m5 12.5 4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M7.2 4.5 9.5 8l-1.7 1.8c1.3 2.7 3.5 4.9 6.2 6.2l1.8-1.7 3.7 2.3c.3.2.5.6.4 1C19.4 19.8 17.6 21 15.5 20.7 9.2 19.7 4.3 14.8 3.3 8.5 3 6.4 4.2 4.6 6.2 4.1c.4-.1.8.1 1 .4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="m5 7 7 5 7-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IdentityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <circle
        cx="8"
        cy="11"
        r="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M5.5 16c.4-1.5 1.3-2.3 2.5-2.3s2.1.8 2.5 2.3M13 10h5M13 14h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VehicleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M4 14h16l-1.5-5a2 2 0 0 0-2-1.5h-9A2 2 0 0 0 5.5 9L4 14Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M4 14v3h2M20 14v3h-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <circle cx="7" cy="15" r="1" fill="currentColor" />
      <circle cx="17" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

function PlateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <rect
        x="3"
        y="7"
        width="18"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M7 12h2M12 12h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <circle
        cx="12"
        cy="10"
        r="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4A8 8 0 1 1 20 11.7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M9 8.5c.4 3.4 2.3 5.3 5.7 5.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="m5 17-.5 3.5L8 20l10-10-3-3L5 17Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="m13.5 8.5 3 3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M12 4 21 20H3L12 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M12 9v5M12 17h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="m7 7 10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}