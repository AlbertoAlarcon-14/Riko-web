import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFeedback, useUpdateFeedbackStatus } from "@/lib/data";
import { RATING_LABELS } from "@/lib/riko";

export const Route = createFileRoute("/admin/app/opiniones")({
  head: () => ({
    meta: [
      { title: "Opiniones de clientes · RIKO Admin" },
      {
        name: "description",
        content: "Revisa y gestiona las calificaciones y comentarios de los clientes de RIKO.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminFeedback,
});

const STATUSES = ["nueva", "en proceso", "resuelta"] as const;

function AdminFeedback() {
  const { data, isLoading } = useFeedback();
  const update = useUpdateFeedbackStatus();
  const [rating, setRating] = useState("todas");
  const [status, setStatus] = useState("todas");

  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (f) =>
          (rating === "todas" || String(f.rating) === rating) &&
          (status === "todas" || f.status === status),
      ),
    [data, rating, status],
  );

  const average = useMemo(() => {
    const list = data ?? [];
    if (list.length === 0) return 0;
    return list.reduce((acc, f) => acc + f.rating, 0) / list.length;
  }, [data]);

  return (
    <AdminShell
      title="Opiniones"
      description="Escucha lo que dicen los clientes y da seguimiento a cada caso."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-riko p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total opiniones</p>
          <p className="mt-1 font-display text-3xl">{(data ?? []).length}</p>
        </div>
        <div className="card-riko p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Promedio</p>
          <p className="mt-1 font-display text-3xl">{average.toFixed(1)} / 4</p>
        </div>
        <div className="card-riko p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Sin atender</p>
          <p className="mt-1 font-display text-3xl">
            {(data ?? []).filter((f) => f.status === "nueva").length}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Select value={rating} onValueChange={setRating}>
          <SelectTrigger className="sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las calificaciones</SelectItem>
            {[4, 3, 2, 1].map((r) => (
              <SelectItem key={r} value={String(r)}>
                {RATING_LABELS[r]!.emoji} {RATING_LABELS[r]!.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos los estados</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((f) => (
          <article key={f.id} className="card-riko p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg uppercase">
                  {RATING_LABELS[f.rating]?.emoji} {RATING_LABELS[f.rating]?.label ?? f.rating}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(f.created_at).toLocaleString("es-CO")} · origen{" "}
                  {f.source ?? "directo"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={f.status}
                  onValueChange={(value) =>
                    update.mutate(
                      { id: f.id, status: value },
                      {
                        onSuccess: () => toast.success("Opinión actualizada"),
                        onError: () => toast.error("No pudimos actualizar la opinión"),
                      },
                    )
                  }
                >
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {f.status !== "resuelta" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      update.mutate(
                        { id: f.id, status: "resuelta" },
                        { onSuccess: () => toast.success("Marcada como resuelta") },
                      )
                    }
                  >
                    Resolver
                  </Button>
                )}
              </div>
            </div>
            {f.comment && <p className="mt-3 text-sm text-muted-foreground">{f.comment}</p>}
          </article>
        ))}
        {!isLoading && rows.length === 0 && (
          <p className="card-riko p-8 text-center text-muted-foreground">
            No hay opiniones con esos filtros.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
