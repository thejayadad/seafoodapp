// src/lib/url.ts
export function homeHref(params: {
  q?: string | null;
  cat?: string | null;
  mode?: "pickup" | "delivery" | null;
}) {
  const p = new URLSearchParams();
  if (params.q) p.set("q", params.q);
  if (params.cat) p.set("cat", params.cat);
  if (params.mode) p.set("mode", params.mode);
  const qs = p.toString();
  return qs ? `/${qs ? "?" + qs : ""}` : `/`;
}
