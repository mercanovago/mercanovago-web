"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminGuard from "@/components/admin/AdminGuard";
import { getAdminProducts } from "@/services/getAdminProducts";
import {
  getProductIntelligenceRecords,
  saveProductIntelligence,
} from "@/services/productIntelligence";

import type { AdminProductRecord } from "@/types/adminProduct";
import type {
  ProductIntelligencePayload,
  ProductIntelligenceRecord,
  ProductIntelligenceStatus,
} from "@/types/productIntelligence";

type IntelligenceTab =
  | "commercial"
  | "nutrition"
  | "storage"
  | "chef"
  | "ai"
  | "seo";

interface FormState {
  product_id: number | "";
  commercial_description: string;
  long_description: string;
  benefits: string;
  characteristics: string;
  nutrition_json: string;
  storage_instructions: string;
  storage_temperature: string;
  shelf_life: string;
  washing_instructions: string;
  consumption_instructions: string;
  chef_notes: string;
  recipe_tips: string;
  suggested_uses: string;
  synonyms: string;
  search_keywords: string;
  related_product_ids: string;
  substitute_product_ids: string;
  complementary_product_ids: string;
  seasonality: string;
  commercial_priority: number;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  content_status: ProductIntelligenceStatus;
}

const EMPTY_FORM: FormState = {
  product_id: "",
  commercial_description: "",
  long_description: "",
  benefits: "",
  characteristics: "",
  nutrition_json: "{}",
  storage_instructions: "",
  storage_temperature: "",
  shelf_life: "",
  washing_instructions: "",
  consumption_instructions: "",
  chef_notes: "",
  recipe_tips: "",
  suggested_uses: "",
  synonyms: "",
  search_keywords: "",
  related_product_ids: "",
  substitute_product_ids: "",
  complementary_product_ids: "",
  seasonality: "",
  commercial_priority: 0,
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  content_status: "draft",
};

const TABS: Array<{ key: IntelligenceTab; label: string }> = [
  { key: "commercial", label: "Comercial" },
  { key: "nutrition", label: "Nutrición" },
  { key: "storage", label: "Conservación" },
  { key: "chef", label: "Chef" },
  { key: "ai", label: "IA" },
  { key: "seo", label: "SEO" },
];

