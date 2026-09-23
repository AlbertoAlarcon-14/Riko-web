import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin-shell";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCustomers, useUpdateCustomerStatus, type Customer } from "@/lib/data";
import { whatsappUrl } from "@/lib/riko";

export const Route = createFileRoute("/admin/app/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes Club Riko · RIKO Admin" },
      { name: "description", content: "Base de datos de clientes del Club Riko." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminCustomers,
});

const STATUSES: Customer["status"][] = ["nuevo", "recurrente", "frecuente", "inactivo"];

function AdminCustomers() {
  const { data, isLoading } = useCustomers();
  const update = useUpdateCustomerStatus();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("todos");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((c) => {
      const matchQuery = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
      const matchStatus = status === "todos" || c.status === status;
      return matchQuery && matchStatus;
    });
  }, [data, query, status]);

  return (
    <AdminShell
      title="Clientes"
      description="Personas registradas en el Club Riko con consentimiento de contacto."
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre o teléfono"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="card-riko mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Cumpleaños</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-semibold">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.birthday ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.source ?? "directo"}</td>
                <td className="px-4 py-3">
                  <Select
                    value={c.status}
                    onValueChange={(value) =>
                      update.mutate(
                        { id: c.id, status: value as Customer["status"] },
                        {
                          onSuccess: () => toast.success("Estado actualizado"),
                          onError: () => toast.error("No pudimos actualizar el estado"),
                        },
                      )
                    }
                  >
                    <SelectTrigger className="h-9 w-36">
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
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={whatsappUrl(c.phone, `¡Hola ${c.name}! Te escribimos de RIKO 🍔`)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No hay clientes con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
