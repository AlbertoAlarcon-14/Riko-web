const KEY = "riko_source";

export function rememberSource(source: string | null | undefined) {
  if (!source || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, source);
  } catch {
    /* ignore */
  }
}

export function readSource(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