export default function ProductIntelligencePage() {
  const [products, setProducts] = useState<AdminProductRecord[]>([]);
  const [records, setRecords] = useState<ProductIntelligenceRecord[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState<IntelligenceTab>("commercial");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ProductIntelligenceStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [productsData, intelligenceData] = await Promise.all([
        getAdminProducts(),
        getProductIntelligenceRecords(),
      ]);

      setProducts(productsData);
      setRecords(intelligenceData);
    } catch (error) {
      console.error("Error cargando Inteligencia IA:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar el módulo."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return products.filter((product) => {
      const record = records.find((item) => item.product_id === product.id);

      if (
        statusFilter !== "all" &&
        (record?.content_status ?? "draft") !== statusFilter
      ) {
        return false;
      }

      if (!normalized) return true;

      return [
        product.name,
        product.category,
        product.slug,
        ...(record?.synonyms ?? []),
        ...(record?.search_keywords ?? []),
      ].some((value) =>
        String(value).toLowerCase().includes(normalized)
      );
    });
  }, [products, records, search, statusFilter]);

  const completedRecords = records.filter(
    (record) =>
      record.commercial_description ||
      record.long_description ||
      record.synonyms.length > 0 ||
      Object.keys(record.nutrition_json).length > 0
  ).length;

  const publishedRecords = records.filter(
    (record) => record.content_status === "published"
  ).length;

  const selectedProduct =
    form.product_id === ""
      ? null
      : products.find(
          (product) => product.id === Number(form.product_id)
        ) ?? null;

  function selectProduct(productId: number) {
    const record = records.find((item) => item.product_id === productId);

    if (!record) {
      setForm({ ...EMPTY_FORM, product_id: productId });
      setActiveTab("commercial");
      setErrorMessage("");
      setSuccessMessage("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setForm({
      product_id: productId,
      commercial_description: record.commercial_description ?? "",
      long_description: record.long_description ?? "",
      benefits: record.benefits.join("\n"),
      characteristics: record.characteristics.join("\n"),
      nutrition_json: JSON.stringify(record.nutrition_json, null, 2),
      storage_instructions: record.storage_instructions ?? "",
      storage_temperature: record.storage_temperature ?? "",
      shelf_life: record.shelf_life ?? "",
      washing_instructions: record.washing_instructions ?? "",
      consumption_instructions: record.consumption_instructions ?? "",
      chef_notes: record.chef_notes ?? "",
      recipe_tips: record.recipe_tips.join("\n"),
      suggested_uses: record.suggested_uses.join("\n"),
      synonyms: record.synonyms.join(", "),
      search_keywords: record.search_keywords.join(", "),
      related_product_ids: record.related_product_ids.join(", "),
      substitute_product_ids: record.substitute_product_ids.join(", "),
      complementary_product_ids:
        record.complementary_product_ids.join(", "),
      seasonality: record.seasonality ?? "",
      commercial_priority: record.commercial_priority,
      seo_title: record.seo_title ?? "",
      seo_description: record.seo_description ?? "",
      seo_keywords: record.seo_keywords.join(", "),
      content_status: record.content_status,
    });

    setActiveTab("commercial");
    setErrorMessage("");
    setSuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleGenerateProposal() {
    if (!selectedProduct || generating || saving) {
      return;
    }

    try {
      setGenerating(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        "/api/catalog/intelligence/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product: {
              id: selectedProduct.id,
              slug: selectedProduct.slug,
              name: selectedProduct.name,
              category: selectedProduct.category,
              unit: selectedProduct.unit,
              approx: selectedProduct.approx,
              description:
                selectedProduct.description,
              origin: selectedProduct.origin,
              delivery: selectedProduct.delivery,
            },

            current: {
              commercial_description:
                form.commercial_description,
              long_description:
                form.long_description,
              benefits:
                splitLines(form.benefits),
              characteristics:
                splitLines(
                  form.characteristics
                ),

              storage_instructions:
                form.storage_instructions,
              storage_temperature:
                form.storage_temperature,
              shelf_life:
                form.shelf_life,
              washing_instructions:
                form.washing_instructions,
              consumption_instructions:
                form.consumption_instructions,

              chef_notes:
                form.chef_notes,
              recipe_tips:
                splitLines(
                  form.recipe_tips
                ),
              suggested_uses:
                splitLines(
                  form.suggested_uses
                ),

              synonyms:
                splitCommaValues(
                  form.synonyms
                ),
              search_keywords:
                splitCommaValues(
                  form.search_keywords
                ),
              seasonality:
                form.seasonality,

              seo_title:
                form.seo_title,
              seo_description:
                form.seo_description,
              seo_keywords:
                splitCommaValues(
                  form.seo_keywords
                ),
            },
          }),
        }
      );

      const data = (await response.json()) as {
        proposal?: {
          commercial_description?: string;
          long_description?: string;
          benefits?: string[];
          characteristics?: string[];

          storage_instructions?: string;
          storage_temperature?: string;
          shelf_life?: string;
          washing_instructions?: string;
          consumption_instructions?: string;

          chef_notes?: string;
          recipe_tips?: string[];
          suggested_uses?: string[];

          synonyms?: string[];
          search_keywords?: string[];
          seasonality?: string[];

          seo_title?: string;
          seo_description?: string;
          seo_keywords?: string[];

          warnings?: string[];
        };
        error?: string;
        detail?: string;
      };

      if (!response.ok || !data.proposal) {
        const message =
          data.detail?.trim() ||
          data.error?.trim() ||
          "No fue posible generar la propuesta con Gemini.";

        throw new Error(message);
      }

      const proposal =
        data.proposal;

      setForm((current) => ({
        ...current,

        commercial_description:
          proposal.commercial_description?.trim() ||
          current.commercial_description,

        long_description:
          proposal.long_description?.trim() ||
          current.long_description,

        benefits:
          proposal.benefits?.length
            ? proposal.benefits.join("\n")
            : current.benefits,

        characteristics:
          proposal.characteristics?.length
            ? proposal.characteristics.join("\n")
            : current.characteristics,

        storage_instructions:
          proposal.storage_instructions?.trim() ||
          current.storage_instructions,

        storage_temperature:
          proposal.storage_temperature?.trim() ||
          current.storage_temperature,

        shelf_life:
          proposal.shelf_life?.trim() ||
          current.shelf_life,

        washing_instructions:
          proposal.washing_instructions?.trim() ||
          current.washing_instructions,

        consumption_instructions:
          proposal.consumption_instructions?.trim() ||
          current.consumption_instructions,

        chef_notes:
          proposal.chef_notes?.trim() ||
          current.chef_notes,

        recipe_tips:
          proposal.recipe_tips?.length
            ? proposal.recipe_tips.join("\n")
            : current.recipe_tips,

        suggested_uses:
          proposal.suggested_uses?.length
            ? proposal.suggested_uses.join("\n")
            : current.suggested_uses,

        synonyms:
          proposal.synonyms?.length
            ? proposal.synonyms.join(", ")
            : current.synonyms,

        search_keywords:
          proposal.search_keywords?.length
            ? proposal.search_keywords.join(", ")
            : current.search_keywords,

        seasonality:
          proposal.seasonality?.length
            ? proposal.seasonality.join(", ")
            : current.seasonality,

        seo_title:
          proposal.seo_title?.trim() ||
          current.seo_title,

        seo_description:
          proposal.seo_description?.trim() ||
          current.seo_description,

        seo_keywords:
          proposal.seo_keywords?.length
            ? proposal.seo_keywords.join(", ")
            : current.seo_keywords,

        /*
         * La IA nunca guarda, publica ni modifica
         * prioridades o relaciones de productos.
         */
        content_status:
          current.content_status === "published"
            ? "published"
            : "draft",
      }));

      setActiveTab("commercial");

      const warnings =
        data.proposal.warnings ?? [];

      setSuccessMessage(
        warnings.length > 0
          ? `Propuesta Gemini generada. Revisa cada pestaña antes de guardar. Advertencias: ${warnings.join(
              " | "
            )}`
          : "Propuesta Gemini generada correctamente. Revisa cada pestaña antes de guardar o publicar."
      );
    } catch (error) {
      console.error(
        "Error generando propuesta Gemini:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible generar la propuesta con Gemini."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || form.product_id === "") return;

    let nutritionJson: Record<string, unknown>;

    try {
      nutritionJson = JSON.parse(
        form.nutrition_json || "{}"
      ) as Record<string, unknown>;
    } catch {
      setActiveTab("nutrition");
      setErrorMessage(
        "La información nutricional debe contener un JSON válido."
      );
      return;
    }

    const payload: ProductIntelligencePayload = {
      product_id: Number(form.product_id),
      commercial_description: form.commercial_description.trim(),
      long_description: form.long_description.trim(),
      benefits: splitLines(form.benefits),
      characteristics: splitLines(form.characteristics),
      nutrition_json: nutritionJson,
      storage_instructions: form.storage_instructions.trim(),
      storage_temperature: form.storage_temperature.trim(),
      shelf_life: form.shelf_life.trim(),
      washing_instructions: form.washing_instructions.trim(),
      consumption_instructions: form.consumption_instructions.trim(),
      chef_notes: form.chef_notes.trim(),
      recipe_tips: splitLines(form.recipe_tips),
      suggested_uses: splitLines(form.suggested_uses),
      synonyms: splitCommaValues(form.synonyms),
      search_keywords: splitCommaValues(form.search_keywords),
      related_product_ids: splitNumberValues(form.related_product_ids),
      substitute_product_ids: splitNumberValues(form.substitute_product_ids),
      complementary_product_ids: splitNumberValues(
        form.complementary_product_ids
      ),
      seasonality: form.seasonality.trim(),
      commercial_priority: Math.min(
        100,
        Math.max(0, form.commercial_priority)
      ),
      seo_title: form.seo_title.trim(),
      seo_description: form.seo_description.trim(),
      seo_keywords: splitCommaValues(form.seo_keywords),
      content_status: form.content_status,
    };

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const saved = await saveProductIntelligence(payload);

      setRecords((current) => {
        const exists = current.some((item) => item.id === saved.id);
        return exists
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved];
      });

      setSuccessMessage(
        "La inteligencia del producto fue guardada correctamente."
      );
    } catch (error) {
      console.error("Error guardando Inteligencia IA:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la información."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminGuard>
      <section className="space-y-7">
        <header className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
            Conocimiento del catálogo
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Inteligencia IA del Producto
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
            Administra contenido comercial, nutrición, conservación, Chef,
            búsqueda y SEO de cada producto.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Productos" value={products.length} detail="Catálogo disponible" />
          <SummaryCard label="Con inteligencia" value={completedRecords} detail="Registros enriquecidos" />
          <SummaryCard label="Publicados" value={publishedRecords} detail="Contenido visible" />
        </section>

        <div className="grid gap-7 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
              Editor Enterprise
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              {selectedProduct ? selectedProduct.name : "Selecciona un producto"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <Field label="Producto" required>
                <select
                  value={form.product_id}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (Number.isFinite(value) && value > 0) {
                      selectProduct(value);
                    }
                  }}
                  disabled={saving || generating}
                  className={inputClassName}
                >
                  <option value="">Selecciona un producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </Field>

              {form.product_id !== "" && (
                <>
                  <ProposalPanel
                    generating={generating}
                    saving={saving}
                    onGenerate={handleGenerateProposal}
                  />

                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {TABS.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-black transition ${
                          activeTab === tab.key
                            ? "bg-green-600 text-white"
                            : "bg-zinc-100 text-zinc-600 hover:bg-green-50 hover:text-green-700"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === "commercial" && <CommercialTab form={form} setForm={setForm} />}
                  {activeTab === "nutrition" && <NutritionTab form={form} setForm={setForm} />}
                  {activeTab === "storage" && <StorageTab form={form} setForm={setForm} />}
                  {activeTab === "chef" && <ChefTab form={form} setForm={setForm} />}
                  {activeTab === "ai" && <AiTab form={form} setForm={setForm} />}
                  {activeTab === "seo" && <SeoTab form={form} setForm={setForm} />}

                  <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                    <Field label="Estado">
                      <select
                        value={form.content_status}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            content_status:
                              event.target.value as ProductIntelligenceStatus,
                          }))
                        }
                        disabled={saving || generating}
                        className={inputClassName}
                      >
                        <option value="draft">Borrador</option>
                        <option value="review">En revisión</option>
                        <option value="approved">Aprobado</option>
                        <option value="published">Publicado</option>
                        <option value="archived">Archivado</option>
                      </select>
                    </Field>

                    <Field label="Prioridad">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.commercial_priority}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            commercial_priority: Number(event.target.value),
                          }))
                        }
                        disabled={saving || generating}
                        className={inputClassName}
                      />
                    </Field>
                  </div>

                  {errorMessage && <MessagePanel type="error" message={errorMessage} />}
                  {successMessage && <MessagePanel type="success" message={successMessage} />}

                  <button
                    type="submit"
                    disabled={saving || generating}
                    className="flex w-full items-center justify-center rounded-2xl bg-green-600 px-6 py-4 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-wait disabled:bg-zinc-300"
                  >
                    {saving ? "Guardando..." : "Guardar inteligencia"}
                  </button>
                </>
              )}
            </form>
          </section>

          <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
              Biblioteca inteligente
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Productos registrados
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_190px]">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto, categoría o sinónimo..."
                className={inputClassName}
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as ProductIntelligenceStatus | "all"
                  )
                }
                className={inputClassName}
              >
                <option value="all">Todos los estados</option>
                <option value="draft">Borradores</option>
                <option value="review">En revisión</option>
                <option value="approved">Aprobados</option>
                <option value="published">Publicados</option>
                <option value="archived">Archivados</option>
              </select>
            </div>

            {loading ? (
              <LoadingPanel />
            ) : filteredProducts.length === 0 ? (
              <EmptyPanel />
            ) : (
              <div className="mt-7 space-y-3">
                {filteredProducts.map((product) => {
                  const record = records.find(
                    (item) => item.product_id === product.id
                  );

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => selectProduct(product.id)}
                      className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left transition hover:border-green-300 hover:bg-green-50"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-black text-zinc-400">
                            Sin foto
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black text-zinc-950">{product.name}</p>
                        <p className="mt-1 truncate text-xs font-bold text-green-600">
                          {product.category}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <StatusBadge status={record?.content_status ?? "draft"} />
                          <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-600">
                            {record ? "Con registro" : "Sin completar"}
                          </span>
                        </div>
                      </div>

                      <span className="text-xl text-zinc-400">›</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </AdminGuard>
  );
}

function ProposalPanel({
  generating,
  saving,
  onGenerate,
}: {
  generating: boolean;
  saving: boolean;
  onGenerate: () => void;
}) {
  return (
    <section className="rounded-2xl border border-green-200 bg-green-50/60 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-green-700">
            Generación asistida
          </p>
          <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-600">
            Crea una propuesta inicial con información segura del producto. No
            guarda ni publica de forma automática.
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={generating || saving}
          className="shrink-0 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-wait disabled:bg-zinc-300"
        >
          {generating ? "Generando..." : "Generar propuesta"}
        </button>
      </div>
    </section>
  );
}

function CommercialTab({ form, setForm }: TabProps) {
  return (
    <div className="space-y-5">
      <Field label="Descripción comercial">
        <textarea
          value={form.commercial_description}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              commercial_description: event.target.value,
            }))
          }
          rows={3}
          className={inputClassName}
        />
      </Field>

      <Field label="Descripción ampliada">
        <textarea
          value={form.long_description}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              long_description: event.target.value,
            }))
          }
          rows={5}
          className={inputClassName}
        />
      </Field>

      <Field label="Beneficios — uno por línea">
        <textarea
          value={form.benefits}
          onChange={(event) =>
            setForm((current) => ({ ...current, benefits: event.target.value }))
          }
          rows={5}
          className={inputClassName}
        />
      </Field>

      <Field label="Características — una por línea">
        <textarea
          value={form.characteristics}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              characteristics: event.target.value,
            }))
          }
          rows={5}
          className={inputClassName}
        />
      </Field>
    </div>
  );
}

