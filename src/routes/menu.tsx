import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import { SiteShell } from "@/components/site-shell";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useProducts, useSettings } from "@/lib/data";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menú digital · RIKO Beer & Grill Duitama" },
      {
        name: "description",
        content:
          "Explora el menú de RIKO Beer & Grill: hamburguesas, parrilla, acompañamientos y bebidas. Pide por WhatsApp desde tu mesa.",
      },
      { property: "og:title", content: "Menú digital · RIKO Beer & Grill" },
      {
        property: "og:description",
        content: "Hamburguesas, parrilla y bebidas. Pide por WhatsApp desde tu mesa.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { settings } = useSettings();
  const { data: categories, isLoading: loadingCats } = useCategories();
  const { data: products, isLoading } = useProducts();
  const [active, setActive] = useState<string>("todos");
  const [q, setQ] = useState("");

  const cats = (categories ?? []).filter((c) => c.active);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (products ?? []).filter((p) => {
      const byCat = active === "todos" || p.category_id === active;
      const byTerm =
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.description ?? "").toLowerCase().includes(term);
      return byCat && byTerm;
    });
  }, [products, active, q]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-display text-4xl uppercase sm:text-5xl">Nuestro menú</h1>
        <p className="mt-2 text-muted-foreground">
          Elige tu favorito y pide por WhatsApp. Precios en pesos colombianos.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en el menú…"
              className="pl-9"
              maxLength={60}
              aria-label="Buscar producto"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[{ id: "todos", name: "Todos" }, ...cats].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActive(c.id)}
                className={
                  active === c.id
                    ? "rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-foreground"
                    : "rounded-full border border-border px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent"
                }
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading || loadingCats ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            No encontramos productos con esa búsqueda.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                category={cats.find((c) => c.id === p.category_id)}
                whatsappNumber={settings["whatsapp_number"] ?? ""}
                withQuantity
              />
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
