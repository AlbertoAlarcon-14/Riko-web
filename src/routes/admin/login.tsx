import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acceso equipo · RIKO Beer & Grill" },
      {
        name: "description",
        content: "Ingreso privado al panel de administración de RIKO Beer & Grill Duitama.",
      },
      { property: "og:title", content: "Acceso equipo · RIKO Beer & Grill" },
      {
        property: "og:description",
        content: "Panel interno de RIKO Beer & Grill Duitama.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.success("Revisa tu correo para confirmar la cuenta.");
        return;
      }

      try {
        await claimFirstAdmin();
      } catch {
        /* ya existe un administrador */
      }
      toast.success("Bienvenido al panel");
      navigate({ to: "/admin", replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No pudimos iniciar sesión";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="card-riko w-full max-w-sm p-6">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-3xl leading-none text-primary">RIKO</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
            admin
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login" ? "Ingresa con tu cuenta del equipo." : "Crea la cuenta del equipo."}
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="equipo@riko.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "UN MOMENTO…" : mode === "login" ? "ENTRAR" : "CREAR CUENTA"}
          </Button>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-accent"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Crear cuenta del equipo" : "Ya tengo cuenta"}
          </button>
        </div>
      </form>
    </div>
  );
}
