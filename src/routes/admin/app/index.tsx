import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareHeart, QrCode, Star, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminShell } from "@/components/admin-shell";
import { useCustomers, useFeedback, useProducts, useQrScans } from "@/lib/data";

export const Route = createFileRoute("/admin/app/")({
  head: () => ({
    meta: [
      { title: "Panel de control · RIKO Admin" },
      { name: "description", content: "Métricas de clientes, opiniones y escaneos QR de RIKO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card-riko p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <Icon className="size-4 text-accent" />
      </div>
      <p className="mt-3 font-display text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function lastDays(n: number) {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function AdminDashboard() {
  const customers = useCustomers();
  const feedback = useFeedback();
  const scans = useQrScans();
  const products = useProducts();

  const rows = customers.data ?? [];
  const opinions = feedback.data ?? [];
  const scanRows = scans.data ?? [];

  const avg =
    opinions.length > 0
      ? (opinions.reduce((sum, f) => sum + f.rating, 0) / opinions.length).toFixed(1)
      : "—";

  const days = lastDays(14);
  const trend = days.map((day) => ({
    day: day.slice(5),
    clientes: rows.filter((c) => c.created_at.slice(0, 10) === day).length,
    opiniones: opinions.filter((f) => f.created_at.slice(0, 10) === day).length,
  }));

  const byCode = Object.entries(
    scanRows.reduce<Record<string, number>>((acc, s) => {
      acc[s.code] = (acc[s.code] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([code, total]) => ({ code, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return (
    <AdminShell title="Panel de control" description="Resumen de los últimos movimientos de RIKO.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Users}
          label="Clientes Club Riko"
          value={String(rows.length)}
          hint={`${rows.filter((c) => c.status === "frecuente").length} frecuentes`}
        />
        <Metric
          icon={Star}
          label="Calificación promedio"
          value={avg}
          hint={`${opinions.length} opiniones`}
        />
        <Metric
          icon={QrCode}
          label="Escaneos QR"
          value={String(scanRows.length)}
          hint={`${byCode.length} puntos activos`}
        />
        <Metric
          icon={MessageSquareHeart}
          label="Productos publicados"
          value={String((products.data ?? []).filter((p) => p.available).length)}
          hint={`${(products.data ?? []).length} en total`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-riko p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Últimos 14 días
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Line type="monotone" dataKey="clientes" stroke="var(--chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="opiniones" stroke="var(--chart-2)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-riko p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Escaneos por punto QR
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCode}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="code" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="total" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-riko mt-6 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Últimas opiniones
        </h2>
        <ul className="mt-4 divide-y divide-border">
          {opinions.slice(0, 6).map((f) => (
            <li key={f.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm">{f.comment || "Sin comentario"}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(f.created_at).toLocaleString("es-CO")} · {f.source ?? "directo"}
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold text-accent">{f.rating}/4</span>
            </li>
          ))}
          {opinions.length === 0 && (
            <li className="py-3 text-sm text-muted-foreground">Aún no hay opiniones.</li>
          )}
        </ul>
      </div>
    </AdminShell>
  );
}
