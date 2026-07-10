import { supabase } from "@/lib/supabase";

export interface DetectedMarketProduct {
  name: string;
  marketPrice: number;
}

export interface MarketPriceResult {
  id: number | null;
  name: string;
  category: string;
  marketPrice: number;
  currentPrice: number;
  marginPercentage: number;
  marginValue: number;
  suggestedPrice: number;
  status: "Actualizar" | "Sin cambios" | "No encontrado";
}

export function calculateFinalPrice(
  marketPrice: number,
  marginPercentage: number
) {
  const marginValue = marketPrice * (marginPercentage / 100);
  const finalPrice = marketPrice + marginValue;

  return {
    marginValue: Number(marginValue.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2)),
  };
}

export async function simulateMarketImageReading(): Promise<
  DetectedMarketProduct[]
> {
  return [
    { name: "Tomate Riñón", marketPrice: 0.48 },
    { name: "Papa Chola", marketPrice: 0.36 },
    { name: "Cebolla Colorada", marketPrice: 0.42 },
    { name: "Aguacate", marketPrice: 0.82 },
    { name: "Queso Fresco", marketPrice: 2.25 },
  ];
}

export async function compareMarketPrices() {
  const detectedProducts = await simulateMarketImageReading();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id,name,category,price,precio_mercado,margen_porcentaje");

  if (productsError) {
    console.error(productsError);
    throw productsError;
  }

  const { data: margins, error: marginsError } = await supabase
    .from("margin_rules")
    .select("category,margin_percentage,active")
    .eq("active", true);

  if (marginsError) {
    console.error(marginsError);
    throw marginsError;
  }

  const results: MarketPriceResult[] = detectedProducts.map((detected) => {
    const product = products?.find(
      (item) =>
        item.name?.toLowerCase().trim() === detected.name.toLowerCase().trim()
    );

    if (!product) {
      return {
        id: null,
        name: detected.name,
        category: "Sin categoría",
        marketPrice: detected.marketPrice,
        currentPrice: 0,
        marginPercentage: 0,
        marginValue: 0,
        suggestedPrice: detected.marketPrice,
        status: "No encontrado",
      };
    }

    const marginRule = margins?.find(
      (rule) =>
        rule.category?.toLowerCase().trim() ===
        product.category?.toLowerCase().trim()
    );

    const marginPercentage = Number(
      marginRule?.margin_percentage ?? product.margen_porcentaje ?? 25
    );

    const calculated = calculateFinalPrice(
      detected.marketPrice,
      marginPercentage
    );

    const currentPrice = Number(product.price ?? 0);

    return {
      id: product.id,
      name: product.name,
      category: product.category,
      marketPrice: detected.marketPrice,
      currentPrice,
      marginPercentage,
      marginValue: calculated.marginValue,
      suggestedPrice: calculated.finalPrice,
      status:
        Number(currentPrice.toFixed(2)) ===
        Number(calculated.finalPrice.toFixed(2))
          ? "Sin cambios"
          : "Actualizar",
    };
  });

  return results;
}

export async function confirmMarketPriceUpdates(results: MarketPriceResult[]) {
  const validUpdates = results.filter(
    (item) => item.id !== null && item.status === "Actualizar"
  );

  if (validUpdates.length === 0) {
    return {
      updated: 0,
      message: "No existen productos pendientes de actualización.",
    };
  }

  for (const item of validUpdates) {
    const { error } = await supabase
      .from("products")
      .update({
        precio_mercado: item.marketPrice,
        margen_porcentaje: item.marginPercentage,
        margen_valor: item.marginValue,
        precio_final: item.suggestedPrice,
        price: item.suggestedPrice,
        old_price: item.currentPrice,
        fecha_actualizacion_precio: new Date().toISOString().split("T")[0],
      })
      .eq("id", item.id);

    if (error) {
      console.error(error);
      throw error;
    }
  }

  return {
    updated: validUpdates.length,
    message: `${validUpdates.length} producto(s) actualizado(s) correctamente.`,
  };
}