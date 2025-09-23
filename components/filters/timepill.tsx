// src/app/order/_components/TimePill.tsx
import { Clock3 } from "lucide-react";

export default function TimePill() {
  return (
    <div className="h-11 inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4">
      <Clock3 className="h-4 w-4 opacity-70" />
      <span className="text-sm">ASAP</span>
    </div>
  );
}
