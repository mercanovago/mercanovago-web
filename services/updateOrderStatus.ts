import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/services/adminOrders";
import { getAdminSession } from "@/services/adminLogin";

export interface UpdatedOrderStatus {
  id: number;
  status: OrderStatus;
}

interface UpdateOrderStatusResponse {
  ok: boolean;
  data?: UpdatedOrderStatus;
  error?: string;
}

function isValidOrderStatus(
  status: string
): status is OrderStatus {
  return ORDER_STATUSES.includes(
    status as OrderStatus
  );
}

export async function updateOrderStatus(
  id: number,
  status: string
): Promise<UpdatedOrderStatus> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El identificador del pedido no es válido."
    );
  }

  if (!isValidOrderStatus(status)) {
    throw new Error(
      "El estado seleccionado no es válido."
    );
  }

  const session = await getAdminSession();

  if (!session?.accessToken) {
    throw new Error(
      "No existe una sesión administrativa válida."
    );
  }

  const response = await fetch(
    "/api/admin/orders",
    {
      method: "PATCH",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        id,
        status,
      }),
    }
  );

  let result: UpdateOrderStatusResponse;

  try {
    result =
      (await response.json()) as UpdateOrderStatusResponse;
  } catch {
    throw new Error(
      "La respuesta del servidor no es válida."
    );
  }

  if (!response.ok || !result.ok) {
    console.error(
      "Error actualizando estado del pedido:",
      result.error ??
        `HTTP ${response.status}`
    );

    throw new Error(
      result.error ??
        "No fue posible actualizar el estado del pedido."
    );
  }

  if (!result.data) {
    throw new Error(
      "El servidor no devolvió el pedido actualizado."
    );
  }

  return result.data;
}