function NutritionTab({ form, setForm }: TabProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
        La generación asistida no inventa valores nutricionales. Añade datos
        únicamente cuando hayan sido verificados con una fuente confiable.
      </div>

      <Field label="Información nutricional JSON">
        <textarea
          value={form.nutrition_json}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              nutrition_json: event.target.value,
            }))
          }
          rows={16}
          spellCheck={false}
          className={`${inputClassName} font-mono text-xs`}
        />
      </Field>
    </div>
  );
}

function StorageTab({ form, setForm }: TabProps) {
  return (
    <div className="space-y-5">
      <TextAreaField label="Cómo almacenar" field="storage_instructions" form={form} setForm={setForm} />
      <TextField label="Temperatura" field="storage_temperature" form={form} setForm={setForm} />
      <TextField label="Vida útil" field="shelf_life" form={form} setForm={setForm} />
      <TextAreaField label="Cómo lavar" field="washing_instructions" form={form} setForm={setForm} />
      <TextAreaField label="Cómo consumir" field="consumption_instructions" form={form} setForm={setForm} />
    </div>
  );
}

function ChefTab({ form, setForm }: TabProps) {
  return (
    <div className="space-y-5">
      <TextAreaField label="Notas del Chef" field="chef_notes" form={form} setForm={setForm} />
      <TextAreaField label="Consejos de recetas — uno por línea" field="recipe_tips" form={form} setForm={setForm} />
      <TextAreaField label="Usos sugeridos — uno por línea" field="suggested_uses" form={form} setForm={setForm} />
    </div>
  );
}

