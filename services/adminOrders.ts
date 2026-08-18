import { getAdminSession } from "@/services/adminLogin";

export const ORDER_STATUSES = [
  "Pendiente",
  "Confirmado",
  "Preparando",
  "En camino",
  "Entregado",
  "Cancelado",
] as const;

export type OrderStatus =
  (typeof ORDER_STATUSES)[number];

export const DELIVERY_TYPES = [
  "express",
  "scheduled",
  "coordinated",
] as const;

export type AdminDeliveryType =
  (typeof DELIVERY_TYPES)[number];

export const DELIVERY_STATUSES = [
  "Pendiente",
  "Por coordinar",
  "Programada",
  "Confirmada",
  "Preparando",
  "Lista para entrega",
  "En camino",
  "Entregada",
  "Cancelada",
] as const;

export type AdminDeliveryStatus =
  (typeof DELIVERY_STATUSES)[number];

export interface AdminOrderCustomer {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface AdminOrderProduct {
  id: number | null;
  name: string | null;
  image: string | null;
  unit: string | null;
}

export interface AdminOrderItem {
  id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  products: AdminOrderProduct | null;
}

export interface AdminOrder {
  id: number;
  subtotal: number;
  delivery: number;
  total: number;
  payment_method: string | null;
  status: OrderStatus;
  created_at: string;

  delivery_type: AdminDeliveryType;
  delivery_date: string | null;
  delivery_time: string | null;
  delivery_window: string | null;
  estimated_delivery: string | null;
  delivery_notes: string | null;
  delivery_status: AdminDeliveryStatus;

  customers: AdminOrderCustomer | null;
  order_items: AdminOrderItem[];
}

interface RawOrder {
  id: number;
  subtotal:
    | number
    | string
    | null;
  delivery:
    | number
    | string
    | null;
  total:
    | number
    | string
    | null;
  payment_method: string | null;
  status: string | null;
  created_at: string;

  delivery_type: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  delivery_window: string | null;
  estimated_delivery: string | null;
  delivery_notes: string | null;
  delivery_status: string | null;

  customers:
    | AdminOrderCustomer
    | AdminOrderCustomer[]
    | null;

