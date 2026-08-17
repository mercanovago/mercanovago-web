import { supabase } from "@/lib/supabase";

export type AdminRole =
  | "super_admin"
  | "admin"
  | "catalog_manager"
  | "order_manager"
  | "support";

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  lockedUntil: string | null;
}

interface AdminProfileRow {
  user_id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  last_login_at: string | null;
  password_changed_at: string | null;
  locked_until: string | null;
}

interface SecurityAuditInput {
  admin: AdminProfile;
  action: "login" | "logout";
  summary: string;
  durationMs?: number | null;
  metadata?: Record<string, string | number | boolean | null>;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateLoginData(email: string, password: string): void {
  if (!email) {
    throw new Error("Ingresa el correo electrónico administrativo.");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new Error("Ingresa un correo electrónico válido.");
  }

  if (!password) {
    throw new Error("Ingresa la contraseña administrativa.");
  }

  if (password.length < 8) {
    throw new Error("La contraseña debe contener al menos 8 caracteres.");
  }
}

function mapAdminProfile(profile: AdminProfileRow): AdminProfile {
  return {
    id: profile.user_id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    active: profile.active,
    lastLoginAt: profile.last_login_at,
    passwordChangedAt: profile.password_changed_at,
    lockedUntil: profile.locked_until,
  };
}

function isProfileLocked(lockedUntil: string | null): boolean {
  if (!lockedUntil) {
    return false;
  }

  const lockedUntilTime = new Date(lockedUntil).getTime();

  if (!Number.isFinite(lockedUntilTime)) {
    return false;
  }

  return lockedUntilTime > Date.now();
}

function getBrowserMetadata(): Record<string, string | number | boolean | null> {
  if (typeof window === "undefined") {
    return {
      source: "admin_auth_service",
      userAgent: null,
      language: null,
      platform: null,
    };
  }

  return {
    source: "admin_auth_service",
    userAgent: window.navigator.userAgent || null,
    language: window.navigator.language || null,
    platform: window.navigator.platform || null,
  };
}

async function registerSecurityAudit({
  admin,
  action,
  summary,
  durationMs = null,
  metadata = {},
}: SecurityAuditInput): Promise<void> {
  try {
    const normalizedDuration =
      durationMs === null || durationMs === undefined
        ? null
        : Math.max(0, Math.trunc(durationMs));

    const { error } = await supabase.from("audit_logs").insert({
      admin_id: admin.id,
      admin_name: admin.name,
      admin_email: admin.email,
      admin_role: admin.role,
      module: "security",
      entity: "admin_session",
      entity_id: admin.id,
      action,
      status: "success",
      summary,
      old_values: null,
      new_values: null,
      metadata: {
        ...getBrowserMetadata(),
        ...metadata,
      },
      error_message: null,
      duration_ms: normalizedDuration,
    });

    if (error) {
      console.warn(
        "La operación de seguridad se completó, pero no fue posible registrar la auditoría:",
        error
      );
    }
  } catch (error) {
    console.warn("No fue posible registrar la auditoría de seguridad:", error);
  }
}

async function clearLegacyAdminStorage(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("mercanova_admin");
}

export function saveAdminCompatibilitySession(admin: AdminProfile): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    "mercanova_admin",
    JSON.stringify({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      active: admin.active,
      lastLoginAt: admin.lastLoginAt,
      passwordChangedAt: admin.passwordChangedAt,
      lockedUntil: admin.lockedUntil,
    })
  );
}

export function getStoredAdminCompatibilitySession(): AdminProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedAdmin = localStorage.getItem("mercanova_admin");

  if (!storedAdmin) {
    return null;
  }

  try {
    const parsedAdmin = JSON.parse(storedAdmin) as Partial<AdminProfile>;

    if (
      !parsedAdmin.id ||
      !parsedAdmin.name ||
      !parsedAdmin.email ||
      !parsedAdmin.role ||
      parsedAdmin.active !== true
    ) {
      localStorage.removeItem("mercanova_admin");
      return null;
    }

    return {
      id: parsedAdmin.id,
      name: parsedAdmin.name,
      email: parsedAdmin.email,
      role: parsedAdmin.role,
      active: true,
      lastLoginAt: parsedAdmin.lastLoginAt ?? null,
      passwordChangedAt: parsedAdmin.passwordChangedAt ?? null,
      lockedUntil: parsedAdmin.lockedUntil ?? null,
    };
  } catch (error) {
    console.error(
      "Error leyendo la sesión administrativa de compatibilidad:",
      error
    );

    localStorage.removeItem("mercanova_admin");
    return null;
  }
}

async function getAdminProfileByUserId(userId: string): Promise<AdminProfile> {
  const cleanUserId = userId.trim();

  if (!cleanUserId) {
    throw new Error("No fue posible identificar al usuario administrativo.");
  }

  const { data, error } = await supabase
    .from("admin_profiles")
    .select(
      `
        user_id,
        name,
        email,
        role,
        active,
        last_login_at,
        password_changed_at,
        locked_until
      `
    )
    .eq("user_id", cleanUserId)
    .maybeSingle();

  if (error) {
    console.error("Error consultando el perfil administrativo:", error);
    throw new Error("No fue posible validar el perfil administrativo.");
  }

  if (!data) {
    throw new Error(
      "Esta cuenta no tiene autorización para ingresar al panel administrativo."
    );
  }

  const profile = data as AdminProfileRow;

  if (!profile.active) {
    throw new Error("La cuenta administrativa se encuentra desactivada.");
  }

  if (isProfileLocked(profile.locked_until)) {
    const lockedUntilDate = new Date(profile.locked_until as string);

    throw new Error(
      `La cuenta administrativa se encuentra bloqueada temporalmente hasta ${lockedUntilDate.toLocaleString(
        "es-EC"
      )}.`
    );
  }

  return mapAdminProfile(profile);
}