function AiTab({ form, setForm }: TabProps) {
  return (
    <div className="space-y-5">
      <TextField label="Sinónimos — separados por comas" field="synonyms" form={form} setForm={setForm} />
      <TextField label="Palabras clave — separadas por comas" field="search_keywords" form={form} setForm={setForm} />
      <TextField label="IDs relacionados — separados por comas" field="related_product_ids" form={form} setForm={setForm} />
      <TextField label="IDs sustitutos — separados por comas" field="substitute_product_ids" form={form} setForm={setForm} />
      <TextField label="IDs complementarios — separados por comas" field="complementary_product_ids" form={form} setForm={setForm} />
      <TextField label="Estacionalidad" field="seasonality" form={form} setForm={setForm} />
    </div>
  );
}

function SeoTab({ form, setForm }: TabProps) {
  return (
    <div className="space-y-5">
      <TextField label="Meta title" field="seo_title" form={form} setForm={setForm} />
      <TextAreaField label="Meta description" field="seo_description" form={form} setForm={setForm} />
      <TextField label="Keywords — separadas por comas" field="seo_keywords" form={form} setForm={setForm} />
    </div>
  );
}

type EditableTextField = keyof Pick<
  FormState,
  | "storage_instructions"
  | "storage_temperature"
  | "shelf_life"
  | "washing_instructions"
  | "consumption_instructions"
  | "chef_notes"
  | "recipe_tips"
  | "suggested_uses"
  | "synonyms"
  | "search_keywords"
  | "related_product_ids"
  | "substitute_product_ids"
  | "complementary_product_ids"
  | "seasonality"
  | "seo_title"
  | "seo_description"
  | "seo_keywords"