  order_items:
    | Array<{
        id: number;
        quantity:
          | number
          | string
          | null;
        unit_price:
          | number
          | string
          | null;
        subtotal:
          | number
          | string
          | null;

        products:
          | AdminOrderProduct
          | AdminOrderProduct[]
          | null;
      }>
    | null;
}

interface AdminOrdersResponse {
  ok: boolean;
  data?: RawOrder[];
  error?: string;
}

function toNumber(
  value:
    | number
    | string
    | null
    | undefined
): number {
  const converted = Number(
    value ?? 0
  );

  return Number.isFinite(converted)
    ? converted
    : 0;
}

function firstRelation<T>(
  value:
    | T
    | T[]
    | null
    | undefined
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normalizeText(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}

export function normalizeOrderStatus(
  status:
    | string
    | null
    | undefined
): OrderStatus {
  const cleanStatus =
    normalizeText(status ?? "");

  if (
    cleanStatus.includes("cancel") ||
    cleanStatus.includes("rechaz")
  ) {
    return "Cancelado";
  }

  if (
    cleanStatus.includes("entreg") ||
    cleanStatus.includes("finaliz") ||
    cleanStatus.includes("complet")
  ) {
    return "Entregado";
  }

  if (
    cleanStatus.includes("camino") ||
    cleanStatus.includes("despach") ||
    cleanStatus.includes("repart")
  ) {
    return "En camino";
  }

  if (
    cleanStatus.includes("prepar") ||
    cleanStatus.includes("proces")
  ) {
    return "Preparando";
  }

  if (
    cleanStatus.includes("confirm") ||
    cleanStatus.includes("acept")
  ) {
    return "Confirmado";
  }

  return "Pendiente";
}

export function normalizeDeliveryType(
  deliveryType:
    | string
    | null
    | undefined
): AdminDeliveryType {
  const cleanType =
    normalizeText(
      deliveryType ?? ""
    );

  if (
    cleanType === "scheduled" ||
    cleanType.includes("program")
  ) {
    return "scheduled";
  }

  if (
    cleanType === "coordinated" ||
    cleanType.includes("coordin")
  ) {
    return "coordinated";
  }

  return "express";
}

export function normalizeDeliveryStatus(
  deliveryStatus:
    | string
    | null
    | undefined,
  deliveryType: AdminDeliveryType
): AdminDeliveryStatus {
  const cleanStatus =
    normalizeText(
      deliveryStatus ?? ""
    );

  if (
    cleanStatus.includes("cancel") ||
    cleanStatus.includes("rechaz")
  ) {
    return "Cancelada";
  }

  if (
    cleanStatus.includes("entreg") ||
    cleanStatus.includes("finaliz") ||
    cleanStatus.includes("complet")
  ) {
    return "Entregada";
  }

  if (
    cleanStatus.includes("camino") ||
    cleanStatus.includes("despach") ||
    cleanStatus.includes("repart")
  ) {
    return "En camino";
  }

  if (
    cleanStatus.includes("lista") ||
    cleanStatus.includes("listo")
  ) {
    return "Lista para entrega";
  }

  if (
    cleanStatus.includes("prepar") ||
    cleanStatus.includes("proces")
  ) {
    return "Preparando";
  }

  if (
    cleanStatus.includes("confirm")
  ) {
    return "Confirmada";
  }

  if (
    cleanStatus.includes("program")
  ) {
    return "Programada";
  }

  if (
    cleanStatus.includes("coordinar") ||
    cleanStatus.includes(
      "por coordinar"
    )
  ) {
    return "Por coordinar";
  }

  if (
    deliveryType === "scheduled"
  ) {
    return "Programada";
  }

  if (
    deliveryType === "coordinated"
  ) {
    return "Por coordinar";
  }

  return "Pendiente";
}

function mapOrder(
  rawOrder: RawOrder
): AdminOrder {
  const customer =
    firstRelation(
      rawOrder.customers
    );

  const deliveryType =
    normalizeDeliveryType(
      rawOrder.delivery_type
    );

  const items: AdminOrderItem[] =
    (
      rawOrder.order_items ?? []
    ).map((item) => {
      const quantity =
        toNumber(item.quantity);

      const unitPrice =
        toNumber(item.unit_price);

      const storedSubtotal =
        toNumber(item.subtotal);

      return {
        id: item.id,
        quantity,
        unit_price: unitPrice,
        subtotal:
          storedSubtotal ||
          quantity * unitPrice,
        products:
          firstRelation(
            item.products
          ),
      };
    });

  return {
    id: rawOrder.id,
    subtotal:
      toNumber(
        rawOrder.subtotal
      ),
    delivery:
      toNumber(
        rawOrder.delivery
      ),
    total:
      toNumber(rawOrder.total),
    payment_method:
      rawOrder.payment_method,
    status:
      normalizeOrderStatus(
        rawOrder.status
      ),
    created_at:
      rawOrder.created_at,

    delivery_type:
      deliveryType,
    delivery_date:
      rawOrder.delivery_date,
    delivery_time:
      rawOrder.delivery_time,
    delivery_window:
      rawOrder.delivery_window,
    estimated_delivery:
      rawOrder.estimated_delivery,
    delivery_notes:
      rawOrder.delivery_notes
        ?.trim() || null,

    delivery_status:
      normalizeDeliveryStatus(
        rawOrder.delivery_status,
        deliveryType
      ),

    customers: customer,
    order_items: items,
  };
}

export async function getAdminOrders(): Promise<
  AdminOrder[]
> {
  try {
    const session =
      await getAdminSession();

    if (!session?.accessToken) {
      throw new Error(
        "No existe una sesión administrativa válida para cargar pedidos."
      );
    }

    const response = await fetch(
      "/api/admin/orders",
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept:
            "application/json",
          Authorization:
            `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} ${response.statusText}`
      );
    }

    const result =
      (await response.json()) as AdminOrdersResponse;

    if (!result.ok) {
      throw new Error(
        result.error ??
          "No fue posible cargar los pedidos."
      );
    }

    return (
      result.data ?? []
    ).map(mapOrder);
  } catch (error) {
    console.error(
      "Error cargando pedidos administrativos:",
      error
    );

    throw new Error(
      "No fue posible cargar los pedidos de MercaNova GO."
    );
  }
}