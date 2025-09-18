// src/app/_components/hero/Hero.tsx

import HeroMeta from "./hero-meta";
import HeroTitle from "./hero-title";


type Props = {
  title: string;
  address: string;
  hours: string;
  infoHref?: string;
  className?: string;
};

export default async function Hero({
  title,
  address,
  hours,
  infoHref = "/about",
  className,
}: Props) {
  // SSR-only: later you can compute hours from DB if needed
  return (
    <section className={`w-full hidden lg:inline-block bg-base-200 ${className ?? ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        <HeroTitle title={title} />
        <div className="mt-3 sm:mt-4">
          <HeroMeta address={address} hours={hours} infoHref={infoHref} />
        </div>
      </div>
    </section>
  );
}