>;

interface TabProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

function TextField({
  label,
  field,
  form,
  setForm,
}: TabProps & { label: string; field: EditableTextField }) {
  return (
    <Field label={label}>
      <input
        type="text"
        value={String(form[field])}
        onChange={(event) =>
          setForm((current) => ({ ...current, [field]: event.target.value }))
        }
        className={inputClassName}
      />
    </Field>
  );
}

function TextAreaField({
  label,
  field,
  form,
  setForm,
}: TabProps & { label: string; field: EditableTextField }) {
  return (
    <Field label={label}>
      <textarea
        value={String(form[field])}
        onChange={(event) =>
          setForm((current) => ({ ...current, [field]: event.target.value }))
        }
        rows={5}
        className={inputClassName}
      />
    </Field>
  );
}

function buildAssistedProposal(
  product: AdminProductRecord,
  current: FormState
): FormState {
  const name = product.name.trim();
  const category = product.category.trim();
  const profile = getCategoryProfile(category.toLowerCase());
  const keywords = uniqueValues([
    name,
    category,
    `${name} Riobamba`,
    `${category} Riobamba`,
    "MercaNova GO",
  ]);

  return {
    ...current,
    commercial_description:
      current.commercial_description.trim() ||
      `${name} seleccionado por MercaNova GO, con criterios de calidad, frescura y presentación adecuados para el consumo cotidiano.`,
    long_description:
      current.long_description.trim() ||
      `${name} forma parte de la categoría ${category}. MercaNova GO prioriza productos seleccionados y una presentación clara para facilitar una compra práctica, confiable y adaptada a las necesidades del hogar.`,
    benefits: current.benefits.trim() || profile.benefits.join("\n"),
    characteristics:
      current.characteristics.trim() || profile.characteristics.join("\n"),
    storage_instructions:
      current.storage_instructions || profile.storageInstructions,
    consumption_instructions:
      current.consumption_instructions || profile.consumptionInstructions,
    chef_notes:
      current.chef_notes.trim() ||
      "Úsalo de acuerdo con su punto de frescura y condición para aprovechar mejor su sabor, textura y versatilidad en preparaciones cotidianas.",
    recipe_tips:
      current.recipe_tips.trim() || profile.recipeTips.join("\n"),
    suggested_uses:
      current.suggested_uses.trim() || profile.suggestedUses.join("\n"),
    search_keywords:
      current.search_keywords.trim() || keywords.join(", "),
    seo_title:
      current.seo_title.trim() || `${name} en Riobamba | MercaNova GO`,
    seo_description:
      current.seo_description.trim() ||
      `Compra ${name} seleccionado en MercaNova GO. Consulta presentación, disponibilidad e información útil para tu compra con atención local en Riobamba.`,
    seo_keywords:
      current.seo_keywords.trim() || keywords.join(", "),
    content_status:
      current.content_status === "published" ? "published" : "draft",
  };
}

