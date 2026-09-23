import { Link } from "@tanstack/react-router";

import { useSettings } from "@/lib/data";
import { CITY, RESTAURANT_NAME } from "@/lib/riko";

export function SiteFooter() {
  const { settings } = useSettings();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-primary">RIKO</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {RESTAURANT_NAME} · {CITY}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="mb-2 font-semibold uppercase tracking-wide text-foreground">Visítanos</p>
          <p>{settings["address"]}</p>
          <p className="mt-1">{settings["hours"]}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="mb-2 font-semibold uppercase tracking-wide text-foreground">Explora</p>
          <div className="flex flex-col gap-1">
            <Link to="/menu" className="hover:text-accent">
              Menú
            </Link>
            <Link to="/club" className="hover:text-accent">
              Club Riko
            </Link>
            <Link to="/opinion" className="hover:text-accent">
              Deja tu opinión
            </Link>
            <Link to="/contacto" className="hover:text-accent">
              Contacto
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        Contenido y precios de demostración · validar antes de publicar
      </div>
    </footer>
  );
}
