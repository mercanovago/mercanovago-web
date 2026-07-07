"use client";

import { useEffect, useState } from "react";
import { createProduct } from "@/services/createProduct";
import { updateProduct } from "@/services/updateProduct";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  old_price: number;
  unit: string;
  approx: string;
  image: string;
  description: string;
  stock: boolean;
  featured: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  product?: Product | null;
}

export default function ProductModal({
  open,
  onClose,
  onCreated,
  product,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    old_price: "",
    unit: "",
    approx: "",
    image: "",
    description: "",
    stock: true,
    featured: false,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? "",
        category: product.category ?? "",
        price: String(product.price ?? ""),
        old_price: String(product.old_price ?? ""),
        unit: product.unit ?? "",
        approx: product.approx ?? "",
        image: product.image ?? "",
        description: product.description ?? "",
        stock: product.stock ?? true,
        featured: product.featured ?? false,
      });
    } else {
      setForm({
        name: "",
        category: "",
        price: "",
        old_price: "",
        unit: "",
        approx: "",
        image: "",
        description: "",
        stock: true,
        featured: false,
      });
    }
  }, [product, open]);

  if (!open) return null;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.category || !form.price || !form.unit || !form.image) {
      alert("Completa nombre, categoría, precio, unidad e imagen.");
      return;
    }

    try {
      setLoading(true);

      if (product) {
        await updateProduct({
          id: product.id,
          name: form.name,
          category: form.category,
          price: Number(form.price),
          old_price: Number(form.old_price || form.price),
          unit: form.unit,
          approx: form.approx,
          image: form.image,
          description: form.description,
          stock: form.stock,
          featured: form.featured,
        });
      } else {
        await createProduct({
          name: form.name,
          category: form.category,
          price: Number(form.price),
          old_price: Number(form.old_price || form.price),
          unit: form.unit,
          approx: form.approx,
          image: form.image,
          description: form.description,
          stock: form.stock,
          featured: form.featured,
        });
      }

      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      alert(product ? "No se pudo actualizar el producto." : "No se pudo crear el producto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-green-600">
              MercaNova GO
            </p>
            <h2 className="text-3xl font-black">
              {product ? "Editar producto" : "Nuevo producto"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-3xl font-bold text-zinc-400 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="grid gap-5 p-8 md:grid-cols-2">
          <input name="name" value={form.name} onChange={handleChange} className="rounded-xl border p-4" placeholder="Nombre" />
          <input name="category" value={form.category} onChange={handleChange} className="rounded-xl border p-4" placeholder="Categoría" />
          <input name="price" value={form.price} onChange={handleChange} className="rounded-xl border p-4" placeholder="Precio" type="number" step="0.01" />
          <input name="old_price" value={form.old_price} onChange={handleChange} className="rounded-xl border p-4" placeholder="Precio anterior" type="number" step="0.01" />
          <input name="unit" value={form.unit} onChange={handleChange} className="rounded-xl border p-4" placeholder="Unidad" />
          <input name="approx" value={form.approx} onChange={handleChange} className="rounded-xl border p-4" placeholder="Cantidad aproximada" />
          <input name="image" value={form.image} onChange={handleChange} className="rounded-xl border p-4 md:col-span-2" placeholder="URL Imagen" />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="rounded-xl border p-4 md:col-span-2"
            placeholder="Descripción"
          />

          <label className="flex items-center gap-3 font-bold">
            <input
              type="checkbox"
              checked={form.stock}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, stock: e.target.checked }))
              }
            />
            Disponible
          </label>

          <label className="flex items-center gap-3 font-bold">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, featured: e.target.checked }))
              }
            />
            Destacado
          </label>
        </div>

        <div className="flex justify-end gap-4 border-t p-6">
          <button
            onClick={onClose}
            className="rounded-xl border px-6 py-3 font-bold"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-green-600 px-8 py-3 font-black text-white hover:bg-green-700 disabled:bg-zinc-300"
          >
            {loading
              ? "Guardando..."
              : product
              ? "Actualizar producto"
              : "Guardar producto"}
          </button>
        </div>
      </div>
    </div>
  );
}