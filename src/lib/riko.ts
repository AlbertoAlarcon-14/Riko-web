export const RESTAURANT_NAME = "RIKO BEER & GRILL";
export const CITY = "Duitama, Boyacá";

export const DEFAULT_SETTINGS: Record<string, string> = {
  brand_tagline: "El sabor que te hace volver.",
  whatsapp_number: "573001112233",
  address: "Duitama, Boyacá, Colombia",
  hours: "Lun a Dom · 12:00 m a 10:00 pm",
  instagram_url: "https://instagram.com/",
  facebook_url: "https://facebook.com/",
  maps_url: "https://www.google.com/maps?q=Duitama+Boyaca",
  google_reviews_url: "https://search.google.com/local/writereview?placeid=DEMO",
};

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function whatsappUrl(phone: string, message: string): string {
  const digits = (phone || DEFAULT_SETTINGS["whatsapp_number"]!).replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function orderMessage(opts: {
  product?: string;
  quantity?: number;
  source?: string | null;
}): string {
  const lines = [`¡Hola ${RESTAURANT_NAME}! Quiero hacer un pedido.`];
  if (opts.product) {
    lines.push(`• Producto: ${opts.product}${opts.quantity ? ` x${opts.quantity}` : ""}`);
  }
  if (opts.source) lines.push(`(Origen: ${opts.source})`);
  return lines.join("\n");
}

export const RATING_LABELS: Record<number, { label: string; emoji: string }> = {
  4: { label: "Excelente", emoji: "😍" },
  3: { label: "Buena", emoji: "🙂" },
  2: { label: "Regular", emoji: "😐" },
  1: { label: "Podemos mejorar", emoji: "😕" },
};

export const SEGMENTS = ["todos", "nuevo", "recurrente", "frecuente", "inactivo"] as const;

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}
