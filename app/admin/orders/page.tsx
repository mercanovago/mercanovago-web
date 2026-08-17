"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import AdminGuard from "@/components/admin/AdminGuard";

import {
  DELIVERY_STATUSES,
  DELIVERY_TYPES,
  getAdminOrders,
  ORDER_STATUSES,
  type AdminDeliveryStatus,
  type AdminDeliveryType,
  type AdminOrder,
  type OrderStatus,
} from "@/services/adminOrders";

import { updateDeliverySchedule } from "@/services/updateDeliverySchedule";
import { updateDeliveryStatus } from "@/services/updateDeliveryStatus";
import { updateOrderStatus } from "@/services/updateOrderStatus";

import {
  getAvailableDeliveryDrivers,
  type DeliveryDriver,
} from "@/services/deliveryDrivers";

import {
  cancelDeliveryAssignment,
  completeDeliveryAssignment,
  createDeliveryAssignment,
  getActiveDeliveryAssignments,
  markDeliveryPickedUp,
  markDeliveryPreparingPickup,
  startDeliveryRoute,
  updateDeliveryAssignmentStatus,
  type DeliveryAssignmentStatus,
  type DeliveryAssignmentWithRelations,
} from "@/services/deliveryAssignments";

type StatusFilter = "Todos" | OrderStatus;
type DeliveryTypeFilter = "Todos" | AdminDeliveryType;

const STATUS_FILTERS: StatusFilter[] = [
  "Todos",
  ...ORDER_STATUSES,
];

const DELIVERY_TYPE_FILTERS: DeliveryTypeFilter[] = [
  "Todos",
  ...DELIVERY_TYPES,
];

const DELIVERY_OPENING_HOUR = 7;
const DELIVERY_CLOSING_HOUR = 20;
const DELIVERY_INTERVAL_MINUTES = 15;

