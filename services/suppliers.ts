import { supabase } from "@/lib/supabase";

import type {
  Supplier,
} from "@/types/catalogMaster";

export interface SupplierInput {
  name: string;
  legal_name?: string | null;
  tax_id?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  contact_name?: string | null;
  notes?: string | null;
  active?: boolean;
  preferred?: boolean;
}

export interface UpdateSupplierInput
  extends SupplierInput {
  id: number;
}

function normalizeRequiredText(
  value: string,
  fieldName: string
): string {
  const normalizedValue = value
    .trim()
    .replace(/\s+/g, " ");

  if (!normalizedValue) {
    throw new Error(
      `El campo ${fieldName} es obligatorio.`
    );
  }

  return normalizedValue;
}

function normalizeOptionalText(
  value: string | null | undefined
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value
    .trim()
    .replace(/\s+/g, " ");

  return normalizedValue || null;
}

function normalizeEmail(
  value: string | null | undefined
): string | null {
  const email =
    normalizeOptionalText(value);

  if (!email) {
    return null;
  }

  const normalizedEmail =
    email.toLowerCase();

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    throw new Error(
      "Ingresa un correo electrónico válido."
    );
  }

  return normalizedEmail;
}

async function validateDuplicatedSupplier(
  name: string,
  taxId: string | null,
  excludedId?: number
): Promise<void> {
  let nameQuery = supabase
    .from("suppliers")
    .select("id,name")
    .ilike("name", name)
    .limit(1);

  if (excludedId) {
    nameQuery = nameQuery.neq(
      "id",
      excludedId
    );
  }

  const {
    data: nameData,
    error: nameError,
  } = await nameQuery;

  if (nameError) {
    console.error(
      "Error comprobando proveedores duplicados:",
      nameError
    );

    throw new Error(
      "No fue posible comprobar si el proveedor ya existe."
    );
  }

  if ((nameData ?? []).length > 0) {
    throw new Error(
      `Ya existe otro proveedor registrado con el nombre "${name}".`
    );
  }

  if (!taxId) {
    return;
  }

  let taxQuery = supabase
    .from("suppliers")
    .select("id,tax_id")
    .eq("tax_id", taxId)
    .limit(1);

  if (excludedId) {
    taxQuery = taxQuery.neq(
      "id",
      excludedId
    );
  }

  const {
    data: taxData,
    error: taxError,
  } = await taxQuery;

  if (taxError) {
    console.error(
      "Error comprobando la identificación tributaria:",
      taxError
    );

    throw new Error(
      "No fue posible comprobar la identificación tributaria."
    );
  }

  if ((taxData ?? []).length > 0) {
    throw new Error(
      "Ya existe otro proveedor con la misma identificación tributaria."
    );
  }
}

function buildSupplierPayload(
  input: SupplierInput
) {
  return {
    name: normalizeRequiredText(
      input.name,
      "nombre"
    ),
    legal_name:
      normalizeOptionalText(
        input.legal_name
      ),
    tax_id:
      normalizeOptionalText(
        input.tax_id
      ),
    phone:
      normalizeOptionalText(
        input.phone
      ),
    email:
      normalizeEmail(input.email),
    address:
      normalizeOptionalText(
        input.address
      ),
    city:
      normalizeOptionalText(
        input.city
      ) ?? "Riobamba",
    province:
      normalizeOptionalText(
        input.province
      ) ?? "Chimborazo",
    country:
      normalizeOptionalText(
        input.country
      ) ?? "Ecuador",
    contact_name:
      normalizeOptionalText(
        input.contact_name
      ),
    notes:
      normalizeOptionalText(
        input.notes
      ),
    active:
      input.active ?? true,
    preferred:
      input.preferred ?? false,
  };
}

export async function getSuppliers(
  includeInactive = true
): Promise<Supplier[]> {
  let query = supabase
    .from("suppliers")
    .select("*")
    .order("preferred", {
      ascending: false,
    })
    .order("name", {
      ascending: true,
    });

  if (!includeInactive) {
    query = query.eq(
      "active",
      true
    );
  }

  const { data, error } =
    await query;

  if (error) {
    console.error(
      "Error cargando proveedores:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible cargar los proveedores."
    );
  }

  return (
    data ?? []
  ) as Supplier[];
}

export async function createSupplier(
  input: SupplierInput
): Promise<Supplier> {
  const payload =
    buildSupplierPayload(input);

  await validateDuplicatedSupplier(
    payload.name,
    payload.tax_id
  );

  const { data, error } =
    await supabase
      .from("suppliers")
      .insert(payload)
      .select("*")
      .single();

  if (error) {
    console.error(
      "Error creando proveedor:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible crear el proveedor."
    );
  }

  return data as Supplier;
}

export async function updateSupplier(
  input: UpdateSupplierInput
): Promise<Supplier> {
  const id = Number(input.id);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "El identificador del proveedor no es válido."
    );
  }

  const payload =
    buildSupplierPayload(input);

  await validateDuplicatedSupplier(
    payload.name,
    payload.tax_id,
    id
  );

  const { data, error } =
    await supabase
      .from("suppliers")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

  if (error) {
    console.error(
      "Error actualizando proveedor:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible actualizar el proveedor."
    );
  }

  return data as Supplier;
}

export async function deleteSupplier(
  id: number
): Promise<boolean> {
  const supplierId = Number(id);

  if (
    !Number.isInteger(supplierId) ||
    supplierId <= 0
  ) {
    throw new Error(
      "El identificador del proveedor no es válido."
    );
  }

  const {
    count,
    error: relationError,
  } = await supabase
    .from("product_suppliers")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      }
    )
    .eq(
      "supplier_id",
      supplierId
    );

  if (relationError) {
    console.error(
      "Error comprobando relaciones del proveedor:",
      relationError
    );

    throw new Error(
      "No fue posible comprobar si el proveedor está relacionado con productos."
    );
  }

  if ((count ?? 0) > 0) {
    throw new Error(
      "El proveedor no puede eliminarse porque tiene productos relacionados. Desactívalo en su lugar."
    );
  }

  const { error } =
    await supabase
      .from("suppliers")
      .delete()
      .eq("id", supplierId);

  if (error) {
    console.error(
      "Error eliminando proveedor:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible eliminar el proveedor."
    );
  }

  return true;
}