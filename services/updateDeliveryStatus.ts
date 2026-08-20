import { supabase } from "@/lib/supabase";

import {
  DELIVERY_STATUSES,
  type AdminDeliveryStatus,
} from "@/services/adminOrders";

export interface UpdatedDeliveryStatus {
  id: number;
  delivery_status: AdminDeliveryStatus;
}

function isValidDeliveryStatus(
  status: string
): status is AdminDeliveryStatus {
  return DELIVERY_STATUSES.includes(
    status as AdminDeliveryStatus
  );
}

interface UpdateDeliveryStatusResponse {
  ok: boolean;
  data?: {
    id: number;
    delivery_status: AdminDeliveryStatus;
  };
  error?: string;
}

export async function updateDeliveryStatus(
  id: number,
  deliveryStatus: string
): Promise<UpdatedDeliveryStatus> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El identificador del pedido no es válido."
    );
  }

  if (!isValidDeliveryStatus(deliveryStatus)) {
    throw new Error(
      "El estado logístico seleccionado no es válido."
    );
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (
    sessionError ||
    !session?.access_token
  ) {
    console.error(
      "No existe una sesión administrativa válida:",
      sessionError
    );

    throw new Error(
      "La sesión administrativa no es válida. Inicia sesión nuevamente."
    );
  }

  const response = await fetch(
    "/api/admin/orders",
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
        Authorization:
          `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        id,
        delivery_status:
          deliveryStatus,
      }),
    }
  );

  let result:
    | UpdateDeliveryStatusResponse
    | null = null;

  try {
    result =
      (await response.json()) as
        UpdateDeliveryStatusResponse;
  } catch {
    result = null;
  }

  if (
    !response.ok ||
    !result?.ok ||
    !result.data
  ) {
    const message =
      result?.error ??
      "No fue posible actualizar el estado logístico del pedido.";

    console.error(
      "Error actualizando estado logístico mediante API:",
      {
        status: response.status,
        message,
      }
    );

    throw new Error(message);
  }

  return {
    id: Number(result.data.id),
    delivery_status:
      result.data.delivery_status,
  };
}