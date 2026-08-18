import "server-only";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Falta NEXT_PUBLIC_SUPABASE_URL en las variables de entorno."
  );
}

if (!supabaseSecretKey) {
  throw new Error(
    "Falta SUPABASE_SECRET_KEY en las variables de entorno."
  );
}

/**
 * Cliente privilegiado de Supabase para operaciones EXCLUSIVAS del servidor.
 *
 * IMPORTANTE:
 * - Nunca importar este archivo desde componentes con "use client".
 * - Nunca exponer SUPABASE_SECRET_KEY al navegador.
 * - Este cliente puede realizar operaciones privilegiadas.
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);