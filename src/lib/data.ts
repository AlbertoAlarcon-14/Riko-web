import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SETTINGS } from "@/lib/riko";

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  available: boolean;
  featured: boolean;
  is_demo: boolean;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  birthday: string | null;
  source: string | null;
  marketing_consent: boolean;
  status: "nuevo" | "recurrente" | "frecuente" | "inactivo";
  last_interaction: string;
  created_at: string;
};

export type Feedback = {
  id: string;
  customer_id: string | null;
  rating: number;
  comment: string | null;
  source: string | null;
  status: string;
  created_at: string;
};

export type QrSource = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  created_at: string;
};

export type Campaign = {
  id: string;
  name: string;
  segment: string;
  message: string;
  status: string;
  target_count: number;
  created_at: string;
};

/* ---------------------------------- public --------------------------------- */

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("id,name,slug,sort_order,active")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,description,price,image_url,category_id,available,featured,is_demo",
        )
        .order("created_at");
      if (error) throw error;
      return (data ?? []).map((p) => ({ ...p, price: Number(p.price) })) as Product[];
    },
  });
}

export function useSettings() {
  const query = useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.from("settings").select("key,value");
      if (error) throw error;
      const map: Record<string, string> = { ...DEFAULT_SETTINGS };
      for (const row of data ?? []) {
        if (row.value) map[row.key] = row.value;
      }
      return map;
    },
  });
  return { settings: query.data ?? DEFAULT_SETTINGS, ...query };
}

export function useQrSources() {
  return useQuery({
    queryKey: ["qr_sources"],
    queryFn: async (): Promise<QrSource[]> => {
      const { data, error } = await supabase
        .from("qr_sources")
        .select("id,name,code,active,created_at")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as QrSource[];
    },
  });
}

/* ----------------------------- admin-only reads ---------------------------- */

export function useCustomers(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["customers"],
    queryFn: async (): Promise<Customer[]> => {
      const { data, error } = await supabase
        .from("customers")
        .select(
          "id,name,phone,birthday,source,marketing_consent,status,last_interaction,created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Customer[];
    },
  });
}

export function useFeedback(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["feedback"],
    queryFn: async (): Promise<Feedback[]> => {
      const { data, error } = await supabase
        .from("feedback")
        .select("id,customer_id,rating,comment,source,status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Feedback[];
    },
  });
}

export function useQrScans(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["qr_scans"],
    queryFn: async (): Promise<{ code: string; created_at: string }[]> => {
      const { data, error } = await supabase
        .from("qr_scans")
        .select("code,created_at")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCampaigns(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["campaigns"],
    queryFn: async (): Promise<Campaign[]> => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id,name,segment,message,status,target_count,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Campaign[];
    },
  });
}

/* -------------------------------- mutations -------------------------------- */

export function useInvalidate(keys: string[]) {
  const qc = useQueryClient();
  return () => keys.forEach((key) => void qc.invalidateQueries({ queryKey: [key] }));
}

export function useRegisterCustomer() {
  return useMutation({
    mutationFn: async (input: {
      name: string;
      phone: string;
      birthday?: string | null;
      source?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("customers")
        .insert({
          name: input.name,
          phone: input.phone,
          birthday: input.birthday || null,
          source: input.source || null,
          marketing_consent: true,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateFeedback() {
  return useMutation({
    mutationFn: async (input: {
      rating: number;
      comment?: string | null;
      source?: string | null;
      customer_id?: string | null;
    }) => {
      const { error } = await supabase.from("feedback").insert({
        rating: input.rating,
        comment: input.comment || null,
        source: input.source || null,
        customer_id: input.customer_id || null,
      });
      if (error) throw error;
    },
  });
}

export async function trackQrScan(code: string) {
  await supabase.from("qr_scans").insert({ code });
}

/* ------------------------------ admin mutations ---------------------------- */

export type ProductInput = {
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category_id?: string | null;
  available: boolean;
  featured: boolean;
};

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput & { id?: string }) => {
      const payload = {
        name: input.name,
        description: input.description || null,
        price: input.price,
        image_url: input.image_url || null,
        category_id: input.category_id || null,
        available: input.available,
        featured: input.featured,
        is_demo: false,
      };
      if (input.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateCustomerStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: Customer["status"] }) => {
      const { error } = await supabase
        .from("customers")
        .update({ status: input.status, last_interaction: new Date().toISOString() })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateFeedbackStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: string }) => {
      const { error } = await supabase
        .from("feedback")
        .update({ status: input.status })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["feedback"] }),
  });
}

export function useSaveQrSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; name: string; code: string; active: boolean }) => {
      if (input.id) {
        const { error } = await supabase
          .from("qr_sources")
          .update({ name: input.name, code: input.code, active: input.active })
          .eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("qr_sources")
          .insert({ name: input.name, code: input.code, active: input.active });
        if (error) throw error;
      }
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["qr_sources"] }),
  });
}

export function useDeleteQrSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("qr_sources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["qr_sources"] }),
  });
}

export function useSaveCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      segment: string;
      message: string;
      target_count: number;
      status?: string;
    }) => {
      const { error } = await supabase.from("campaigns").insert({
        name: input.name,
        segment: input.segment,
        message: input.message,
        target_count: input.target_count,
        status: input.status ?? "borrador",
      });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const rows = Object.entries(values).map(([key, value]) => ({ key, value }));
      const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}
