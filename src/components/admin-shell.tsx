import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  LogOut,
  MessageSquareHeart,
  Megaphone,
  QrCode,
  Settings,
  UtensilsCrossed,
  Users,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/admin", label: "Panel", icon: BarChart3, exact: true },
  { to: "/admin/clientes", label: "Clientes", icon: Users, exact: false },
  { to: "/admin/productos", label: "Productos", icon: UtensilsCrossed, exact: false },
  { to: "/admin/opiniones", label: "Opiniones", icon: MessageSquareHeart, exact: false },
  { to: "/admin/qr", label: "Códigos QR", icon: QrCode, exact: false },
  { to: "/admin/campanas", label: "Campañas", icon: Megaphone, exact: false },
  { to: "/admin/configuracion", label: "Configuración", icon: Settings, exact: false },
] as const;

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  };

  const links = (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => setOpen(false)}
          activeOptions={{ exact: item.exact }}
          activeProps={{ className: "bg-primary/15 text-accent" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface p-4 lg:flex">
        <Link to="/" className="mb-6 flex items-baseline gap-1 px-2">
          <span className="font-display text-2xl leading-none text-primary">RIKO</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
            admin
          </span>
        </Link>
        {links}
        <Button variant="outline" className="mt-auto" onClick={() => void signOut()}>
          <LogOut className="mr-2 size-4" /> SALIR
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface/60 px-4 lg:hidden">
          <span className="font-display text-xl text-primary">RIKO ADMIN</span>
          <button
            type="button"
            aria-label="Abrir menú"
            className="rounded-md p-2"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </header>
        {open && (
          <div className="border-b border-border bg-surface p-4 lg:hidden">
            {links}
            <Button variant="outline" className="mt-3 w-full" onClick={() => void signOut()}>
              <LogOut className="mr-2 size-4" /> SALIR
            </Button>
          </div>
        )}

        <main className="flex-1 px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-3xl uppercase sm:text-4xl">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
