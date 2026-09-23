import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCampaigns, useCustomers, useSaveCampaign } from "@/lib/data";
import { SEGMENTS, whatsappUrl } from "@/lib/riko";

export const Route = createFileRoute("/admin/app/campanas")({
  head: () => ({
    meta: [
      { title: "Campañas de WhatsApp · RIKO Admin" },
      {
        name: "description",
        content: "Prepara mensajes por segmento y envíalos a los clientes del Club Riko.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminCampaigns,
});

function AdminCampaigns() {
  const { data: customers } = useCustomers();
  const { data: campaigns, isLoading } = useCampaigns();
  const save = useSaveCampaign();

  const [name, setName] = useState("");
  const [segment, setSegment] = useState<string>("todos");
  const [message, setMessage] = useState("");

  const audience = useMemo(
    () =>
      (customers ?? []).filter(
        (c) => c.marketing_consent && (segment === "todos" || c.status === segment),
      ),
    [customers, segment],
  );

  const create = () => {
    if (name.trim().length < 3) {
      toast.error("Ponle un nombre a la campaña");
      return;
    }
    if (message.trim().length < 10) {
      toast.error("El mensaje es muy corto");
      return;
    }
    save.mutate(
      {
        name: name.trim(),
        segment,
        message: message.trim(),
        target_count: audience.length,
      },
      {
        onSuccess: () => {
          setName("");
          setMessage("");
          toast.success("Campaña guardada");
        },
        onError: () => toast.error("No pudimos guardar la campaña"),
      },
    );
  };

  return (
    <AdminShell
      title="Campañas"
      description="Mensajes por WhatsApp para los clientes que aceptaron recibir novedades."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="card-riko p-6">
          <h2 className="font-display text-xl uppercase">Nueva campaña</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="c-name">Nombre</Label>
              <Input
                id="c-name"
                className="mt-1"
                placeholder="Ej: Promo alitas jueves"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label>Segmento</Label>
              <Select value={segment} onValueChange={setSegment}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEGMENTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === "todos" ? "Todos los clientes" : `Clientes ${s}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="c-msg">Mensaje</Label>
              <Textarea
                id="c-msg"
                className="mt-1 min-h-32"
                placeholder="¡Hola! Este jueves tenemos 2x1 en alitas en RIKO BEER & GRILL 🍗"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Llegará a <span className="font-semibold text-foreground">{audience.length}</span>{" "}
              persona(s) con consentimiento.
            </p>
            <Button onClick={create} disabled={save.isPending}>
              <Megaphone className="mr-2 size-4" /> GUARDAR CAMPAÑA
            </Button>
          </div>
        </section>

        <section className="card-riko p-6">
          <h2 className="font-display text-xl uppercase">Enviar uno por uno</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Abre el chat con el mensaje ya escrito y solo presiona enviar.
          </p>
          <div className="mt-4 max-h-96 space-y-2 overflow-y-auto pr-1">
            {audience.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </div>
                <Button asChild size="sm" variant="outline" disabled={message.trim().length < 5}>
                  <a
                    href={whatsappUrl(c.phone, message || "¡Hola! Te escribimos de RIKO 🍔")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Send className="size-4" />
                  </a>
                </Button>
              </div>
            ))}
            {audience.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No hay clientes en este segmento.
              </p>
            )}
          </div>
        </section>
      </div>

      <h2 className="mt-10 font-display text-2xl uppercase">Historial</h2>
      <div className="card-riko mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Campaña</th>
              <th className="px-4 py-3">Segmento</th>
              <th className="px-4 py-3">Alcance</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(campaigns ?? []).map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-semibold">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.segment}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.target_count}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.status}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("es-CO")}
                </td>
              </tr>
            ))}
            {!isLoading && (campaigns ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Todavía no has creado campañas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
