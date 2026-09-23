import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFeedback, useSettings } from "@/lib/data";
import { RATING_LABELS } from "@/lib/riko";
import { readSource } from "@/lib/source";

export const Route = createFileRoute("/opinion")({
  head: () => ({
    meta: [
      { title: "Deja tu opinión · RIKO Beer & Grill Duitama" },
      {
        name: "description",
        content:
          "Cuéntanos cómo fue tu experiencia en RIKO Beer & Grill Duitama. Tu opinión nos ayuda a mejorar cada plato y cada visita.",
      },
      { property: "og:title", content: "Deja tu opinión · RIKO Beer & Grill" },
      {
        property: "og:description",
        content: "Califica tu experiencia en RIKO Beer & Grill Duitama en 10 segundos.",
      },
    ],
  }),
  component: OpinionPage,
});

const commentSchema = z.string().trim().max(500, "Máximo 500 caracteres");

function OpinionPage() {
  const { settings } = useSettings();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const create = useCreateFeedback();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Elige cómo fue tu experiencia");
      return;
    }
    const parsed = commentSchema.safeParse(comment);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Comentario muy largo");
      return;
    }
    create.mutate(
      { rating, comment: parsed.data || null, source: readSource() },
      {
        onSuccess: () => {
          setSent(true);
          toast.success("¡Gracias por tu opinión!");
        },
        onError: () => toast.error("No pudimos enviar tu opinión. Intenta de nuevo."),
      },
    );
  };

  const positive = (rating ?? 0) >= 3;

  return (
    <SiteShell>
      <div className="mx-auto max-w-xl px-4 py-14">
        <h1 className="font-display text-4xl uppercase sm:text-5xl">¿Cómo te fue?</h1>
        <p className="mt-2 text-muted-foreground">
          Nos toma 10 segundos y nos ayuda muchísimo a mejorar.
        </p>

        {sent ? (
          <div className="card-riko mt-8 p-8 text-center">
            <Heart className="mx-auto size-10 text-primary" />
            <h2 className="mt-4 text-2xl">¡Gracias por contarnos!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {positive
                ? "Si quieres, comparte tu experiencia también en Google."
                : "Vamos a revisarlo con el equipo para mejorar tu próxima visita."}
            </p>
            {positive && settings["google_reviews_url"] && (
              <Button asChild className="mt-6">
                <a href={settings["google_reviews_url"]} target="_blank" rel="noreferrer">
                  DEJAR RESEÑA EN GOOGLE <ExternalLink className="ml-2 size-4" />
                </a>
              </Button>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="card-riko mt-8 flex flex-col gap-5 p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[4, 3, 2, 1].map((value) => {
                const r = RATING_LABELS[value]!;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={
                      rating === value
                        ? "flex flex-col items-center gap-1 rounded-xl border-2 border-accent bg-accent/10 p-3"
                        : "flex flex-col items-center gap-1 rounded-xl border border-border p-3 hover:border-accent/60"
                    }
                  >
                    <span className="text-2xl">{r.emoji}</span>
                    <span className="text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Cuéntanos qué pediste y cómo te atendieron (opcional)"
            />

            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "ENVIANDO…" : "ENVIAR OPINIÓN"}
            </Button>
          </form>
        )}
      </div>
    </SiteShell>
  );
}
