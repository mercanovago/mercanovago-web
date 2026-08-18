import { getAdminSession } from "@/services/adminLogin";

type AdminOrder = {
  id: string | number;
  total: number | string | null;
  status: string | null;
  created_at: string | null;
};

export type AdminCustomer = {
  id: string | number;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string | null;
  orders: AdminOrder[];
};

type AdminCustomersResponse = {
  ok: boolean;
  data?: AdminCustomer[];
  error?: string;
};

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  try {
    const session = await getAdminSession();

    if (!session?.accessToken) {
      console.error(
        "No existe una sesión administrativa válida para cargar clientes."
      );

      return [];
    }

    const response = await fetch("/api/admin/customers", {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(
        "Error cargando clientes:",
        `HTTP ${response.status} ${response.statusText}`
      );

      return [];
    }

    const result = (await response.json()) as AdminCustomersResponse;

    if (!result.ok) {
      console.error(
        "Error cargando clientes:",
        result.error ?? "Error desconocido"
      );

      return [];
    }

    return result.data ?? [];
  } catch (error) {
    console.error("Error inesperado cargando clientes:", error);
    return [];
  }
}