function getCategoryProfile(category: string) {
  if (category.includes("fruta")) {
    return {
      benefits: [
        "Producto versátil para consumo cotidiano.",
        "Puede incorporarse a desayunos, meriendas y preparaciones familiares.",
        "Su uso depende del punto de maduración y de la preparación elegida.",
      ],
      characteristics: [
        "Producto seleccionado según criterios visuales de calidad.",
        "La textura, aroma y firmeza pueden variar según maduración.",
        "Presentación orientada al consumo doméstico.",
      ],
      suggestedUses: ["Consumo directo", "Desayunos", "Meriendas", "Batidos", "Postres"],
      recipeTips: [
        "Aprovecha el punto de maduración adecuado para cada preparación.",
        "Combina con otros ingredientes frescos según la receta.",
      ],
      storageInstructions:
        "Conservar según su grado de maduración, en un lugar fresco, seco y ventilado.",
      consumptionInstructions:
        "Consumir directamente o incorporar en preparaciones según preferencia.",
    };
  }

  if (category.includes("hortaliza") || category.includes("verdura")) {
    return {
      benefits: [
        "Producto fresco y versátil para preparaciones cotidianas.",
        "Puede integrarse en diferentes comidas y acompañamientos.",
      ],
      characteristics: [
        "Producto seleccionado con atención a frescura y presentación.",
        "Las características pueden variar según variedad y cosecha.",
      ],
      suggestedUses: ["Ensaladas", "Guarniciones", "Preparaciones calientes", "Comidas familiares"],
      recipeTips: [
        "Lava y prepara únicamente la cantidad que vayas a utilizar.",
        "Ajusta el corte según la preparación para aprovechar mejor su textura.",
      ],
      storageInstructions:
        "Mantener en condiciones frescas y adecuadas para conservar su calidad.",
      consumptionInstructions:
        "Lavar correctamente antes de preparar y consumir.",
    };
  }

  if (category.includes("tubérculo") || category.includes("tuberculo")) {
    return {
      benefits: [
        "Ingrediente versátil para preparaciones tradicionales y cotidianas.",
        "Se adapta a diferentes técnicas de cocina.",
      ],
      characteristics: [
        "Producto seleccionado por apariencia y condición general.",
        "El tamaño puede variar según cosecha y proveedor.",
      ],
      suggestedUses: ["Sopas", "Locros", "Guarniciones", "Preparaciones tradicionales"],
      recipeTips: [
        "Selecciona la técnica de cocción de acuerdo con la textura que deseas.",
        "Conserva las unidades sin lavar hasta el momento de utilizarlas.",
      ],
      storageInstructions:
        "Conservar en un lugar fresco, seco, ventilado y protegido de la luz directa.",
      consumptionInstructions:
        "Lavar, pelar cuando corresponda y cocinar según la preparación.",
    };
  }

  if (category.includes("lácteo") || category.includes("lacteo")) {
    return {
      benefits: [
        "Producto práctico para desayunos y preparaciones familiares.",
        "Puede utilizarse en recetas dulces o saladas según el producto.",
      ],
      characteristics: [
        "Producto seleccionado para consumo doméstico.",
        "Requiere respetar las condiciones de conservación indicadas.",
      ],
      suggestedUses: ["Desayunos", "Meriendas", "Recetas familiares"],
      recipeTips: [
        "Mantén la cadena de frío cuando corresponda.",
        "Utiliza utensilios limpios para manipular el producto.",
      ],
      storageInstructions:
        "Conservar refrigerado de acuerdo con las indicaciones del producto y su empaque.",
      consumptionInstructions:
        "Consumir dentro del periodo recomendado y mantener condiciones adecuadas de conservación.",
    };
  }

  return {
    benefits: [
      "Producto seleccionado para facilitar la compra cotidiana.",
      "Presentación pensada para el consumo familiar.",
    ],
    characteristics: [
      "Producto organizado dentro del catálogo MercaNova GO.",
      "Disponibilidad y presentación sujetas a abastecimiento.",
    ],
    suggestedUses: ["Consumo cotidiano", "Preparaciones familiares"],
    recipeTips: [
      "Revisa presentación y cantidad antes de incorporarlo a tu preparación.",
    ],
    storageInstructions:
      "Conservar según las condiciones propias del producto y las indicaciones de su empaque cuando corresponda.",
    consumptionInstructions:
      "Utilizar de acuerdo con la naturaleza del producto y la preparación elegida.",
  };
}

function uniqueValues(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );
}

function splitLines(value: string): string[] {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function splitCommaValues(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function splitNumberValues(value: string): number[] {
  return splitCommaValues(value).map(Number).filter(Number.isFinite);
}

const inputClassName =
  "w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-sm font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60";

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-[1.6rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tight">{value}</p>
      <p className="mt-2 text-xs font-bold text-zinc-500">{detail}</p>
    </article>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-black text-zinc-950">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: ProductIntelligenceStatus }) {
  const labels: Record<ProductIntelligenceStatus, string> = {
    draft: "Borrador",
    review: "En revisión",
    approved: "Aprobado",
    published: "Publicado",
    archived: "Archivado",
  };

  return (
    <span className="rounded-full bg-green-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-green-700">
      {labels[status]}
    </span>
  );
}

function MessagePanel({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 text-sm font-bold ${
        type === "success"
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {message}
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="mt-7 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-12 text-center">
      <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />
      <p className="mt-4 font-black text-zinc-700">Cargando inteligencia...</p>
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="mt-7 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
      <p className="text-lg font-black text-zinc-700">No existen coincidencias</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        Ajusta el buscador o el filtro seleccionado.
      </p>
    </div>
  );
}