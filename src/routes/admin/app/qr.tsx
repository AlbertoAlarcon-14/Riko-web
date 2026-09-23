import { createFileRoute } from "@tanstack/react-router";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Plus, Trash2 } from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useDeleteQrSource,
  useQrScans,
  useQrSources,
  useSaveQrSource,
  type QrSource,
} from "@/lib/data";

export const Route = createFileRoute("/admin/app/qr")({
  head: () => ({
    meta: [
      { title: "Códigos QR y trazabilidad · RIKO Admin" },
      {
        name: "description",
        content: "Genera códigos QR por punto físico y mide los escaneos de cada uno.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminQr,
});

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function QrCard({ source, origin }: { source: QrSource; origin: string }) {
  const [png, setPng] = useState<string>("");
  const url = `${origin}/?source=${encodeURIComponent(source.code)}`;

  useEffect(() => {
    let alive = true;
    void QRCode.toDataURL(url, { width: 512, margin: 1 }).then((data) => {
      if (alive) setPng(data);
    });
    return () => {
      alive = false;
    };
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-3">
      {png ? (
        <img src={png} alt={`Código QR de ${source.name}`} className="size-40 rounded-lg bg-white p-2" />
      ) : (
        <div className="size-40 animate-pulse rounded-lg bg-surface-2" />
      )}
      <Button asChild size="sm" variant="outline" disabled={!png}>
        <a href={png} download={`riko-qr-${source.code}.png`}>
          <Download className="mr-2 size-4" /> Descargar
        </a>
      </Button>
    </div>
  );
}

function AdminQr() {
  const { data: sources, isLoading } = useQrSources();
  const { data: scans } = useQrScans();
  const save = useSaveQrSource();
  const remove = useDeleteQrSource();
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of scans ?? []) map[s.code] = (map[s.code] ?? 0) + 1;
    return map;
  }, [scans]);

  const create = () => {
    const clean = name.trim();
    if (clean.length < 2) {
      toast.error("Escribe un nombre para el punto");
      return;
    }
    save.mutate(
      { name: clean, code: slug(clean), active: true },
      {
        onSuccess: () => {
          setName("");
          toast.success("Código QR creado");
        },
        onError: () => toast.error("No pudimos crear el código"),
      },
    );
  };

  return (
    <AdminShell
      title="Códigos QR"
      description="Un código por mesa, volante o punto de venta para saber de dónde llega cada cliente."
    >
      <div className="card-riko p-5">
        <Label htmlFor="qr-name">Nuevo punto de escaneo</Label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Input
            id="qr-name"
            placeholder="Ej: Mesa 4, Volante centro, Domicilios"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={create} disabled={save.isPending}>
            <Plus className="mr-2 size-4" /> CREAR CÓDIGO
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(sources ?? []).map((s) => (
          <article key={s.id} className="card-riko flex flex-col gap-4 p-5 sm:flex-row">
            <QrCard source={s} origin={origin} />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl uppercase">{s.name}</h2>
              <p className="mt-1 break-all text-xs text-muted-foreground">
                {origin}/?source={s.code}
              </p>
              <p className="mt-4 font-display text-3xl text-accent">{counts[s.code] ?? 0}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">escaneos</p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Switch
                    checked={s.active}
                    onCheckedChange={(checked) =>
                      save.mutate({ id: s.id, name: s.name, code: s.code, active: checked })
                    }
                  />
                  {s.active ? "Activo" : "Inactivo"}
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    remove.mutate(s.id, {
                      onSuccess: () => toast.success("Código eliminado"),
                      onError: () => toast.error("No pudimos eliminar el código"),
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </article>
        ))}
        {!isLoading && (sources ?? []).length === 0 && (
          <p className="card-riko p-8 text-center text-muted-foreground md:col-span-2">
            Aún no has creado códigos QR.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
