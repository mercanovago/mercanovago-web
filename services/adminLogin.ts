import { supabase } from "@/lib/supabase";

export interface AdminLoginData {
  email: string;
  password: string;
}

export async function adminLogin({ email, password }: AdminLoginData) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", cleanEmail)
    .eq("contraseña", cleanPassword)
    .eq("activo", true)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Usuario o contraseña incorrectos.");
  }

  return {
    id: data["identificación"],
    name: data["nombre"],
    email: data["email"],
    role: data["role"],
    active: data["activo"],
  };
}