import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ADMIN_ROLES = new Set([
  "super_admin",
  "admin",
  "order_manager",
  "support",
]);

function getBearerToken(
  request: NextRequest
): string | null {
  const authorization =
    request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, token] =
    authorization.split(" ");

  if (
    scheme?.toLowerCase() !== "bearer" ||
    !token?.trim()
  ) {
    return null;
  }

  return token.trim();
}

export async function GET(
  request: NextRequest
) {
  try {
    const accessToken =
      getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          ok: false,
          error: "No autorizado.",
        },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        accessToken
      );

    if (userError || !user) {
      console.warn(
        "Intento de acceso a pedidos con sesión inválida:",
        userError?.message ??
          "Usuario no encontrado."
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Sesión administrativa inválida.",
        },
        { status: 401 }
      );
    }

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("admin_profiles")
      .select(`
        user_id,
        role,
        active,
        locked_until
      `)
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Error verificando autorización administrativa:",
        profileError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "No fue posible verificar la autorización administrativa.",
        },
        { status: 500 }
      );
    }

    if (
      !profile ||
      profile.active !== true
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Usuario sin autorización administrativa.",
        },
        { status: 403 }
      );
    }

    if (
      profile.locked_until &&
      new Date(
        profile.locked_until
      ).getTime() > Date.now()
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La cuenta administrativa se encuentra bloqueada.",
        },
        { status: 403 }
      );
    }

    if (
      !ALLOWED_ADMIN_ROLES.has(
        profile.role
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El rol administrativo no tiene acceso a pedidos.",
        },
        { status: 403 }
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("orders")
        .select(`
          id,
          subtotal,
          delivery,
          total,
          payment_method,
          status,
          created_at,
          delivery_type,
          delivery_date,
          delivery_time,
          delivery_window,
          estimated_delivery,
          delivery_notes,
          delivery_status,
          customers (
            first_name,
            last_name,
            phone,
            email,
            address
          ),
          order_items (
            id,
            quantity,
            unit_price,
            subtotal,
            products (
              id,
              name,
              image,
              unit
            )
          )
        `)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "Error cargando pedidos administrativos:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "No fue posible cargar los pedidos de MercaNova GO.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: data ?? [],
    });
  } catch (error) {
    console.error(
      "Error inesperado en API administrativa de pedidos:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}