type SortOption =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest"
  | "deliveryDate";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilter>("Todos");

  const [selectedDeliveryType, setSelectedDeliveryType] =
    useState<DeliveryTypeFilter>("Todos");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] =
    useState<SortOption>("newest");

  const [updatingOrderId, setUpdatingOrderId] =
    useState<number | null>(null);

  const [
    updatingDeliveryOrderId,
    setUpdatingDeliveryOrderId,
  ] = useState<number | null>(null);

  const [expandedOrderId, setExpandedOrderId] =
    useState<number | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [coordinatingOrder, setCoordinatingOrder] =
    useState<AdminOrder | null>(null);

  const [assignments, setAssignments] =
    useState<DeliveryAssignmentWithRelations[]>([]);

  const [availableDrivers, setAvailableDrivers] =
    useState<DeliveryDriver[]>([]);

  const [assigningOrder, setAssigningOrder] =
    useState<AdminOrder | null>(null);

  const [updatingAssignmentId, setUpdatingAssignmentId] =
    useState<number | null>(null);

  const loadOrders = useCallback(
    async (showFullLoader = false) => {
      try {
        if (showFullLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setErrorMessage("");

        const [
          orderData,
          assignmentData,
          driverData,
        ] = await Promise.all([
          getAdminOrders(),
          getActiveDeliveryAssignments(),
          getAvailableDeliveryDrivers(),
        ]);

        setOrders(orderData);
        setAssignments(assignmentData);
        setAvailableDrivers(driverData);
      } catch (error) {
        console.error(error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar los pedidos."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadOrders(true);
  }, [loadOrders]);

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
    const nonCancelledOrders = orders.filter(
      (order) => order.status !== "Cancelado"
    );

    return {
      total: orders.length,

      pending: orders.filter(
        (order) => order.status === "Pendiente"
      ).length,

      active: orders.filter((order) =>
        [
          "Confirmado",
          "Preparando",
          "En camino",
        ].includes(order.status)
      ).length,

      delivered: orders.filter(
        (order) => order.status === "Entregado"
      ).length,

      coordinated: orders.filter(
        (order) =>
          order.delivery_type === "coordinated" &&
          order.delivery_status === "Por coordinar"
      ).length,

      scheduled: orders.filter(
        (order) =>
          order.delivery_type === "scheduled"
      ).length,

      cancelled: orders.filter(
        (order) => order.status === "Cancelado"
      ).length,

      sales: nonCancelledOrders.reduce(
        (total, order) => total + order.total,
        0
      ),
    };
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const cleanSearch = normalizeText(searchTerm);

    const result = orders.filter((order) => {
      const matchesStatus =
        selectedStatus === "Todos" ||
        order.status === selectedStatus;

      const matchesDeliveryType =
        selectedDeliveryType === "Todos" ||
        order.delivery_type === selectedDeliveryType;

      if (!matchesStatus || !matchesDeliveryType) {
        return false;
      }

      if (!cleanSearch) {
        return true;
      }

      const customerName = normalizeText(
        `${order.customers?.first_name ?? ""} ${
          order.customers?.last_name ?? ""
        }`
      );

      const phone = normalizeText(
        order.customers?.phone ?? ""
      );

      const email = normalizeText(
        order.customers?.email ?? ""
      );

      const address = normalizeText(
        order.customers?.address ?? ""
      );

      const products = normalizeText(
        order.order_items
          .map((item) => item.products?.name ?? "")
          .join(" ")
      );

      const deliveryData = normalizeText(
        [
          getDeliveryTypeLabel(order.delivery_type),
          order.delivery_status,
          order.delivery_date ?? "",
          order.delivery_time ?? "",
          order.delivery_window ?? "",
          order.delivery_notes ?? "",
        ].join(" ")
      );

      return (
        String(order.id).includes(cleanSearch) ||
        customerName.includes(cleanSearch) ||
        phone.includes(cleanSearch) ||
        email.includes(cleanSearch) ||
        address.includes(cleanSearch) ||
        products.includes(cleanSearch) ||
        deliveryData.includes(cleanSearch)
      );
    });

    return [...result].sort((first, second) => {
      if (sortOption === "oldest") {
        return (
          new Date(first.created_at).getTime() -
          new Date(second.created_at).getTime()
        );
      }

      if (sortOption === "highest") {
        return second.total - first.total;
      }

      if (sortOption === "lowest") {
        return first.total - second.total;
      }

      if (sortOption === "deliveryDate") {
        return (
          getDeliverySortTimestamp(first) -
          getDeliverySortTimestamp(second)
        );
      }

      return (
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime()
      );
    });
  }, [
    orders,
    searchTerm,
    selectedStatus,
    selectedDeliveryType,
    sortOption,
  ]);

  async function handleStatusChange(
    order: AdminOrder,
    newStatus: OrderStatus
  ) {
    if (newStatus === order.status) {
      return;
    }

    if (
      newStatus === "Cancelado" &&
      !window.confirm(
        `¿Confirmas la cancelación del pedido #${order.id}?`
      )
    ) {
      return;
    }

    if (
      newStatus === "Entregado" &&
      !window.confirm(
        `¿Confirmas que el pedido #${order.id} fue entregado correctamente?`
      )
    ) {
      return;
    }

    const previousStatus = order.status;

    try {
      setUpdatingOrderId(order.id);
      setErrorMessage("");

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                status: newStatus,
              }
            : currentOrder
        )
      );

      const updatedOrder = await updateOrderStatus(
        order.id,
        newStatus
      );

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                status: updatedOrder.status,
              }
            : currentOrder
        )
      );

      setSuccessMessage(
        `Pedido #${order.id} actualizado a “${newStatus}”.`
      );
    } catch (error) {
      console.error(error);

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                status: previousStatus,
              }
            : currentOrder
        )
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el pedido."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleDeliveryStatusChange(
    order: AdminOrder,
    newStatus: AdminDeliveryStatus
  ) {
    if (newStatus === order.delivery_status) {
      return;
    }

    if (
      newStatus === "Cancelada" &&
      !window.confirm(
        `¿Confirmas la cancelación logística del pedido #${order.id}?`
      )
    ) {
      return;
    }

    if (
      newStatus === "Entregada" &&
      !window.confirm(
        `¿Confirmas que la entrega del pedido #${order.id} fue completada?`
      )
    ) {
      return;
    }

    const previousStatus = order.delivery_status;

    try {
      setUpdatingDeliveryOrderId(order.id);
      setErrorMessage("");

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                delivery_status: newStatus,
              }
            : currentOrder
        )
      );

      const updatedOrder = await updateDeliveryStatus(
        order.id,
        newStatus
      );

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                delivery_status:
                  updatedOrder.delivery_status,
              }
            : currentOrder
        )
      );

      setSuccessMessage(
        `Estado logístico del pedido #${order.id} actualizado a “${newStatus}”.`
      );
    } catch (error) {
      console.error(error);

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                delivery_status: previousStatus,
              }
            : currentOrder
        )
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el estado logístico."
      );
    } finally {
      setUpdatingDeliveryOrderId(null);
    }
  }

  function getAssignmentForOrder(
    orderId: number
  ): DeliveryAssignmentWithRelations | null {
    return (
      assignments.find(
        (assignment) =>
          assignment.order_id === orderId
      ) ?? null
    );
  }

  async function refreshDeliveryOperation() {
    const [assignmentData, driverData] =
      await Promise.all([
        getActiveDeliveryAssignments(),
        getAvailableDeliveryDrivers(),
      ]);

    setAssignments(assignmentData);
    setAvailableDrivers(driverData);
  }

  async function handleAssignmentStatusChange(
    assignment: DeliveryAssignmentWithRelations,
    status: DeliveryAssignmentStatus
  ) {
    if (assignment.status === status) {
      return;
    }

    if (
      status === "Entregado" &&
      !window.confirm(
        `¿Confirmas que la entrega del pedido #${assignment.order_id} fue completada?`
      )
    ) {
      return;
    }

    try {
      setUpdatingAssignmentId(assignment.id);
      setErrorMessage("");

      let updatedAssignment:
        DeliveryAssignmentWithRelations;

      if (status === "Preparando retiro") {
        updatedAssignment =
          await markDeliveryPreparingPickup(
            assignment.id
          );
      } else if (status === "Pedido retirado") {
        updatedAssignment =
          await markDeliveryPickedUp(
            assignment.id
          );
      } else if (status === "En ruta") {
        updatedAssignment =
          await startDeliveryRoute(
            assignment.id
          );
      } else if (status === "Entregado") {
        updatedAssignment =
          await completeDeliveryAssignment(
            assignment.id
          );

        await Promise.all([
          updateDeliveryStatus(
            assignment.order_id,
            "Entregada"
          ),
          updateOrderStatus(
            assignment.order_id,
            "Entregado"
          ),
        ]);

        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === assignment.order_id
              ? {
                  ...order,
                  status: "Entregado",
                  delivery_status: "Entregada",
                }
              : order
          )
        );
      } else {
        updatedAssignment =
          await updateDeliveryAssignmentStatus(
            assignment.id,
            status
          );
      }

      setAssignments((currentAssignments) =>
        updatedAssignment.status === "Entregado" ||
        updatedAssignment.status === "Cancelado"
          ? currentAssignments.filter(
              (currentAssignment) =>
                currentAssignment.id !==
                updatedAssignment.id
            )
          : currentAssignments.map(
              (currentAssignment) =>
                currentAssignment.id ===
                updatedAssignment.id
                  ? updatedAssignment
                  : currentAssignment
            )
      );

      if (status === "En ruta") {
        await Promise.all([
          updateDeliveryStatus(
            assignment.order_id,
            "En camino"
          ),
          updateOrderStatus(
            assignment.order_id,
            "En camino"
          ),
        ]);

        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === assignment.order_id
              ? {
                  ...order,
                  status: "En camino",
                  delivery_status: "En camino",
                }
              : order
          )
        );
      }

      await refreshDeliveryOperation();

      setSuccessMessage(
        `Asignación del pedido #${assignment.order_id} actualizada a “${status}”.`
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar la asignación."
      );
    } finally {
      setUpdatingAssignmentId(null);
    }
  }

  async function handleCancelAssignment(
    assignment: DeliveryAssignmentWithRelations
  ) {
    const reason = window.prompt(
      `Motivo de cancelación de la asignación del pedido #${assignment.order_id}:`
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      setErrorMessage(
        "Debes registrar el motivo de cancelación."
      );
      return;
    }

    try {
      setUpdatingAssignmentId(assignment.id);
      setErrorMessage("");

      await cancelDeliveryAssignment(
        assignment.id,
        reason
      );

      setAssignments((currentAssignments) =>
        currentAssignments.filter(
          (currentAssignment) =>
            currentAssignment.id !== assignment.id
        )
      );

      await refreshDeliveryOperation();

      setSuccessMessage(
        `Asignación del pedido #${assignment.order_id} cancelada.`
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cancelar la asignación."
      );
    } finally {
      setUpdatingAssignmentId(null);
    }
  }

  function toggleExpandedOrder(orderId: number) {
    setExpandedOrderId((currentOrderId) =>
      currentOrderId === orderId ? null : orderId
    );
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#f3f5f3] px-4 py-6 text-zinc-950 sm:px-6 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <Header
            refreshing={refreshing}
            onRefresh={() => void loadOrders(false)}
          />

          {successMessage && (
            <Notification
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage("")}
            />
          )}

          {errorMessage && (
            <Notification
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage("")}
            />
          )}

          <SummaryCards summary={summary} />

          <section className="mt-6 rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_210px_210px]">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
              />

              <select
                value={selectedDeliveryType}
                onChange={(event) =>
                  setSelectedDeliveryType(
                    event.target
                      .value as DeliveryTypeFilter
                  )
                }
                className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-black text-zinc-700 outline-none transition focus:border-green-500"
              >
                <option value="Todos">
                  Todas las entregas
                </option>

                {DELIVERY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getDeliveryTypeLabel(type)}
                  </option>
                ))}
              </select>

              <select
                value={sortOption}
                onChange={(event) =>
                  setSortOption(
                    event.target.value as SortOption
                  )
                }
                className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-black text-zinc-700 outline-none transition focus:border-green-500"
              >
                <option value="newest">
                  Más recientes
                </option>

                <option value="oldest">
                  Más antiguos
                </option>

                <option value="highest">
                  Mayor valor
                </option>

                <option value="lowest">
                  Menor valor
                </option>

                <option value="deliveryDate">
                  Próxima entrega
                </option>
              </select>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {STATUS_FILTERS.map((status) => {
                const selected =
                  selectedStatus === status;

                const count =
                  status === "Todos"
                    ? orders.length
                    : orders.filter(
                        (order) =>
                          order.status === status
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
          ) : visibleOrders.length === 0 ? (
            <EmptyPanel
              onClear={() => {
                setSearchTerm("");
                setSelectedStatus("Todos");
                setSelectedDeliveryType("Todos");
              }}
            />
          ) : (
            <section className="mt-6 space-y-5">
              <div className="flex items-center justify-between gap-4 px-1">
                <p className="text-sm font-bold text-zinc-500">
                  Mostrando{" "}
                  <strong className="text-zinc-950">
                    {visibleOrders.length}
                  </strong>{" "}
                  pedido
                  {visibleOrders.length === 1 ? "" : "s"}
                </p>

                <p className="text-xs font-bold text-zinc-400">
                  Ventas excluyen pedidos cancelados
                </p>
              </div>

              {visibleOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  expanded={expandedOrderId === order.id}
                  updating={updatingOrderId === order.id}
                  updatingDelivery={
                    updatingDeliveryOrderId === order.id
                  }
                  onToggle={() =>
                    toggleExpandedOrder(order.id)
                  }
                  onStatusChange={(status) =>
                    void handleStatusChange(
                      order,
                      status
                    )
                  }
                  onDeliveryStatusChange={(status) =>
                    void handleDeliveryStatusChange(
                      order,
                      status
                    )
                  }
                  assignment={getAssignmentForOrder(
                    order.id
                  )}
                  updatingAssignment={
                    getAssignmentForOrder(order.id)
                      ?.id === updatingAssignmentId
                  }
                  onAssign={() =>
                    setAssigningOrder(order)
                  }
                  onAssignmentStatusChange={(
                    assignment,
                    status
                  ) =>
                    void handleAssignmentStatusChange(
                      assignment,
                      status
                    )
                  }
                  onCancelAssignment={(assignment) =>
                    void handleCancelAssignment(
                      assignment
                    )
                  }
                  onCoordinate={() =>
                    setCoordinatingOrder(order)
                  }
                />
              ))}
            </section>
          )}
        </div>
      </main>

      {assigningOrder && (
        <AssignDriverModal
          order={assigningOrder}
          drivers={availableDrivers}
          onClose={() => setAssigningOrder(null)}
          onAssigned={async (assignment) => {
            setAssignments((currentAssignments) => [
              assignment,
              ...currentAssignments.filter(
                (currentAssignment) =>
                  currentAssignment.order_id !==
                  assignment.order_id
              ),
            ]);

            await refreshDeliveryOperation();

            setSuccessMessage(
              `Pedido #${assignment.order_id} asignado correctamente.`
            );
            setAssigningOrder(null);
          }}
          onError={setErrorMessage}
        />
      )}

      {coordinatingOrder && (
        <CoordinateDeliveryModal
          order={coordinatingOrder}
          onClose={() => setCoordinatingOrder(null)}
          onSaved={(updatedOrder) => {
            setOrders((currentOrders) =>
              currentOrders.map((currentOrder) =>
                currentOrder.id === updatedOrder.id
                  ? {
                      ...currentOrder,
                      delivery_date:
                        updatedOrder.delivery_date,
                      delivery_time:
                        updatedOrder.delivery_time,
                      delivery_window:
                        updatedOrder.delivery_window,
                      estimated_delivery:
                        updatedOrder.estimated_delivery,
                      delivery_notes:
                        updatedOrder.delivery_notes,
                      delivery_status:
                        updatedOrder.delivery_status,
                    }
                  : currentOrder
              )
            );

            setSuccessMessage(
              `Entrega del pedido #${updatedOrder.id} confirmada correctamente.`
            );
            setCoordinatingOrder(null);
          }}
          onError={setErrorMessage}
        />
      )}
    </AdminGuard>
  );
}

