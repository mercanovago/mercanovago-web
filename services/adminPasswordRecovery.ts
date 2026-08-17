import { supabase } from "@/lib/supabase";

const OFFICIAL_ADMIN_EMAIL = "mercanovago@gmail.com";
const MINIMUM_PASSWORD_LENGTH = 10;

const RECOVERY_SESSION_KEY =
  "mercanovago_admin_password_recovery";

export interface RequestPasswordRecoveryData {
  email: string;
}

export interface ResetRecoveredPasswordData {
  newPassword: string;
}

export interface RecoveryPasswordStrength {
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

export interface RecoveryUrlError {
  hasError: boolean;
  code: string | null;
  message: string | null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getRecoveryRedirectUrl(): string {
  if (typeof window === "undefined") {
    throw new Error(
      "La recuperación de contraseña debe iniciarse desde el navegador."
    );
  }

  return `${window.location.origin}/admin/restablecer-contrasena`;
}

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

export function evaluateRecoveryPasswordStrength(
  password: string
): RecoveryPasswordStrength {
  const requirements = {
    minimumLength:
      password.length >= MINIMUM_PASSWORD_LENGTH,
    uppercase: /[A-ZÁÉÍÓÚÑ]/.test(password),
    lowercase: /[a-záéíóúñ]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;

  return {
    valid: score === 5,
    score,
    requirements,
  };
}

export function getRecoveryUrlError(): RecoveryUrlError {
  if (typeof window === "undefined") {
    return {
      hasError: false,
      code: null,
      message: null,
    };
  }

  const searchParams = new URLSearchParams(
    window.location.search
  );

  const hashParams = new URLSearchParams(
    window.location.hash.replace(/^#/, "")
  );

  const error =
    searchParams.get("error") ??
    hashParams.get("error");

  const errorCode =
    searchParams.get("error_code") ??
    hashParams.get("error_code");

  const errorDescription =
    searchParams.get("error_description") ??
    hashParams.get("error_description");

  if (!error && !errorCode && !errorDescription) {
    return {
      hasError: false,
      code: null,
      message: null,
    };
  }

  const normalizedCode = (
    errorCode ??
    error ??
    "recovery_error"
  ).toLowerCase();

  let message =
    "El enlace de recuperación no es válido o ya no puede utilizarse.";

  if (
    normalizedCode.includes("expired") ||
    normalizedCode.includes("otp_expired")
  ) {
    message =
      "El enlace de recuperación expiró. Solicita un enlace nuevo.";
  } else if (
    normalizedCode.includes("access_denied") ||
    error?.toLowerCase() === "access_denied"
  ) {
    message =
      "Supabase rechazó el acceso mediante este enlace de recuperación.";
  } else if (errorDescription) {
    try {
      message = decodeURIComponent(
        errorDescription.replace(/\+/g, " ")
      );
    } catch {
      message = errorDescription;
    }
  }

  return {
    hasError: true,
    code: normalizedCode,
    message,
  };
}

export function markPasswordRecoverySession(
  userId: string
): void {
  const storage = getSessionStorage();

  if (!storage || !userId) {
    return;
  }

  storage.setItem(
    RECOVERY_SESSION_KEY,
    JSON.stringify({
      userId,
      verifiedAt: Date.now(),
    })
  );
}

export function clearPasswordRecoverySession(): void {
  const storage = getSessionStorage();

  storage?.removeItem(RECOVERY_SESSION_KEY);
}

export function hasVerifiedPasswordRecoverySession(
  userId?: string
): boolean {
  const storage = getSessionStorage();

  if (!storage) {
    return false;
  }

  const rawValue = storage.getItem(
    RECOVERY_SESSION_KEY
  );

  if (!rawValue) {
    return false;
  }

  try {
    const parsed = JSON.parse(rawValue) as {
      userId?: string;
      verifiedAt?: number;
    };

    if (
      !parsed.userId ||
      typeof parsed.verifiedAt !== "number"
    ) {
      clearPasswordRecoverySession();
      return false;
    }

    /*
     * La autorización local de recuperación solo se mantiene
     * durante 15 minutos dentro de esta pestaña.
     */
    const maximumAge = 15 * 60 * 1000;
    const isExpired =
      Date.now() - parsed.verifiedAt > maximumAge;

    if (isExpired) {
      clearPasswordRecoverySession();
      return false;
    }

    if (userId && parsed.userId !== userId) {
      clearPasswordRecoverySession();
      return false;
    }

    return true;
  } catch {
    clearPasswordRecoverySession();
    return false;
  }
}

export async function requestAdminPasswordRecovery({
  email,
}: RequestPasswordRecoveryData): Promise<void> {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) {
    throw new Error(
      "Ingresa el correo electrónico administrativo."
    );
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(cleanEmail)) {
    throw new Error(
      "Ingresa un correo electrónico válido."
    );
  }

  if (cleanEmail !== OFFICIAL_ADMIN_EMAIL) {
    throw new Error(
      "El correo ingresado no corresponde a la cuenta administrativa oficial."
    );
  }

  clearPasswordRecoverySession();

  const redirectTo =
    getRecoveryRedirectUrl();

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      cleanEmail,
      {
        redirectTo,
      }
    );

  if (error) {
    console.error(
      "Error solicitando recuperación de contraseña:",
      error
    );

    const normalizedMessage =
      error.message.toLowerCase();

    if (
      normalizedMessage.includes("rate") ||
      normalizedMessage.includes("limit")
    ) {
      throw new Error(
        "Se realizaron varias solicitudes consecutivas. Espera unos minutos antes de intentarlo nuevamente."
      );
    }

    throw new Error(
      "No fue posible enviar el enlace de recuperación. Verifica la configuración de Supabase e inténtalo nuevamente."
    );
  }
}

export async function invalidateRejectedRecovery(): Promise<void> {
  clearPasswordRecoverySession();

  /*
   * Cerramos únicamente la sesión local de esta pestaña.
   * Esto evita que una sesión administrativa anterior pueda
   * reutilizarse dentro de una URL de recuperación rechazada.
   */
  const { error } = await supabase.auth.signOut({
    scope: "local",
  });

  if (error) {
    console.warn(
      "No fue posible limpiar la sesión local del enlace rechazado:",
      error
    );
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem(
      "mercanova_admin"
    );
  }
}

export async function resetRecoveredAdminPassword({
  newPassword,
}: ResetRecoveredPasswordData): Promise<void> {
  const urlError = getRecoveryUrlError();

  if (urlError.hasError) {
    clearPasswordRecoverySession();

    throw new Error(
      urlError.message ??
        "El enlace de recuperación no es válido."
    );
  }

  const strength =
    evaluateRecoveryPasswordStrength(
      newPassword
    );

  if (!strength.valid) {
    throw new Error(
      "La contraseña debe tener al menos 10 caracteres e incluir mayúscula, minúscula, número y símbolo."
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "No existe una sesión válida de recuperación:",
      userError
    );

    clearPasswordRecoverySession();

    throw new Error(
      "El enlace de recuperación no es válido o ya expiró. Solicita uno nuevo."
    );
  }

  if (
    !hasVerifiedPasswordRecoverySession(
      user.id
    )
  ) {
    throw new Error(
      "No se detectó una autorización válida de recuperación. Solicita un enlace nuevo."
    );
  }

  if (
    normalizeEmail(user.email ?? "") !==
    OFFICIAL_ADMIN_EMAIL
  ) {
    clearPasswordRecoverySession();

    await supabase.auth.signOut({
      scope: "local",
    });

    throw new Error(
      "La sesión de recuperación no corresponde a la cuenta administrativa oficial."
    );
  }

  const { data, error } =
    await supabase.auth.updateUser({
      password: newPassword,
    });

  if (error || !data.user) {
    console.error(
      "Error restableciendo la contraseña:",
      error
    );

    throw new Error(
      error?.message ||
        "No fue posible establecer la nueva contraseña."
    );
  }

  const passwordChangedAt =
    new Date().toISOString();

  const { error: profileError } =
    await supabase
      .from("admin_profiles")
      .update({
        password_changed_at:
          passwordChangedAt,
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq("user_id", data.user.id);

  if (profileError) {
    console.warn(
      "La contraseña se actualizó, pero no fue posible registrar la fecha del cambio:",
      profileError
    );
  }

  clearPasswordRecoverySession();

  const { error: signOutError } =
    await supabase.auth.signOut({
      scope: "global",
    });

  if (typeof window !== "undefined") {
    localStorage.removeItem(
      "mercanova_admin"
    );
  }

  if (signOutError) {
    console.error(
      "Error cerrando las sesiones después de la recuperación:",
      signOutError
    );
  }
}