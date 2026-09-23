import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/data";
import { orderMessage, whatsappUrl } from "@/lib/riko";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/menu", label: "Menú" },
  { to: "/club", label: "Club Riko" },
  { to: "/opinion", label: "Opinión" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { settings } = useSettings();
  const wa = whatsappUrl(settings["whatsapp_number"] ?? "", orderMessage({}));

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-baseline gap-1">
          <span className="font-display text-2xl leading-none text-primary">RIKO</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
            beer & grill
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-accent"
              activeProps={{ className: "text-accent" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={wa} target="_blank" rel="noreferrer">
              PEDIR
            </a>
          </Button>
          <button
            type="button"
            aria-label="Abrir menú"
            className="rounded-md p-2 text-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
                activeProps={{ className: "text-accent" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            <Button asChild className="mt-3">
              <a href={wa} target="_blank" rel="noreferrer">
                PEDIR POR WHATSAPP
              </a>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
