import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveSettings, useSettings } from "@/lib/data";
import { DEFAULT_SETTINGS } from "@/lib/riko";

export const Route = createFileRoute("/admin/app/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración del negocio · RIKO Admin" },
      {
        name: "description",
        content: "Actualiza WhatsApp, dirección, horarios y redes sociales de RIKO BEER & GRILL.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSettings,
});

const FIELDS: { key: string; label: string; hint?: string }[] = [
  { key: "brand_tagline", label: "Frase de la marca" },
  { key: "whatsapp_number", label: "WhatsApp", hint: "Con indicativo, ej: 573001112233" },
  { key: "address", label: "Dirección" },
  { key: "hours", label: "Horarios" },
  { key: "instagram_url", label: "Instagram" },
  { key: "facebook_url", label: "Facebook" },
  { key: "maps_url", label: "Enlace del mapa" },
  { key: "google_reviews_url", label: "Enlace para reseñas de Google" },
];

function AdminSettings() {
  const { settings, isLoading } = useSettings();
  const save = useSaveSettings();
  const [values, setValues] = useState<Record<string, string>>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!isLoading) setValues({ ...DEFAULT_SETTINGS, ...settings });
  }, [isLoading, settings]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate(values, {
      onSuccess: () => toast.success("Configuración guardada"),
      onError: () => toast.error("No pudimos guardar los cambios"),
    });
  };

  return (
    <AdminShell
      title="Configuración"
      description="Estos datos aparecen en toda la página pública del restaurante."
    >
      <form onSubmit={submit} className="card-riko max-w-2xl space-y-5 p-6">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              className="mt-1"
              value={values[field.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
            />
            {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
          </div>
        ))}
        <Button type="submit" disabled={save.isPending}>
          <Save className="mr-2 size-4" /> GUARDAR CAMBIOS
        </Button>
      </form>
    </AdminShell>
  );
}
