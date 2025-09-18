// src/components/filters/segmentedFulfillment.tsx
import Link from "next/link";
import { homeHref } from "@/lib/url";

export default function SegmentedFulfillment({
  mode, q, cat,
}: { mode: "pickup" | "delivery"; q: string|null; cat: string|null }) {
  return (
    <div className="join border rounded-full overflow-hidden">
      <Link
        href={homeHref({ q, cat, mode: "pickup" })}
        className={`btn join-item rounded-full px-5 ${mode === "pickup" ? "btn-neutral" : "btn-ghost"}`}
      >
        Pickup
      </Link>
      <Link
        href={homeHref({ q, cat, mode: "delivery" })}
        className={`btn join-item rounded-full px-5 ${mode === "delivery" ? "btn-neutral" : "btn-ghost"}`}
      >
        Delivery
      </Link>
    </div>
  );
}
