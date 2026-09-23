import { createFileRoute } from "@tanstack/react-router";
import { Clock, Facebook, Instagram, MapPin, MessageCircle } from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/data";
import { CITY, orderMessage, whatsappUrl } from "@/lib/riko";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto y ubicación · RIKO Beer & Grill Duitama" },
      {
        name: "description",
        content:
          "Encuentra RIKO Beer & Grill en Duitama, Boyacá: dirección, horarios, WhatsApp y redes sociales para pedidos y reservas.",
      },
      { property: "og:title", content: "Contacto · RIKO Beer & Grill Duitama" },
      {
        property: "og:description",
        content: "Dirección, horarios y WhatsApp de RIKO Beer & Grill en Duitama.",
      },
    ],
  }),
  component: ContactoPage,
});

function ContactoPage() {
  const { settings } = useSettings();

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-display text-4xl uppercase sm:text-5xl">Contacto</h1>
        <p className="mt-2 text-muted-foreground">Estamos en {CITY}. ¡Te esperamos!</p>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="card-riko flex flex-col gap-5 p-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold uppercase tracking-wide">Dirección</p>
                <p className="text-sm text-muted-foreground">{settings["address"]}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold uppercase tracking-wide">Horarios</p>
                <p className="text-sm text-muted-foreground">{settings["hours"]}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a
                  href={whatsappUrl(settings["whatsapp_number"] ?? "", orderMessage({}))}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="mr-2 size-4" /> ESCRÍBENOS
                </a>
              </Button>
              {settings["maps_url"] && (
                <Button asChild variant="outline">
                  <a href={settings["maps_url"]} target="_blank" rel="noreferrer">
                    VER EN MAPAS
                  </a>
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              {settings["instagram_url"] && (
                <a
                  href={settings["instagram_url"]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="rounded-full border border-border p-2 text-muted-foreground hover:border-accent hover:text-accent"
                >
                  <Instagram className="size-5" />
                </a>
              )}
              {settings["facebook_url"] && (
                <a
                  href={settings["facebook_url"]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="rounded-full border border-border p-2 text-muted-foreground hover:border-accent hover:text-accent"
                >
                  <Facebook className="size-5" />
                </a>
              )}
            </div>
          </div>

          <div className="card-riko overflow-hidden">
            <iframe
              title="Mapa de ubicación de RIKO Beer & Grill"
              src="https://www.google.com/maps?q=Duitama+Boyaca&output=embed"
              loading="lazy"
              className="h-[380px] w-full border-0"
            />
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
