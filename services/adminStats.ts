import { supabase } from "@/lib/supabase";

export type StatsPeriod = "today" | "week" | "month" | "all";

export interface SalesChartPoint {
  date: string;
  label: string;
  sales: number;
  orders: number;
}

export interface OrderStatusSummary {
  key: string;
  label: string;
  count: number;
}

export interface TopProductSummary {
  productId: number;
  name: string;
  category: string;
  quantity: number;
  sales: number;
}

export interface DashboardStats {
  products: number;
  availableProducts: number;
  outOfStockProducts: number;

  customers: number;
  newCustomersThisMonth: number;

  orders: number;
  validOrders: number;

  sales: number;
  salesToday: number;
  salesWeek: number;
  salesMonth: number;

  averageTicket: number;

  pending: number;
  confirmed: number;
  preparing: number;
  packing: number;
  onWay: number;
  delivered: number;
  cancelled: number;

  salesChart: SalesChartPoint[];
  statusSummary: OrderStatusSummary[];
  topProducts: TopProductSummary[];
}

interface ProductRow {
  id: number;
  name: string | null;
  category: string | null;
  stock: boolean | null;
}

interface CustomerRow {
  id: number;
  created_at: string | null;
}

interface OrderRow {
  id: number;
  total: number | string | null;
  status: string | null;
  created_at: string | null;
}

