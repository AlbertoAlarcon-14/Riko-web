import { useEffect, type ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { trackQrScan } from "@/lib/data";
import { rememberSource } from "@/lib/source";

export function SiteShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const source = new URLSearchParams(window.location.search).get("source");
    if (!source) return;
    rememberSource(source);
    void trackQrScan(source);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
