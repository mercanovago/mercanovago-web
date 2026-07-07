import { supabase } from "@/lib/supabase";

export interface CustomerData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
}

export async function createCustomer(customer: CustomerData) {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creando cliente:", error);
    throw error;
  }

  return data;
}