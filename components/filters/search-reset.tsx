// src/components/filters/search-reset.tsx
import { X } from "lucide-react";
import Link from "next/link";
import { homeHref } from "@/lib/url";

export default function SearchReset({ q, cat }: { q: string|null; cat: string|null }) {
  if (!q) return null;
  return (
    <Link href={homeHref({ q: null, cat })} aria-label="Clear search" className="btn btn-ghost btn-xs rounded-full">
      <X className="h-3.5 w-3.5" />
    </Link>
  );
}