async function registerSuccessfulLogin(userId: string): Promise<string> {
  const loginDate = new Date().toISOString();

  const { error } = await supabase
    .from("admin_profiles")
    .update({
      last_login_at: loginDate,
      failed_login_attempts: 0,
      locked_until: null,
    })
    .eq("user_id", userId);

  if (error) {
    console.warn(
      "La sesión inició correctamente, pero no fue posible registrar la fecha del último acceso:",
      error
    );
  }

  return loginDate;
}

export async function adminLogin({
  email,
  password,
}: AdminLoginData): Promise<AdminProfile> {
  const startedAt = Date.now();
  const cleanEmail = normalizeEmail(email);
  const exactPassword = password;

  validateLoginData(cleanEmail, exactPassword);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: exactPassword,
  });

  if (error || !data.user || !data.session) {
    console.error("Error de autenticación administrativa:", error);
    throw new Error("Correo o contraseña incorrectos.");
  }

  try {
    const profile = await getAdminProfileByUserId(data.user.id);
    const loginDate = await registerSuccessfulLogin(data.user.id);

    const authenticatedAdmin: AdminProfile = {
      ...profile,
      lastLoginAt: loginDate,
    };

    saveAdminCompatibilitySession(authenticatedAdmin);

    await registerSecurityAudit({
      admin: authenticatedAdmin,
      action: "login",
      summary: `El administrador "${authenticatedAdmin.name}" inició sesión.`,
      durationMs: Date.now() - startedAt,
      metadata: {
        operation: "admin_login",
        authenticated: true,
      },
    });

    return authenticatedAdmin;
  } catch (profileError) {
    await supabase.auth.signOut();
    await clearLegacyAdminStorage();
    throw profileError;
  }
}

export async function getCurrentAdmin(): Promise<AdminProfile | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error verificando el usuario autenticado:", error);
    await clearLegacyAdminStorage();
    return null;
  }

  if (!user) {
    await clearLegacyAdminStorage();
    return null;
  }

  try {
    const admin = await getAdminProfileByUserId(user.id);
    saveAdminCompatibilitySession(admin);
    return admin;
  } catch (profileError) {
    console.error("Error recuperando la sesión administrativa:", profileError);
    await supabase.auth.signOut();
    await clearLegacyAdminStorage();
    return null;
  }
}

export async function getAdminSession(): Promise<{
  admin: AdminProfile;
  accessToken: string;
} | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error recuperando la sesión de Supabase:", error);
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const admin = await getCurrentAdmin();

  if (!admin) {
    return null;
  }

  return {
    admin,
    accessToken: session.access_token,
  };
}

export async function hasAdminSession(): Promise<boolean> {
  const admin = await getCurrentAdmin();

  return Boolean(
    admin && admin.active && !isProfileLocked(admin.lockedUntil)
  );
}

export async function adminLogout(): Promise<void> {
  const startedAt = Date.now();

  const storedAdmin = getStoredAdminCompatibilitySession();
  let currentAdmin = storedAdmin;

  if (!currentAdmin) {
    currentAdmin = await getCurrentAdmin();
  }

  if (currentAdmin) {
    const sessionStartTime = currentAdmin.lastLoginAt
      ? new Date(currentAdmin.lastLoginAt).getTime()
      : Number.NaN;

    const sessionDurationMs = Number.isFinite(sessionStartTime)
      ? Math.max(0, Date.now() - sessionStartTime)
      : null;

    await registerSecurityAudit({
      admin: currentAdmin,
      action: "logout",
      summary: `El administrador "${currentAdmin.name}" cerró sesión.`,
      durationMs: Date.now() - startedAt,
      metadata: {
        operation: "admin_logout",
        sessionDurationMs,
      },
    });
  }

  const { error } = await supabase.auth.signOut();

  await clearLegacyAdminStorage();

  if (error) {
    console.error("Error cerrando la sesión administrativa:", error);
    throw new Error("No fue posible cerrar la sesión correctamente.");
  }
}

export async function refreshAdminSession(): Promise<AdminProfile | null> {
  const { data, error } = await supabase.auth.refreshSession();

  if (error || !data.session) {
    console.error("Error renovando la sesión administrativa:", error);
    await clearLegacyAdminStorage();
    return null;
  }

  return getCurrentAdmin();
}

export function subscribeToAdminAuthChanges(
  callback: (admin: AdminProfile | null) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event) => {
    if (event === "SIGNED_OUT") {
      await clearLegacyAdminStorage();
      callback(null);
      return;
    }

    if (
      event === "SIGNED_IN" ||
      event === "TOKEN_REFRESHED" ||
      event === "USER_UPDATED" ||
      event === "INITIAL_SESSION"
    ) {
      const admin = await getCurrentAdmin();
      callback(admin);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}