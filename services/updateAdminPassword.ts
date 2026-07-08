import { supabase } from "@/lib/supabase";

export async function updateAdminPassword(
  adminId: number,
  currentPassword: string,
  newPassword: string
) {
  const { data: admin, error: findError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", adminId)
    .eq("password", currentPassword)
    .eq("active", true)
    .single();

  if (findError || !admin) {
    throw new Error("La contraseña actual no es correcta.");
  }

  const { error: updateError } = await supabase
    .from("admin_users")
    .update({
      password: newPassword,
    })
    .eq("id", adminId);

  if (updateError) {
    throw updateError;
  }

  return true;
}