interface OrderItemRow {
  product_id: number | null;
  quantity: number | string | null;
  unit_price: number | string | null;
  subtotal: number | string | null;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

const EMPTY_STATS: DashboardStats = {
  products: 0,
  availableProducts: 0,
  outOfStockProducts: 0,

  customers: 0,
  newCustomersThisMonth: 0,

  orders: 0,
  validOrders: 0,

  sales: 0,
  salesToday: 0,
  salesWeek: 0,
  salesMonth: 0,

  averageTicket: 0,

  pending: 0,
  confirmed: 0,
  preparing: 0,
  packing: 0,
  onWay: 0,
  delivered: 0,
  cancelled: 0,

  salesChart: [],
  statusSummary: [],
  topProducts: [],
};

function toNumber(value: number | string | null | undefined): number {
  const converted = Number(value ?? 0);

  return Number.isFinite(converted) ? converted : 0;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeStatus(status: string | null | undefined): string {
  const normalized = normalizeText(status);

  if (!normalized) {
    return "pendiente";
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("rechaz")
  ) {
    return "cancelado";
  }

  if (
    normalized.includes("entreg") ||
    normalized.includes("finaliz") ||
    normalized.includes("complet")
  ) {
    return "entregado";
  }

  if (
    normalized.includes("camino") ||
    normalized.includes("repart") ||
    normalized.includes("delivery") ||
    normalized.includes("despach")
  ) {
    return "en_camino";
  }

  if (
    normalized.includes("empac") ||
    normalized.includes("embal")
  ) {
    return "empacando";
  }

  if (
    normalized.includes("prepar") ||
    normalized.includes("comprando") ||
    normalized.includes("compra")
  ) {
    return "preparando";
  }

  if (
    normalized.includes("confirm") ||
    normalized.includes("acept")
  ) {
    return "confirmado";
  }

  return "pendiente";
}

function isCancelledOrder(order: OrderRow): boolean {
  return normalizeStatus(order.status) === "cancelado";
}

function isDateInsideRange(dateValue: string | null, range: DateRange): boolean {
  if (!dateValue) {
    return false;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (range.start && date < range.start) {
    return false;
  }

  if (range.end && date > range.end) {
    return false;
  }

  return true;
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function startOfWeek(date: Date): Date {
  const result = startOfDay(date);
  const day = result.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);

  return result;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function getPeriodRange(period: StatsPeriod, now: Date): DateRange {
  if (period === "today") {
    return {
      start: startOfDay(now),
      end: endOfDay(now),
    };
  }

  if (period === "week") {
    return {
      start: startOfWeek(now),
      end: endOfDay(now),
    };
  }

  if (period === "month") {
    return {
      start: startOfMonth(now),
      end: endOfDay(now),
    };
  }

  return {
    start: null,
    end: null,
  };
}

function calculateSales(orders: OrderRow[]): number {
  return orders.reduce((total, order) => {
    if (isCancelledOrder(order)) {
      return total;
    }

    return total + toNumber(order.total);
  }, 0);
}

function createSalesChart(
  orders: OrderRow[],
  numberOfDays = 7
): SalesChartPoint[] {
  const today = startOfDay(new Date());

  return Array.from({ length: numberOfDays }, (_, index) => {
    const date = new Date(today);

    date.setDate(today.getDate() - (numberOfDays - 1 - index));

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const dayOrders = orders.filter((order) => {
      if (isCancelledOrder(order)) {
        return false;
      }

      return isDateInsideRange(order.created_at, {
        start: dayStart,
        end: dayEnd,
      });
    });

    return {
      date: date.toISOString().slice(0, 10),

      label: new Intl.DateTimeFormat("es-EC", {
        weekday: "short",
        day: "2-digit",
      })
        .format(date)
        .replace(".", ""),

      sales: calculateSales(dayOrders),
      orders: dayOrders.length,
    };
  });
}

function createStatusSummary(orders: OrderRow[]): OrderStatusSummary[] {
  const counters = {
    pendiente: 0,
    confirmado: 0,
    preparando: 0,
    empacando: 0,
    en_camino: 0,
    entregado: 0,
    cancelado: 0,
  };

  orders.forEach((order) => {
    const status = normalizeStatus(order.status);

    counters[status as keyof typeof counters] += 1;
  });

  return [
    {
      key: "pending",
      label: "Pendientes",
      count: counters.pendiente,
    },
    {
      key: "confirmed",
      label: "Confirmados",
      count: counters.confirmado,
    },
    {
      key: "preparing",
      label: "Preparando",
      count: counters.preparando,
    },
    {
      key: "packing",
      label: "Empacando",
      count: counters.empacando,
    },
    {
      key: "onWay",
      label: "En camino",
      count: counters.en_camino,
    },
    {
      key: "delivered",
      label: "Entregados",
      count: counters.entregado,
    },
    {
      key: "cancelled",
      label: "Cancelados",
      count: counters.cancelado,
    },
  ];
}

function createTopProducts(
  products: ProductRow[],
  orderItems: OrderItemRow[]
): TopProductSummary[] {
  const productMap = new Map(
    products.map((product) => [product.id, product])
  );

  const totals = new Map<
    number,
    {
      quantity: number;
      sales: number;
    }
  >();

  orderItems.forEach((item) => {
    if (!item.product_id) {
      return;
    }

    const current = totals.get(item.product_id) ?? {
      quantity: 0,
      sales: 0,
    };

    const quantity = toNumber(item.quantity);

    const subtotal =
      toNumber(item.subtotal) ||
      quantity * toNumber(item.unit_price);

    totals.set(item.product_id, {
      quantity: current.quantity + quantity,
      sales: current.sales + subtotal,
    });
  });

  return Array.from(totals.entries())
    .map(([productId, summary]) => {
      const product = productMap.get(productId);

      return {
        productId,
        name: product?.name?.trim() || `Producto #${productId}`,
        category: product?.category?.trim() || "Sin categoría",
        quantity: summary.quantity,
        sales: summary.sales,
      };
    })
    .sort((a, b) => {
      if (b.quantity !== a.quantity) {
        return b.quantity - a.quantity;
      }

      return b.sales - a.sales;
    })
    .slice(0, 5);
}

function getStatusCount(
  statusSummary: OrderStatusSummary[],
  key: string
): number {
  return statusSummary.find((item) => item.key === key)?.count ?? 0;
}

export async function getDashboardStats(
  period: StatsPeriod = "all"
): Promise<DashboardStats> {
  try {
    const [
      productsResponse,
      customersResponse,
      ordersResponse,
      orderItemsResponse,
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id,name,category,stock"),

      supabase
        .from("customers")
        .select("id,created_at"),

      supabase
        .from("orders")
        .select("id,total,status,created_at")
        .order("created_at", {
          ascending: true,
        }),

      supabase
        .from("order_items")
        .select("product_id,quantity,unit_price,subtotal"),
    ]);

    const errors = [
      productsResponse.error,
      customersResponse.error,
      ordersResponse.error,
      orderItemsResponse.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error(
        "Errores obteniendo estadísticas administrativas:",
        errors
      );

      throw new Error(
        "No fue posible consultar toda la información estadística."
      );
    }

    const products = (productsResponse.data ?? []) as ProductRow[];
    const customers = (customersResponse.data ?? []) as CustomerRow[];
    const orders = (ordersResponse.data ?? []) as OrderRow[];
    const orderItems = (orderItemsResponse.data ?? []) as OrderItemRow[];

    const now = new Date();

    const todayRange: DateRange = {
      start: startOfDay(now),
      end: endOfDay(now),
    };

    const weekRange: DateRange = {
      start: startOfWeek(now),
      end: endOfDay(now),
    };

    const monthRange: DateRange = {
      start: startOfMonth(now),
      end: endOfDay(now),
    };

    const selectedRange = getPeriodRange(period, now);

    const selectedOrders = orders.filter((order) => {
      if (period === "all") {
        return true;
      }

      return isDateInsideRange(order.created_at, selectedRange);
    });

    const validSelectedOrders = selectedOrders.filter(
      (order) => !isCancelledOrder(order)
    );

    const sales = calculateSales(selectedOrders);

    const averageTicket =
      validSelectedOrders.length > 0
        ? sales / validSelectedOrders.length
        : 0;

    const statusSummary = createStatusSummary(selectedOrders);

    const customersThisMonth = customers.filter((customer) =>
      isDateInsideRange(customer.created_at, monthRange)
    ).length;

    const availableProducts = products.filter(
      (product) => product.stock === true
    ).length;

    const outOfStockProducts = products.filter(
      (product) => product.stock === false
    ).length;

    return {
      products: products.length,
      availableProducts,
      outOfStockProducts,

      customers: customers.length,
      newCustomersThisMonth: customersThisMonth,

      orders: selectedOrders.length,
      validOrders: validSelectedOrders.length,

      sales,
      salesToday: calculateSales(
        orders.filter((order) =>
          isDateInsideRange(order.created_at, todayRange)
        )
      ),
      salesWeek: calculateSales(
        orders.filter((order) =>
          isDateInsideRange(order.created_at, weekRange)
        )
      ),
      salesMonth: calculateSales(
        orders.filter((order) =>
          isDateInsideRange(order.created_at, monthRange)
        )
      ),

      averageTicket,

      pending: getStatusCount(statusSummary, "pending"),
      confirmed: getStatusCount(statusSummary, "confirmed"),
      preparing: getStatusCount(statusSummary, "preparing"),
      packing: getStatusCount(statusSummary, "packing"),
      onWay: getStatusCount(statusSummary, "onWay"),
      delivered: getStatusCount(statusSummary, "delivered"),
      cancelled: getStatusCount(statusSummary, "cancelled"),

      salesChart: createSalesChart(orders, 7),
      statusSummary,
      topProducts: createTopProducts(products, orderItems),
    };
  } catch (error) {
    console.error(
      "Error general cargando el Centro de Estadísticas:",
      error
    );

    throw error;
  }
}

export function getEmptyDashboardStats(): DashboardStats {
  return {
    ...EMPTY_STATS,
    salesChart: [],
    statusSummary: [],
    topProducts: [],
  };
}