import { supabase } from "@/lib/supabase";

export interface AdminDashboardMetrics {
  salesToday: number;
  ordersToday: number;
  newCustomersToday: number;
  activeProducts: number;
  outOfStockProducts: number;
  pendingOrders: number;
  deliveredOrdersToday: number;
  averageTicketToday: number;
  salesVariationPercent: number | null;
  ordersVariationPercent: number | null;
  updatedAt: string;
}

interface OrderDashboardRow {
  total: number | string | null;
  status: string | null;
  created_at: string;
}

function getLocalDayRange(
  dayOffset = 0
): {
  start: string;
  end: string;
} {
  const start = new Date();

  start.setHours(0, 0, 0, 0);
  start.setDate(
    start.getDate() + dayOffset
  );

  const end = new Date(start);

  end.setDate(end.getDate() + 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function normalizeMoney(
  value: number | string | null
): number {
  const normalizedValue = Number(value);

  if (!Number.isFinite(normalizedValue)) {
    return 0;
  }

  return normalizedValue;
}

function isCancelledStatus(
  status: string | null
): boolean {
  return (
    status?.trim().toLowerCase() ===
    "cancelado"
  );
}

function isDeliveredStatus(
  status: string | null
): boolean {
  return (
    status?.trim().toLowerCase() ===
    "entregado"
  );
}

function calculateVariation(
  currentValue: number,
  previousValue: number
): number | null {
  if (previousValue === 0) {
    return currentValue === 0
      ? 0
      : null;
  }

  return Number(
    (
      ((currentValue - previousValue) /
        previousValue) *
      100
    ).toFixed(1)
  );
}

function assertQuerySucceeded(
  error: { message?: string } | null,
  context: string
): void {
  if (!error) {
    return;
  }

  console.error(context, error);

  throw new Error(
    error.message ||
      "No fue posible cargar los indicadores del panel."
  );
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const today =
    getLocalDayRange(0);

  const yesterday =
    getLocalDayRange(-1);

  const [
    todayOrdersResponse,
    yesterdayOrdersResponse,
    customersResponse,
    activeProductsResponse,
    outOfStockProductsResponse,
    pendingOrdersResponse,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "total,status,created_at"
      )
      .gte(
        "created_at",
        today.start
      )
      .lt(
        "created_at",
        today.end
      ),

    supabase
      .from("orders")
      .select(
        "total,status,created_at"
      )
      .gte(
        "created_at",
        yesterday.start
      )
      .lt(
        "created_at",
        yesterday.end
      ),

    supabase
      .from("customers")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        }
      )
      .gte(
        "created_at",
        today.start
      )
      .lt(
        "created_at",
        today.end
      ),

    supabase
      .from("products")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        }
      )
      .eq("stock", true),

    supabase
      .from("products")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        }
      )
      .eq("stock", false),

    supabase
      .from("orders")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        }
      )
      .eq(
        "status",
        "Pendiente"
      ),
  ]);

  assertQuerySucceeded(
    todayOrdersResponse.error,
    "Error consultando los pedidos de hoy:"
  );

  assertQuerySucceeded(
    yesterdayOrdersResponse.error,
    "Error consultando los pedidos de ayer:"
  );

  assertQuerySucceeded(
    customersResponse.error,
    "Error consultando los clientes nuevos:"
  );

  assertQuerySucceeded(
    activeProductsResponse.error,
    "Error consultando los productos activos:"
  );

  assertQuerySucceeded(
    outOfStockProductsResponse.error,
    "Error consultando los productos agotados:"
  );

  assertQuerySucceeded(
    pendingOrdersResponse.error,
    "Error consultando los pedidos pendientes:"
  );

  const todayOrders =
    (todayOrdersResponse.data ??
      []) as OrderDashboardRow[];

  const yesterdayOrders =
    (yesterdayOrdersResponse.data ??
      []) as OrderDashboardRow[];

  const validTodayOrders =
    todayOrders.filter(
      (order) =>
        !isCancelledStatus(
          order.status
        )
    );

  const validYesterdayOrders =
    yesterdayOrders.filter(
      (order) =>
        !isCancelledStatus(
          order.status
        )
    );

  const salesToday =
    validTodayOrders.reduce(
      (total, order) =>
        total +
        normalizeMoney(order.total),
      0
    );

  const salesYesterday =
    validYesterdayOrders.reduce(
      (total, order) =>
        total +
        normalizeMoney(order.total),
      0
    );

  const ordersToday =
    validTodayOrders.length;

  const ordersYesterday =
    validYesterdayOrders.length;

  const deliveredOrdersToday =
    todayOrders.filter((order) =>
      isDeliveredStatus(order.status)
    ).length;

  return {
    salesToday: Number(
      salesToday.toFixed(2)
    ),
    ordersToday,
    newCustomersToday:
      customersResponse.count ?? 0,
    activeProducts:
      activeProductsResponse.count ??
      0,
    outOfStockProducts:
      outOfStockProductsResponse.count ??
      0,
    pendingOrders:
      pendingOrdersResponse.count ??
      0,
    deliveredOrdersToday,
    averageTicketToday:
      ordersToday > 0
        ? Number(
            (
              salesToday /
              ordersToday
            ).toFixed(2)
          )
        : 0,
    salesVariationPercent:
      calculateVariation(
        salesToday,
        salesYesterday
      ),
    ordersVariationPercent:
      calculateVariation(
        ordersToday,
        ordersYesterday
      ),
    updatedAt:
      new Date().toISOString(),
  };
}