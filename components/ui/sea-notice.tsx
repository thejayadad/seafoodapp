// SSR-only, ocean-y notice with neutral borders/outlines
import { Fish, Ship, Waves } from "lucide-react";

type IconName = "fish" | "ship" | "waves";
type Props = {
  message?: string;
  icon?: IconName;
  className?: string;
  tone?: "info" | "warning" | "neutral";
};

const Icon = ({ icon }: { icon: IconName }) => {
  const Cmp = icon === "ship" ? Ship : icon === "waves" ? Waves : Fish;
  return <Cmp className="h-4 w-4" aria-hidden />;
};

export default function SeaNotice({
  message = "We’re out gathering this item. Please check back soon!",
  icon = "fish",
  tone = "neutral",
  className,
}: Props) {
  const toneClasses =
    tone === "info"
      ? "bg-sky-50 text-sky-900"
      : tone === "warning"
      ? "bg-amber-50 text-amber-900"
      : "bg-base-100 text-neutral-800";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`alert ${toneClasses} border border-neutral-200 ${className ?? ""}`}
    >
      <Icon icon={icon} />
      <span className="text-sm">{message}</span>
    </div>
  );
}
