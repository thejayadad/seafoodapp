// src/app/_components/header/Brand.tsx
import Link from "next/link";

export default function Brand() {
  return (
    <Link href="/" className="inline-flex items-baseline gap-2">
      <span className="text-lg font-semibold tracking-tight">Dockside Bites</span>
      <span className="text-xs opacity-70 hidden sm:inline">• Order Online</span>
    </Link>
  );
}
