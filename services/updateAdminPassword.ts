import { supabase } from "@/lib/supabase";

export interface UpdateAdminPasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordStrengthResult {
  valid: boolean;
  score: number;
  requirements: {
    minimumLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
  };
}

const MINIMUM_PASSWORD_LENGTH = 10;

export function evaluatePasswordStrength(
  password: string
): PasswordStrengthResult {
  const requirements = {
    minimumLength:
      password.length >= MINIMUM_PASSWORD_LENGTH,
    uppercase: /[A-ZÁÉÍÓÚÑ]/.test(password),
    lowercase: /[a-záéíóúñ]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(
      password
    ),
  };

  const score = Object.values(
    requirements
  ).filter(Boolean).length;

  return {
    valid: score === 5,
    score,
    requirements,
  };
}

function validatePasswordChangeData({
  currentPassword,
  newPassword,
}: UpdateAdminPasswordData): void {
  if (!currentPassword) {
    throw new Error(
      "Ingresa la contraseña actual."
    );
  }

  if (!newPassword) {
    throw new Error(
      "Ingresa la nueva contraseña."
    );
  }

  if (currentPassword === newPassword) {
    throw new Error(
      "La nueva contraseña debe ser diferente de la contraseña actual."
    );
  }

  const strength =
    evaluatePasswordStrength(newPassword);

  if (!strength.valid) {
    throw new Error(
      "La nueva contraseña debe tener al menos 10 caracteres e incluir mayúscula, minúscula, número y símbolo."
    );
  }
}

async function clearCompatibilitySession(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("mercanova_admin");
}

async function registerPasswordChange(
  userId: string
): Promise<void> {
  const passwordChangedAt =
    new Date().toISOString();

  const { error } = await supabase
    .from("admin_profiles")
    .update({
      password_changed_at: passwordChangedAt,
      failed_login_attempts: 0,
      locked_until: null,
    })
    .eq("user_id", userId);

  if (error) {
    console.warn(
      "La contraseña se actualizó, pero no fue posible registrar la fecha del cambio:",
      error
    );
  }
}

export async function updateAdminPassword({
  currentPassword,
  newPassword,
}: UpdateAdminPasswordData): Promise<void> {
  validatePasswordChangeData({
    currentPassword,
    newPassword,
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "Error obteniendo el administrador autenticado:",
      userError
    );

    throw new Error(
      "La sesión administrativa no es válida. Vuelve a iniciar sesión."
    );
  }

  const email = user.email
    ?.trim()
    .toLowerCase();

  if (!email) {
    throw new Error(
      "La cuenta administrativa no tiene un correo electrónico válido."
    );
  }

  /*
   * Verificamos la contraseña actual directamente
   * con Supabase Auth. No se consulta ninguna tabla
   * propia ni se almacenan contraseñas en texto.
   *
   * No se utiliza trim() en contraseñas porque los
   * espacios pueden formar parte legítima de ellas.
   */
  const {
    data: verificationData,
    error: verificationError,
  } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (
    verificationError ||
    !verificationData.user ||
    !verificationData.session
  ) {
    console.error(
      "La contraseña actual no pudo verificarse:",
      verificationError
    );

    throw new Error(
      "La contraseña actual no es correcta."
    );
  }

  if (
    verificationData.user.id !== user.id
  ) {
    await supabase.auth.signOut({
      scope: "local",
    });

    await clearCompatibilitySession();

    throw new Error(
      "La identidad de la sesión administrativa no coincide."
    );
  }

  const {
    data: updatedUserData,
    error: updateError,
  } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError || !updatedUserData.user) {
    console.error(
      "Error actualizando la contraseña administrativa:",
      updateError
    );

    throw new Error(
      updateError?.message ||
        "No fue posible actualizar la contraseña."
    );
  }

  await registerPasswordChange(
    updatedUserData.user.id
  );

  /*
   * El cierre global invalida las sesiones abiertas
   * en otros dispositivos. Después del cambio, el
   * administrador deberá ingresar nuevamente.
   */
  const { error: signOutError } =
    await supabase.auth.signOut({
      scope: "global",
    });

  await clearCompatibilitySession();

  if (signOutError) {
    console.error(
      "La contraseña cambió, pero ocurrió un error al cerrar las sesiones:",
      signOutError
    );

    throw new Error(
      "La contraseña fue actualizada, pero no fue posible cerrar todas las sesiones. Cierra el navegador e inicia sesión nuevamente."
    );
  }
}