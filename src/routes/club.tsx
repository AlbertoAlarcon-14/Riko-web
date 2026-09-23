import { createFileRoute } from "@tanstack/react-router";
import { Gift, PartyPopper, Ticket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import clubImg from "@/assets/club.jpg";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterCustomer } from "@/lib/data";
import { sanitizePhone } from "@/lib/riko";
import { readSource } from "@/lib/source";

export const Route = createFileRoute("/club")({
  head: () => ({
    meta: [
      { title: "Club Riko · Beneficios y promos exclusivas" },
      {
        name: "description",
        content:
          "Únete al Club Riko de RIKO Beer & Grill en Duitama: promociones exclusivas, novedades del menú y un detalle en tu cumpleaños.",
      },
      { property: "og:title", content: "Club Riko · RIKO Beer & Grill" },
      {
        property: "og:description",
        content: "Promos exclusivas y un detalle de cumpleaños. Regístrate gratis.",
      },
    ],
  }),
  component: ClubPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(80, "Nombre muy largo"),
  phone: z
    .string()
    .trim()
    .min(7, "Escribe un celular válido")
    .max(20, "Celular muy largo")
    .regex(/^[+\d\s-]+$/, "Solo números"),
  birthday: z.string().max(10).optional(),
  consent: z.literal(true, { message: "Necesitamos tu autorización" }),
});

function ClubPage() {
  const [form, setForm] = useState({ name: "", phone: "", birthday: "", consent: false });
  const [done, setDone] = useState(false);
  const register = useRegisterCustomer();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }
    register.mutate(
      {
        name: parsed.data.name,
        phone: sanitizePhone(parsed.data.phone),
        birthday: form.birthday || null,
        source: readSource(),
      },
      {
        onSuccess: () => {
          setDone(true);
          toast.success("¡Bienvenido al Club Riko!");
        },
        onError: () => toast.error("No pudimos registrarte. Intenta de nuevo."),
      },
    );
  };

  return (
    <SiteShell>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl uppercase sm:text-5xl">Club Riko</h1>
          <p className="mt-3 text-muted-foreground">
            Regístrate gratis y recibe promociones exclusivas por WhatsApp, novedades del menú y
            un detalle especial en tu cumpleaños.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              { icon: Ticket, text: "Promos solo para miembros del club." },
              { icon: Gift, text: "Sorpresa de cumpleaños en tu visita." },
              { icon: PartyPopper, text: "Invitaciones a eventos y lanzamientos." },
            ].map((b) => (
              <li key={b.text} className="flex items-center gap-3 text-sm">
                <b.icon className="size-5 shrink-0 text-accent" />
                {b.text}
              </li>
            ))}
          </ul>
          <img
            src={clubImg}
            alt="Ambiente del Club Riko"
            loading="lazy"
            className="mt-8 h-56 w-full rounded-xl object-cover"
          />
        </div>

        <div className="card-riko h-fit p-6">
          {done ? (
            <div className="py-10 text-center">
              <PartyPopper className="mx-auto size-10 text-accent" />
              <h2 className="mt-4 text-2xl">¡Ya eres parte del club!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Te escribiremos por WhatsApp con las próximas promos.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <h2 className="text-xl">Regístrate</h2>
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={form.name}
                  maxLength={80}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Celular (WhatsApp)</Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  value={form.phone}
                  maxLength={20}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="300 000 0000"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="birthday">Cumpleaños (opcional)</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={form.birthday}
                  onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                />
              </div>
              <label className="flex items-start gap-3 text-xs text-muted-foreground">
                <Checkbox
                  checked={form.consent}
                  onCheckedChange={(v) => setForm({ ...form, consent: v === true })}
                  aria-label="Autorizo el uso de mis datos"
                />
                <span>
                  Autorizo a RIKO Beer & Grill a contactarme por WhatsApp con promociones y
                  novedades. Puedo pedir la eliminación de mis datos cuando quiera.
                </span>
              </label>
              <Button type="submit" disabled={register.isPending}>
                {register.isPending ? "ENVIANDO…" : "UNIRME AL CLUB"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