interface HeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
}

function Header({
  refreshing,
  onRefresh,
}: HeaderProps) {
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
              MercaNova GO · Centro operativo
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Pedidos y entregas
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
              Administra pedidos, clientes, productos,
              modalidades de entrega, logística y
              comunicación comercial desde un único módulo.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-green-500 px-6 text-sm font-black text-zinc-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshIcon spinning={refreshing} />

            {refreshing
              ? "Actualizando..."
              : "Actualizar pedidos"}
          </button>
        </div>
      </div>
    </header>
  );
}

interface SummaryCardsProps {
  summary: {
    total: number;
    pending: number;
    active: number;
    delivered: number;
    coordinated: number;
    scheduled: number;
    cancelled: number;
    sales: number;
  };
}

function SummaryCards({
  summary,
}: SummaryCardsProps) {
  const cards = [
    {
      label: "Total pedidos",
      value: String(summary.total),
      helper: "Histórico registrado",
      tone: "default",
      icon: <OrderIcon />,
    },
    {
      label: "Pendientes",
      value: String(summary.pending),
      helper: "Requieren atención",
      tone: "warning",
      icon: <ClockIcon />,
    },
    {
      label: "Por coordinar",
      value: String(summary.coordinated),
      helper: "Contacto requerido",
      tone: "warning",
      icon: <PhoneIcon />,
    },
    {
      label: "Programados",
      value: String(summary.scheduled),
      helper: "Entregas agendadas",
      tone: "blue",
      icon: <CalendarIcon />,
    },
    {
      label: "En operación",
      value: String(summary.active),
      helper: "Proceso o reparto",
      tone: "blue",
      icon: <RouteIcon />,
    },
    {
      label: "Entregados",
      value: String(summary.delivered),
      helper: "Pedidos finalizados",
      tone: "success",
      icon: <CheckIcon />,
    },
    {
      label: "Ventas válidas",
      value: formatMoney(summary.sales),
      helper: `${summary.cancelled} cancelados excluidos`,
      tone: "success",
      icon: <MoneyIcon />,
    },
  ];

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
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
            className={`mt-2 break-words text-3xl font-black ${getMetricValueTone(
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

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchInput({
  value,
  onChange,
}: SearchInputProps) {
  return (
    <label className="relative block">
      <span className="sr-only">
        Buscar pedido
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
        placeholder="Buscar por pedido, cliente, celular, modalidad, horario, dirección o producto..."
        className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-4 text-sm font-bold text-zinc-800 outline-none transition placeholder:font-medium placeholder:text-zinc-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
      />
    </label>
  );
}

interface OrderCardProps {
  order: AdminOrder;
  expanded: boolean;
  updating: boolean;
  updatingDelivery: boolean;
  onToggle: () => void;
  onStatusChange: (status: OrderStatus) => void;
  onDeliveryStatusChange: (
    status: AdminDeliveryStatus
  ) => void;
  assignment: DeliveryAssignmentWithRelations | null;
  updatingAssignment: boolean;
  onAssign: () => void;
  onAssignmentStatusChange: (
    assignment: DeliveryAssignmentWithRelations,
    status: DeliveryAssignmentStatus
  ) => void;
  onCancelAssignment: (
    assignment: DeliveryAssignmentWithRelations
  ) => void;
  onCoordinate: () => void;
}

function OrderCard({
  order,
  expanded,
  updating,
  updatingDelivery,
  onToggle,
  onStatusChange,
  onDeliveryStatusChange,
  assignment,
  updatingAssignment,
  onAssign,
  onAssignmentStatusChange,
  onCancelAssignment,
  onCoordinate,
}: OrderCardProps) {
  const customerName =
    `${order.customers?.first_name ?? ""} ${
      order.customers?.last_name ?? ""
    }`.trim() || "Cliente sin nombre";

  const phone = order.customers?.phone?.trim() ?? "";
  const email = order.customers?.email?.trim() ?? "";
  const address =
    order.customers?.address?.trim() ??
    "Dirección no registrada";

  const whatsappUrl = buildWhatsAppUrl(
    phone,
    order,
    customerName
  );

  const deliveryAlert =
    order.delivery_type === "coordinated" &&
    order.delivery_status === "Por coordinar";

  return (
    <article
      className={`overflow-hidden rounded-[2rem] border bg-white shadow-sm transition hover:shadow-lg ${
        deliveryAlert
          ? "border-amber-300 ring-4 ring-amber-100"
          : "border-zinc-200"
      }`}
    >
      {deliveryAlert && (
        <div className="flex items-center gap-3 border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm font-black text-amber-900 sm:px-7">
          <WarningIcon />
          Entrega coordinada pendiente de contacto con el cliente.
        </div>
      )}

      <div className="grid gap-6 p-5 sm:p-7 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-zinc-950 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white">
              Pedido #{order.id}
            </span>

            <StatusBadge status={order.status} />

            <DeliveryTypeBadge
              type={order.delivery_type}
            />

            <span className="text-xs font-bold text-zinc-400">
              {formatDate(order.created_at)}
            </span>
          </div>

          <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
            {customerName}
          </h2>

          <div className="mt-4 grid gap-3 text-sm text-zinc-600 md:grid-cols-2">
            <ContactRow
              icon={<PhoneIcon />}
              value={phone || "Celular no registrado"}
            />

            <ContactRow
              icon={<MailIcon />}
              value={email || "Correo no registrado"}
            />

            <div className="md:col-span-2">
              <ContactRow
                icon={<LocationIcon />}
                value={address}
              />
            </div>
          </div>

          <DeliveryOverview order={order} />

          <DeliveryAssignmentPanel
            order={order}
            assignment={assignment}
            updating={updatingAssignment}
            onAssign={onAssign}
            onStatusChange={
              onAssignmentStatusChange
            }
            onCancel={onCancelAssignment}
          />
        </div>

        <div className="flex min-w-0 flex-col justify-between rounded-2xl bg-zinc-50 p-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Total del pedido
            </p>

            <p className="mt-1 text-3xl font-black text-green-600">
              {formatMoney(order.total)}
            </p>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Estado comercial
            </span>

            <select
              value={order.status}
              disabled={updating}
              onChange={(event) =>
                onStatusChange(
                  event.target.value as OrderStatus
                )
              }
              className={`h-11 w-full rounded-xl border px-3 text-sm font-black outline-none transition disabled:cursor-wait disabled:opacity-60 ${getStatusSelectClass(
                order.status
              )}`}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Estado logístico
            </span>

            <select
              value={order.delivery_status}
              disabled={updatingDelivery}
              onChange={(event) =>
                onDeliveryStatusChange(
                  event.target
                    .value as AdminDeliveryStatus
                )
              }
              className={`h-11 w-full rounded-xl border px-3 text-sm font-black outline-none transition disabled:cursor-wait disabled:opacity-60 ${getDeliveryStatusSelectClass(
                order.delivery_status
              )}`}
            >
              {DELIVERY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          {(updating || updatingDelivery) && (
            <p className="mt-3 flex items-center gap-2 text-xs font-bold text-zinc-500">
              <RefreshIcon spinning />
              Guardando cambio...
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-100 px-5 py-4 sm:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-zinc-100 px-3 py-2 text-xs font-black text-zinc-600">
              {order.order_items.length} producto
              {order.order_items.length === 1 ? "" : "s"}
            </span>

            <span className="rounded-full bg-zinc-100 px-3 py-2 text-xs font-black text-zinc-600">
              {order.payment_method ??
                "Pago no especificado"}
            </span>

            <DeliveryStatusBadge
              status={order.delivery_status}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {order.delivery_type === "coordinated" && (
              <button
                type="button"
                onClick={onCoordinate}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-black text-white transition hover:bg-zinc-800"
              >
                <CalendarIcon />
                {order.delivery_status === "Por coordinar"
                  ? "Coordinar entrega"
                  : "Reprogramar entrega"}
              </button>
            )}

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 text-sm font-black text-white transition hover:bg-green-700"
              >
                <WhatsAppIcon />
                Contactar cliente
              </a>
            )}

            <button
              type="button"
              onClick={onToggle}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-black text-zinc-700 transition hover:bg-zinc-50"
            >
              {expanded
                ? "Ocultar detalle"
                : "Ver detalle"}

              <ChevronIcon expanded={expanded} />
            </button>
          </div>
        </div>
      </div>

      {expanded && <OrderDetail order={order} />}
    </article>
  );
}

function DeliveryOverview({
  order,
}: {
  order: AdminOrder;
}) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
          Modalidad de entrega
        </p>

        <div className="mt-3 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <DeliveryIcon type={order.delivery_type} />
          </span>

          <div>
            <p className="font-black text-zinc-950">
              {getDeliveryTypeLabel(order.delivery_type)}
            </p>

            <p className="mt-1 text-xs font-bold leading-5 text-zinc-500">
              {getDeliverySummary(order)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
          Estado de entrega
        </p>

        <div className="mt-3">
          <DeliveryStatusBadge
            status={order.delivery_status}
          />
        </div>

        {order.delivery_notes && (
          <p className="mt-3 text-xs font-medium leading-5 text-zinc-600">
            {order.delivery_notes}
          </p>
        )}
      </div>
    </div>
  );
}


function DeliveryAssignmentPanel({
  order,
  assignment,
  updating,
  onAssign,
  onStatusChange,
  onCancel,
}: {
  order: AdminOrder;
  assignment: DeliveryAssignmentWithRelations | null;
  updating: boolean;
  onAssign: () => void;
  onStatusChange: (
    assignment: DeliveryAssignmentWithRelations,
    status: DeliveryAssignmentStatus
  ) => void;
  onCancel: (
    assignment: DeliveryAssignmentWithRelations
  ) => void;
}) {
  const orderClosed =
    order.status === "Entregado" ||
    order.status === "Cancelado" ||
    order.delivery_status === "Entregada" ||
    order.delivery_status === "Cancelada";

  if (!assignment) {
    return (
      <section className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
              <DriverIcon />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Operación Delivery
              </p>

              <p className="mt-1 font-black text-zinc-950">
                Sin repartidor asignado
              </p>

              <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
                Selecciona un repartidor disponible para iniciar el despacho.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAssign}
            disabled={orderClosed}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            <PlusIcon />
            Asignar repartidor
          </button>
        </div>
      </section>
    );
  }

  const driver = assignment.delivery_drivers;

  const driverName = driver
    ? `${driver.first_name} ${driver.last_name}`.trim()
    : "Repartidor asignado";

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-green-200 bg-green-50/60">
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_220px] lg:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white">
            <DriverIcon />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-black text-green-950">
                {driverName}
              </p>

              <AssignmentStatusBadge
                status={assignment.status}
              />
            </div>

            <p className="mt-1 text-xs font-bold text-green-800">
              {driver?.vehicle_type ?? "Vehículo"}
              {driver?.vehicle_plate
                ? ` · ${driver.vehicle_plate}`
                : ""}
            </p>

            <p className="mt-1 text-xs font-medium text-green-700">
              Asignado: {formatDate(
                assignment.assigned_at
              )}
            </p>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-green-800">
            Estado de asignación
          </span>

          <select
            value={assignment.status}
            disabled={updating}
            onChange={(event) =>
              onStatusChange(
                assignment,
                event.target
                  .value as DeliveryAssignmentStatus
              )
            }
            className="h-11 w-full rounded-xl border border-green-200 bg-white px-3 text-sm font-black text-green-900 outline-none transition focus:border-green-500 disabled:cursor-wait disabled:opacity-60"
          >
            {[
              "Asignado",
              "Aceptado",
              "Preparando retiro",
              "Pedido retirado",
              "En ruta",
              "Entregado",
            ].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-2 border-t border-green-200 bg-white/70 p-3 sm:flex-row sm:justify-end">
        {driver?.phone && (
          <a
            href={buildDriverWhatsAppUrl(
              driver.phone,
              driverName,
              order.id
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 text-xs font-black text-green-700 transition hover:bg-green-50"
          >
            <WhatsAppIcon />
            Contactar repartidor
          </a>
        )}

        <button
          type="button"
          onClick={() => onCancel(assignment)}
          disabled={updating}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
        >
          <CloseIcon />
          Cancelar asignación
        </button>
      </div>
    </section>
  );
}

function AssignmentStatusBadge({
  status,
}: {
  status: DeliveryAssignmentStatus;
}) {
  const classes: Record<
    DeliveryAssignmentStatus,
    string
  > = {
    Asignado:
      "border-blue-200 bg-blue-50 text-blue-700",
    Aceptado:
      "border-sky-200 bg-sky-50 text-sky-700",
    "Preparando retiro":
      "border-amber-200 bg-amber-50 text-amber-700",
    "Pedido retirado":
      "border-cyan-200 bg-cyan-50 text-cyan-700",
    "En ruta":
      "border-indigo-200 bg-indigo-50 text-indigo-700",
    Entregado:
      "border-green-200 bg-green-50 text-green-700",
    Cancelado:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function AssignDriverModal({
  order,
  drivers,
  onClose,
  onAssigned,
  onError,
}: {
  order: AdminOrder;
  drivers: DeliveryDriver[];
  onClose: () => void;
  onAssigned: (
    assignment: DeliveryAssignmentWithRelations
  ) => void | Promise<void>;
  onError: (message: string) => void;
}) {
  const [selectedDriverId, setSelectedDriverId] =
    useState<number | null>(
      drivers[0]?.id ?? null
    );

  const [assignmentNotes, setAssignmentNotes] =
    useState("");

  const [saving, setSaving] = useState(false);

  const customerName =
    `${order.customers?.first_name ?? ""} ${
      order.customers?.last_name ?? ""
    }`.trim() || "Cliente";

  const destinationAddress =
    order.customers?.address?.trim() ?? null;

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose, saving]);

  async function handleAssign() {
    if (!selectedDriverId) {
      onError(
        "Selecciona un repartidor disponible."
      );
      return;
    }

    try {
      setSaving(true);
      onError("");

      const assignment =
        await createDeliveryAssignment({
          order_id: order.id,
          driver_id: selectedDriverId,
          destination_address:
            destinationAddress,
          estimated_arrival_at:
            order.estimated_delivery,
          assignment_notes:
            assignmentNotes.trim() || null,
          delivery_notes:
            order.delivery_notes,
        });

      await onAssigned(assignment);
    } catch (error) {
      console.error(error);

      onError(
        error instanceof Error
          ? error.message
          : "No fue posible asignar el repartidor."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-zinc-950/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-driver-title"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
        <header className="relative overflow-hidden bg-zinc-950 px-6 py-7 text-white sm:px-8">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-green-500/20 blur-3xl"
          />

          <div className="relative flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
                Centro Delivery
              </p>

              <h2
                id="assign-driver-title"
                className="mt-2 text-3xl font-black tracking-tight"
              >
                Asignar repartidor
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Pedido #{order.id} · {customerName}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Cerrar asignación"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20 disabled:opacity-50"
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className="p-6 sm:p-8">
          {drivers.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
              <p className="font-black text-amber-900">
                No existen repartidores disponibles
              </p>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                Activa un repartidor o finaliza una entrega en curso desde el Centro Delivery.
              </p>

              <Link
                href="/admin/delivery"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-black text-white"
              >
                Abrir Centro Delivery
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {drivers.map((driver) => {
                  const selected =
                    selectedDriverId === driver.id;

                  const fullName =
                    `${driver.first_name} ${driver.last_name}`.trim();

                  return (
                    <button
                      key={driver.id}
                      type="button"
                      onClick={() =>
                        setSelectedDriverId(
                          driver.id
                        )
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-green-500 bg-green-50 ring-4 ring-green-100"
                          : "border-zinc-200 bg-white hover:border-green-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            selected
                              ? "bg-green-600 text-white"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          <DriverIcon />
                        </span>

                        <div className="min-w-0">
                          <p className="truncate font-black text-zinc-950">
                            {fullName}
                          </p>

                          <p className="mt-1 text-xs font-bold text-zinc-500">
                            {driver.vehicle_type}
                            {driver.vehicle_plate
                              ? ` · ${driver.vehicle_plate}`
                              : ""}
                          </p>

                          <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-green-700">
                            Disponible
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <label className="mt-6 block">
                <span className="mb-2 block text-sm font-black text-zinc-700">
                  Observaciones de asignación
                </span>

                <textarea
                  value={assignmentNotes}
                  onChange={(event) =>
                    setAssignmentNotes(
                      event.target.value
                    )
                  }
                  rows={3}
                  maxLength={500}
                  placeholder="Indicaciones internas para el repartidor."
                  className="w-full resize-none rounded-2xl border border-zinc-300 bg-white p-4 text-sm font-medium text-zinc-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />
              </label>
            </>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-12 rounded-xl border border-zinc-200 bg-white px-6 text-sm font-black text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => void handleAssign()}
              disabled={
                saving ||
                drivers.length === 0 ||
                !selectedDriverId
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-7 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {saving && <RefreshIcon spinning />}
              {saving
                ? "Asignando..."
                : "Confirmar asignación"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

interface OrderDetailProps {
  order: AdminOrder;
}

function OrderDetail({
  order,
}: OrderDetailProps) {
  return (
    <div className="border-t border-zinc-100 bg-zinc-50/70 px-5 py-6 sm:px-7">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div>
          <h3 className="text-lg font-black">
            Productos del pedido
          </h3>

          <div className="mt-4 space-y-3">
            {order.order_items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm font-bold text-zinc-500">
                Este pedido no contiene productos registrados.
              </div>
            ) : (
              order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-[64px_1fr_auto] sm:items-center"
                >
                  <ProductImage
                    src={item.products?.image}
                    alt={
                      item.products?.name ?? "Producto"
                    }
                  />

                  <div>
                    <p className="font-black text-zinc-900">
                      {item.products?.name ??
                        "Producto sin nombre"}
                    </p>

                    <p className="mt-1 text-xs font-bold text-zinc-500">
                      {formatQuantity(item.quantity)} ×{" "}
                      {formatMoney(item.unit_price)}
                      {item.products?.unit
                        ? ` · ${item.products.unit}`
                        : ""}
                    </p>
                  </div>

                  <p className="text-lg font-black text-green-600">
                    {formatMoney(item.subtotal)}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">
              Información logística
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Modalidad"
                value={getDeliveryTypeLabel(
                  order.delivery_type
                )}
              />

              <DetailItem
                label="Estado logístico"
                value={order.delivery_status}
              />

              <DetailItem
                label="Fecha de entrega"
                value={
                  order.delivery_date
                    ? formatDeliveryDate(
                        order.delivery_date
                      )
                    : "No aplica"
                }
              />

              <DetailItem
                label="Horario"
                value={
                  order.delivery_window ||
                  formatStoredTime(
                    order.delivery_time
                  ) ||
                  "No definido"
                }
              />

              <DetailItem
                label="Entrega estimada"
                value={
                  order.estimated_delivery
                    ? formatDate(
                        order.estimated_delivery
                      )
                    : "No definida"
                }
              />

              <DetailItem
                label="Observaciones"
                value={
                  order.delivery_notes ||
                  "Sin observaciones"
                }
              />
            </div>
          </div>
        </div>

        <aside className="rounded-2xl bg-zinc-950 p-5 text-white">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-green-300">
            Resumen financiero
          </p>

          <div className="mt-5 space-y-4 text-sm">
            <PriceRow
              label="Subtotal"
              value={order.subtotal}
            />

            <PriceRow
              label="Entrega"
              value={order.delivery}
              freeLabel
            />

            <div className="border-t border-white/10 pt-4">
              <PriceRow
                label="Total"
                value={order.total}
                prominent
              />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Método de pago
            </p>

            <p className="mt-2 font-black">
              {order.payment_method ??
                "No especificado"}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Modalidad
            </p>

            <p className="mt-2 font-black">
              {getDeliveryTypeLabel(
                order.delivery_type
              )}
            </p>

            <p className="mt-1 text-sm text-zinc-300">
              {getDeliverySummary(order)}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold leading-6 text-zinc-800">
        {value}
      </p>
    </div>
  );
}


interface CoordinateDeliveryModalProps {
  order: AdminOrder;
  onClose: () => void;
  onSaved: (order: {
    id: number;
    delivery_date: string;
    delivery_time: string;
    delivery_window: string;
    estimated_delivery: string;
    delivery_notes: string | null;
    delivery_status: "Confirmada";
  }) => void;
  onError: (message: string) => void;
}

function CoordinateDeliveryModal({
  order,
  onClose,
  onSaved,
  onError,
}: CoordinateDeliveryModalProps) {
  const [deliveryDate, setDeliveryDate] = useState(
    order.delivery_date ?? ""
  );
  const [deliveryTime, setDeliveryTime] = useState(
    order.delivery_time
      ? order.delivery_time.slice(0, 5)
      : ""
  );
  const [deliveryNotes, setDeliveryNotes] = useState(
    order.delivery_notes ?? ""
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, saving]);

  const minimumDate = useMemo(
    () => formatDateInputValue(new Date()),
    []
  );

  const maximumDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return formatDateInputValue(date);
  }, []);

  const availableTimes = useMemo(() => {
    const slots = createDeliveryTimeSlots();

    if (!deliveryDate) {
      return slots;
    }

    const today = formatDateInputValue(new Date());

    if (deliveryDate !== today) {
      return slots;
    }

    const minimumTime = new Date();
    minimumTime.setMinutes(minimumTime.getMinutes() + 60);

    return slots.filter((time) => {
      const candidate = new Date(
        `${deliveryDate}T${time}:00`
      );

      return candidate.getTime() >= minimumTime.getTime();
    });
  }, [deliveryDate]);

  useEffect(() => {
    if (
      deliveryTime &&
      !availableTimes.includes(deliveryTime)
    ) {
      setDeliveryTime("");
    }
  }, [availableTimes, deliveryTime]);

  const customerName =
    `${order.customers?.first_name ?? ""} ${
      order.customers?.last_name ?? ""
    }`.trim() || "Cliente";

  async function handleSubmit() {
    if (!deliveryDate || !deliveryTime) {
      onError(
        "Selecciona la fecha y el horario para confirmar la entrega."
      );
      return;
    }

    const deliveryWindow = createDeliveryWindowLabel(
      deliveryTime
    );

    try {
      setSaving(true);
      onError("");

      const updatedOrder = await updateDeliverySchedule({
        orderId: order.id,
        deliveryDate,
        deliveryTime,
        deliveryWindow,
        deliveryNotes: deliveryNotes.trim() || null,
      });

      onSaved(updatedOrder);
    } catch (error) {
      console.error(error);
      onError(
        error instanceof Error
          ? error.message
          : "No fue posible confirmar la entrega."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coordinate-delivery-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-white shadow-2xl">
        <header className="relative overflow-hidden bg-zinc-950 px-6 py-7 text-white sm:px-8">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-green-500/20 blur-3xl"
          />

          <div className="relative flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
                Entrega coordinada
              </p>

              <h2
                id="coordinate-delivery-title"
                className="mt-2 text-3xl font-black tracking-tight"
              >
                Confirmar fecha y horario
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Pedido #{order.id} · {customerName}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Cerrar coordinación de entrega"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className="p-6 sm:p-8">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-black text-green-950">
              Horario operativo tentativo
            </p>

            <p className="mt-1 text-sm leading-6 text-green-800">
              De 07h00 a 20h00, con intervalos de 15 minutos y
              una preparación mínima de 60 minutos para el mismo día.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-zinc-700">
                Fecha confirmada
              </span>

              <input
                type="date"
                value={deliveryDate}
                min={minimumDate}
                max={maximumDate}
                onChange={(event) => {
                  setDeliveryDate(event.target.value);
                  setDeliveryTime("");
                }}
                className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm font-bold text-zinc-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-zinc-700">
                Intervalo de entrega
              </span>

              <select
                value={deliveryTime}
                disabled={!deliveryDate}
                onChange={(event) =>
                  setDeliveryTime(event.target.value)
                }
                className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm font-bold text-zinc-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
              >
                <option value="">
                  {deliveryDate
                    ? "Selecciona un intervalo"
                    : "Selecciona primero la fecha"}
                </option>

                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {createDeliveryWindowLabel(time)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {deliveryDate && availableTimes.length === 0 && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
              Ya no existen intervalos disponibles para esta fecha.
              Selecciona un día posterior.
            </div>
          )}

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-black text-zinc-700">
              Observaciones de coordinación
            </span>

            <textarea
              value={deliveryNotes}
              onChange={(event) =>
                setDeliveryNotes(event.target.value)
              }
              rows={4}
              maxLength={500}
              placeholder="Ejemplo: cliente confirma recepción en la tarde; llamar cinco minutos antes de llegar."
              className="w-full resize-none rounded-2xl border border-zinc-300 bg-white p-4 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
            />

            <p className="mt-2 text-right text-xs font-bold text-zinc-400">
              {deliveryNotes.length}/500
            </p>
          </label>

          {deliveryDate && deliveryTime && (
            <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Confirmación prevista
              </p>

              <p className="mt-2 text-lg font-black capitalize text-zinc-950">
                {formatDeliveryDate(deliveryDate)}
              </p>

              <p className="mt-1 text-sm font-bold text-green-700">
                {createDeliveryWindowLabel(deliveryTime)}
              </p>

              <p className="mt-3 text-xs leading-5 text-zinc-500">
                Al guardar, el estado logístico cambiará automáticamente
                a “Confirmada”.
              </p>
            </div>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-12 rounded-xl border border-zinc-200 bg-white px-6 text-sm font-black text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={saving || !deliveryDate || !deliveryTime}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-7 text-sm font-black text-white shadow-lg transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
            >
              {saving && <RefreshIcon spinning />}
              {saving
                ? "Confirmando entrega..."
                : "Confirmar entrega"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createDeliveryTimeSlots(): string[] {
  const slots: string[] = [];

  for (
    let hour = DELIVERY_OPENING_HOUR;
    hour < DELIVERY_CLOSING_HOUR;
    hour += 1
  ) {
    for (
      let minute = 0;
      minute < 60;
      minute += DELIVERY_INTERVAL_MINUTES
    ) {
      slots.push(
        `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`
      );
    }
  }

  return slots;
}

function createDeliveryWindowLabel(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const start = new Date();
  start.setHours(hour, minute, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + DELIVERY_INTERVAL_MINUTES);

  return `${String(start.getHours()).padStart(2, "0")}h${String(
    start.getMinutes()
  ).padStart(2, "0")} - ${String(end.getHours()).padStart(
    2,
    "0"
  )}h${String(end.getMinutes()).padStart(2, "0")}`;
}

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
}

function ProductImage({
  src,
  alt,
}: ProductImageProps) {
  if (!src) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-100 text-green-700">
        <ProductIcon />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-16 w-16 rounded-xl object-cover"
    />
  );
}

interface PriceRowProps {
  label: string;
  value: number;
  prominent?: boolean;
  freeLabel?: boolean;
}

function PriceRow({
  label,
  value,
  prominent = false,
  freeLabel = false,
}: PriceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          prominent
            ? "text-base font-black"
            : "text-zinc-400"
        }
      >
        {label}
      </span>

      <span
        className={
          prominent
            ? "text-2xl font-black text-green-300"
            : "font-black"
        }
      >
        {freeLabel && value === 0
          ? "Gratis"
          : formatMoney(value)}
      </span>
    </div>
  );
}

interface ContactRowProps {
  icon: ReactNode;
  value: string;
}

function ContactRow({
  icon,
  value,
}: ContactRowProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
        {icon}
      </span>

      <span className="break-words font-medium">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: OrderStatus;
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

function DeliveryTypeBadge({
  type,
}: {
  type: AdminDeliveryType;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${getDeliveryTypeBadgeClass(
        type
      )}`}
    >
      <DeliveryIcon type={type} />
      {getDeliveryTypeLabel(type)}
    </span>
  );
}

