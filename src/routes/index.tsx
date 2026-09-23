import { Link, createFileRoute } from "@tanstack/react-router";
import { Beer, Flame, MapPin, Star } from "lucide-react";

import clubImg from "@/assets/club.jpg";
import grillImg from "@/assets/grill.jpg";
import heroImg from "@/assets/hero-burger.jpg";
import { ProductCard } from "@/components/product-card";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { useCategories, useProducts, useSettings } from "@/lib/data";
import { CITY, RESTAURANT_NAME, orderMessage, whatsappUrl } from "@/lib/riko";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RIKO Beer & Grill · Hamburguesas y parrilla en Duitama" },
      {
        name: "description",
        content:
          "Hamburguesas artesanales, parrilla y cerveza fría en Duitama, Boyacá. Mira el menú y pide por WhatsApp en segundos.",
      },
      { property: "og:title", content: "RIKO Beer & Grill · Duitama" },
      {
        property: "og:description",
        content: "Hamburguesas, parrilla y cerveza fría en Duitama. Pide por WhatsApp.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { settings } = useSettings();
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const wa = settings["whatsapp_number"] ?? "";
  const featured = (products ?? []).filter((p) => p.featured && p.available).slice(0, 6);

  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Hamburguesa artesanal de RIKO Beer & Grill"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
            <MapPin className="size-3" /> {CITY}
          </p>
          <h1 className="mt-5 max-w-2xl font-display text-5xl uppercase leading-[0.95] sm:text-7xl">
            {RESTAURANT_NAME}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            {settings["brand_tagline"]} Parrilla al carbón, hamburguesas artesanales y cerveza
            bien fría.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a
                href={whatsappUrl(wa, orderMessage({}))}
                target="_blank"
                rel="noreferrer"
              >
                PEDIR POR WHATSAPP
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/menu">VER MENÚ</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-3">
        {[
          { icon: Flame, title: "Parrilla al carbón", text: "Cortes y costillas ahumadas lento." },
          { icon: Beer, title: "Cerveza fría", text: "La compañía perfecta para tu plato." },
          { icon: Star, title: "Club Riko", text: "Beneficios y sorpresas de cumpleaños." },
        ].map((f) => (
          <div key={f.title} className="card-riko p-5">
            <f.icon className="size-6 text-accent" />
            <h3 className="mt-3 text-lg">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl uppercase sm:text-4xl">Los favoritos</h2>
            <Link to="/menu" className="text-sm font-semibold text-accent hover:underline">
              Ver todo el menú
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                category={(categories ?? []).find((c) => c.id === p.category_id)}
                whatsappNumber={wa}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-20 sm:grid-cols-2">
        <Link to="/club" className="card-riko card-riko-hover group relative overflow-hidden">
          <img
            src={clubImg}
            alt="Ambiente de RIKO Beer & Grill"
            loading="lazy"
            className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="p-5">
            <h3 className="text-xl">Únete al Club Riko</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Promos exclusivas y un detalle en tu cumpleaños.
            </p>
          </div>
        </Link>
        <Link to="/opinion" className="card-riko card-riko-hover group relative overflow-hidden">
          <img
            src={grillImg}
            alt="Costillas a la parrilla"
            loading="lazy"
            className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="p-5">
            <h3 className="text-xl">Cuéntanos cómo te fue</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tu opinión nos ayuda a mejorar cada plato.
            </p>
          </div>
        </Link>
      </section>
    </SiteShell>
  );
}
