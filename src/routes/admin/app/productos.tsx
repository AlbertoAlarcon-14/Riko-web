import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useCategories,
  useDeleteProduct,
  useProducts,
  useSaveProduct,
  type Product,
} from "@/lib/data";
import { formatCOP } from "@/lib/riko";

export const Route = createFileRoute("/admin/app/productos")({
  head: () => ({
    meta: [
      { title: "Productos del menú · RIKO Admin" },
      { name: "description", content: "Crea, edita y publica los platos del menú de RIKO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminProducts,
});

const schema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto"),
  price: z.number().min(0, "Precio inválido"),
});

type Draft = {
  id?: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category_id: string;
  available: boolean;
  featured: boolean;
};

const emptyDraft: Draft = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  category_id: "",
  available: true,
  featured: false,
};

function AdminProducts() {
  const products = useProducts();
  const categories = useCategories();
  const save = useSaveProduct();
  const remove = useDeleteProduct();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const openNew = () => {
    setDraft(emptyDraft);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setDraft({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      image_url: p.image_url ?? "",
      category_id: p.category_id ?? "",
      available: p.available,
      featured: p.featured,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name: draft.name, price: Number(draft.price) });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    save.mutate(
      {
        ...(draft.id ? { id: draft.id } : {}),

        name: parsed.data.name,
        description: draft.description,
        price: parsed.data.price,
        image_url: draft.image_url,
        category_id: draft.category_id || null,
        available: draft.available,
        featured: draft.featured,
      },
      {
        onSuccess: () => {
          toast.success(draft.id ? "Producto actualizado" : "Producto creado");
          setOpen(false);
        },
        onError: () => toast.error("No pudimos guardar el producto"),
      },
    );
  };

  const categoryName = (id: string | null) =>
    (categories.data ?? []).find((c) => c.id === id)?.name ?? "Sin categoría";

  return (
    <AdminShell title="Productos" description="Todo lo que ven tus clientes en el menú digital.">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="mr-2 size-4" /> NUEVO PRODUCTO
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{draft.id ? "Editar producto" : "Nuevo producto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="price">Precio (COP)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Categoría</Label>
                  <Select
                    value={draft.category_id}
                    onValueChange={(value) => setDraft({ ...draft, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Elige una" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories.data ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="image">Imagen (URL)</Label>
                <Input
                  id="image"
                  placeholder="https://…"
                  value={draft.image_url}
                  onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <span className="text-sm font-semibold">Disponible</span>
                <Switch
                  checked={draft.available}
                  onCheckedChange={(v) => setDraft({ ...draft, available: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <span className="text-sm font-semibold">Destacado en inicio</span>
                <Switch
                  checked={draft.featured}
                  onCheckedChange={(v) => setDraft({ ...draft, featured: v })}
                />
              </div>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "GUARDANDO…" : "GUARDAR"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="card-riko mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(products.data ?? []).map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold">{p.name}</p>
                  {p.is_demo && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-accent">
                      demo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{categoryName(p.category_id)}</td>
                <td className="px-4 py-3">{formatCOP(p.price)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.available ? "Disponible" : "Agotado"}
                  {p.featured ? " · Destacado" : ""}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!window.confirm(`¿Eliminar ${p.name}?`)) return;
                        remove.mutate(p.id, {
                          onSuccess: () => toast.success("Producto eliminado"),
                          onError: () => toast.error("No pudimos eliminarlo"),
                        });
                      }}
                    >
                      <Trash2 className="size-4 text-primary" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
