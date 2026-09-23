import { Flame, Minus, Plus } from "lucide-react";
import { useState } from "react";

import clubImg from "@/assets/club.jpg";
import grillImg from "@/assets/grill.jpg";
import heroImg from "@/assets/hero-burger.jpg";
import { DemoBadge } from "@/components/demo-badge";
import { Button } from "@/components/ui/button";
import type { Category, Product } from "@/lib/data";
import { formatCOP, orderMessage, whatsappUrl } from "@/lib/riko";
import { readSource } from "@/lib/source";

function fallbackImage(slug?: string) {
  if (slug === "parrilla") return grillImg;
  if (slug === "bebidas" || slug === "acompanamientos") return clubImg;
  return heroImg;
}

export function ProductCard({
  product,
  category,
  whatsappNumber,
  withQuantity = false,
}: {
  product: Product;
  category?: Category | undefined;
  whatsappNumber: string;
  withQuantity?: boolean;
}) {
  const [qty, setQty] = useState(1);
  const href = whatsappUrl(
    whatsappNumber,
    orderMessage({ product: product.name, quantity: qty, source: readSource() }),
  );

  return (
    <article className="card-riko card-riko-hover group overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image_url || fallbackImage(category?.slug)}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
              <Flame className="size-3" /> Destacado
            </span>
          )}
          {product.is_demo && <DemoBadge />}
        </div>
        {!product.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <span className="font-display text-lg text-muted-foreground">Agotado</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div>
          {category && (
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {category.name}
            </p>
          )}
          <h3 className="mt-1 text-lg leading-tight">{product.name}</h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="price-riko text-xl">{formatCOP(product.price)}</span>

          <div className="flex items-center gap-2">
            {withQuantity && product.available && (
              <div className="flex items-center gap-1 rounded-full border border-border px-1">
                <button
                  type="button"
                  aria-label="Quitar una unidad"
                  className="p-1 text-muted-foreground hover:text-accent"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-4 text-center text-sm font-semibold">{qty}</span>
                <button
                  type="button"
                  aria-label="Agregar una unidad"
                  className="p-1 text-muted-foreground hover:text-accent"
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            )}
            <Button asChild size="sm" disabled={!product.available}>
              <a href={href} target="_blank" rel="noreferrer">
                PEDIR
              </a>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