function DeliveryStatusBadge({
  status,
}: {
  status: AdminDeliveryStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-2 text-xs font-black ${getDeliveryStatusBadgeClass(
        status
      )}`}
    >
      {status}
    </span>
  );
}

interface NotificationProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

function Notification({
  type,
  message,
  onClose,
}: NotificationProps) {
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
              ? "Actualización confirmada"
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
        Consultando pedidos
      </h2>

      <p className="mt-2 text-sm text-zinc-500">
        Recuperando clientes, productos, modalidades y
        estados desde Supabase.
      </p>
    </section>
  );
}

function EmptyPanel({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <section className="mt-6 rounded-[2rem] border border-zinc-200 bg-white p-12 text-center shadow-sm">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
        <SearchIcon large />
      </span>

      <h2 className="mt-6 text-2xl font-black">
        No encontramos pedidos
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        Revisa el texto de búsqueda, el estado o la
        modalidad seleccionada.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-6 rounded-xl bg-green-600 px-6 py-3 text-sm font-black text-white transition hover:bg-green-700"
      >
        Limpiar filtros
      </button>
    </section>
  );
}

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
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

function formatDeliveryDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-EC", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatStoredTime(
  value: string | null
): string | null {
  if (!value) {
    return null;
  }

  const [hours, minutes] = value.split(":");

  if (!hours || !minutes) {
    return value;
  }

  return `${hours}h${minutes}`;
}

function getDeliveryTypeLabel(
  type: AdminDeliveryType
): string {
  const labels: Record<AdminDeliveryType, string> = {
    express: "Express",
    scheduled: "Pedido programado",
    coordinated: "Entrega coordinada",
  };

  return labels[type];
}

function getDeliverySummary(
  order: AdminOrder
): string {
  if (order.delivery_type === "scheduled") {
    const date = order.delivery_date
      ? formatDeliveryDate(order.delivery_date)
      : "Fecha no definida";

    const time =
      order.delivery_window ||
      formatStoredTime(order.delivery_time) ||
      "Horario no definido";

    return `${date} · ${time}`;
  }

  if (order.delivery_type === "coordinated") {
    return order.delivery_notes
      ? order.delivery_notes
      : "Pendiente de coordinación con el cliente.";
  }

  if (order.estimated_delivery) {
    return `Entrega estimada: ${formatDate(
      order.estimated_delivery
    )}`;
  }

  return "Entrega prioritaria estimada entre 20 y 30 minutos.";
}

function getDeliverySortTimestamp(
  order: AdminOrder
): number {
  if (
    order.delivery_date &&
    order.delivery_time
  ) {
    const date = new Date(
      `${order.delivery_date}T${order.delivery_time}`
    );

    if (!Number.isNaN(date.getTime())) {
      return date.getTime();
    }
  }

  if (order.estimated_delivery) {
    const date = new Date(
      order.estimated_delivery
    );

    if (!Number.isNaN(date.getTime())) {
      return date.getTime();
    }
  }

  return Number.MAX_SAFE_INTEGER;
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

function buildDriverWhatsAppUrl(
  phone: string,
  driverName: string,
  orderId: number
): string {
  const normalizedPhone =
    normalizeEcuadorianPhone(phone);

  const message = [
    `Hola ${driverName}.`,
    `Te contactamos desde el Centro Delivery de MercaNova GO.`,
    `Tienes asignado el pedido #${orderId}.`,
    `Revisa las indicaciones operativas antes de iniciar la entrega.`,
  ].join(" ");

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(
    message
  )}`;
}

function buildWhatsAppUrl(
  phone: string,
  order: AdminOrder,
  customerName: string
): string | null {
  const normalizedPhone =
    normalizeEcuadorianPhone(phone);

  if (!normalizedPhone) {
    return null;
  }

  const message = [
    `Hola ${customerName}.`,
    `Te contactamos desde MercaNova GO por tu pedido #${order.id}.`,
    `Modalidad: ${getDeliveryTypeLabel(
      order.delivery_type
    )}.`,
    `Estado de entrega: ${order.delivery_status}.`,
    getDeliverySummary(order),
    `Total registrado: ${formatMoney(order.total)}.`,
  ].join(" ");

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(
    message
  )}`;
}

function getMetricTone(tone: string): string {
  const tones: Record<string, string> = {
    default: "bg-zinc-100 text-zinc-700",
    warning: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
  };

  return tones[tone] ?? tones.default;
}

function getMetricValueTone(tone: string): string {
  const tones: Record<string, string> = {
    default: "text-zinc-950",
    warning: "text-amber-600",
    blue: "text-blue-600",
    success: "text-green-600",
  };

  return tones[tone] ?? tones.default;
}

function getStatusBadgeClass(
  status: OrderStatus
): string {
  const classes: Record<OrderStatus, string> = {
    Pendiente:
      "border-amber-200 bg-amber-50 text-amber-700",
    Confirmado:
      "border-sky-200 bg-sky-50 text-sky-700",
    Preparando:
      "border-orange-200 bg-orange-50 text-orange-700",
    "En camino":
      "border-blue-200 bg-blue-50 text-blue-700",
    Entregado:
      "border-green-200 bg-green-50 text-green-700",
    Cancelado:
      "border-red-200 bg-red-50 text-red-700",
  };

  return classes[status];
}

function getStatusSelectClass(
  status: OrderStatus
): string {
  const classes: Record<OrderStatus, string> = {
    Pendiente:
      "border-amber-200 bg-amber-50 text-amber-800",
    Confirmado:
      "border-sky-200 bg-sky-50 text-sky-800",
    Preparando:
      "border-orange-200 bg-orange-50 text-orange-800",
    "En camino":
      "border-blue-200 bg-blue-50 text-blue-800",
    Entregado:
      "border-green-200 bg-green-50 text-green-800",
    Cancelado:
      "border-red-200 bg-red-50 text-red-800",
  };

  return classes[status];
}

function getDeliveryTypeBadgeClass(
  type: AdminDeliveryType
): string {
  const classes: Record<
    AdminDeliveryType,
    string
  > = {
    express:
      "border-green-200 bg-green-50 text-green-700",
    scheduled:
      "border-blue-200 bg-blue-50 text-blue-700",
    coordinated:
      "border-violet-200 bg-violet-50 text-violet-700",
  };

  return classes[type];
}

function getDeliveryStatusBadgeClass(
  status: AdminDeliveryStatus
): string {
  const classes: Record<
    AdminDeliveryStatus,
    string
  > = {
    Pendiente:
      "border-amber-200 bg-amber-50 text-amber-800",
    "Por coordinar":
      "border-violet-200 bg-violet-50 text-violet-800",
    Programada:
      "border-blue-200 bg-blue-50 text-blue-800",
    Confirmada:
      "border-sky-200 bg-sky-50 text-sky-800",
    Preparando:
      "border-orange-200 bg-orange-50 text-orange-800",
    "Lista para entrega":
      "border-cyan-200 bg-cyan-50 text-cyan-800",
    "En camino":
      "border-indigo-200 bg-indigo-50 text-indigo-800",
    Entregada:
      "border-green-200 bg-green-50 text-green-800",
    Cancelada:
      "border-red-200 bg-red-50 text-red-800",
  };

  return classes[status];
}

function getDeliveryStatusSelectClass(
  status: AdminDeliveryStatus
): string {
  return getDeliveryStatusBadgeClass(status);
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

function DeliveryIcon({
  type,
}: {
  type: AdminDeliveryType;
}) {
  if (type === "scheduled") {
    return <CalendarIcon />;
  }

  if (type === "coordinated") {
    return <PhoneIcon />;
  }

  return <RouteIcon />;
}

function OrderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="m4.5 7.75 7.5 4.3 7.5-4.3M12 12v8.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M7 3v4M17 3v4M3.5 9.5h17"
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

function MoneyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M15 8.75h-4.2a2.05 2.05 0 0 0 0 4.1h2.4a2.05 2.05 0 0 1 0 4.1H9M12 7v2M12 17v2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
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

function ChevronIcon({
  expanded,
}: {
  expanded: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`h-4 w-4 transition ${
        expanded ? "rotate-180" : ""
      }`}
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M12 20c5 0 8-3.7 8-8.5C15.2 11.3 12 14.1 12 20ZM12 20c-5 0-8-3.7-8-8.5 4.8-.2 8 2.6 8 8.5ZM12 14c0-4.5 2.2-7.5 6-9"
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

function DriverIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <circle
        cx="12"
        cy="8"
        r="3.25"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M5.5 20a6.5 6.5 0 0 1 13 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
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
      className="h-4 w-4"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.9"
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