

Dockside Bites — Hero Section (SSR-only) — Documentation

Overview
--------
This Hero is fully SSR (no "use client") and modular, matching the look of modern ordering pages.
It splits the UI into tiny presentational components so a junior dev can drop them in and a senior dev
can swap/extend pieces without touching the rest.

Files
-----
src/app/_components/hero/Bullet.tsx
src/app/_components/hero/HeroTitle.tsx
src/app/_components/hero/HeroMeta.tsx
src/app/_components/hero/Hero.tsx
src/app/page.tsx  (example usage)

Design Goals (JR → SR)
----------------------
- JR:
  - Pure SSR components: easy to paste, no client code or hooks.
  - Small props surface: pass `title`, `address`, `hours`, optional `infoHref`.
  - Neutral background band that aligns with header width and spacing.
- SR:
  - Presentation-only components; compute hours/address upstream (DB/CMS) and pass strings down.
  - `Bullet` is a11y-friendly (aria-hidden) and ensures consistent spacing.
  - Uses Tailwind/DaisyUI tokens: `bg-base-200`, `max-w-7xl`, `py-8..12` for rhythm.

Code
----
1) src/app/_components/hero/Bullet.tsx
--------------------------------------
```tsx
// Small visual separator • with a11y-friendly markup
export default function Bullet() {
  return (
    <span aria-hidden className="mx-2 select-none opacity-60">
      &bull;
    </span>
  );
}
```

2) src/app/_components/hero/HeroTitle.tsx
-----------------------------------------
```tsx
type Props = { title: string };
export default function HeroTitle({ title }: Props) {
  return (
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
      {title}
    </h1>
  );
}
```

3) src/app/_components/hero/HeroMeta.tsx
----------------------------------------
```tsx
import Link from "next/link";
import Bullet from "./Bullet";

type Props = {
  address: string;
  hours: string;
  infoHref?: string; // e.g. /about or external link
};

export default function HeroMeta({ address, hours, infoHref }: Props) {
  return (
    <p className="text-sm sm:text-base opacity-80">
      <span className="whitespace-pre">{address}</span>
      <Bullet />
      <span className="whitespace-pre">Open {hours}</span>
      {infoHref ? (
        <>
          <Bullet />
          <Link href={infoHref} className="link">
            More Info
          </Link>
        </>
      ) : null}
    </p>
  );
}
```

4) src/app/_components/hero/Hero.tsx
------------------------------------
```tsx
import HeroTitle from "./HeroTitle";
import HeroMeta from "./HeroMeta";

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
    <section className={`w-full bg-base-200 ${className ?? ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        <HeroTitle title={title} />
        <div className="mt-3 sm:mt-4">
          <HeroMeta address={address} hours={hours} infoHref={infoHref} />
        </div>
      </div>
    </section>
  );
}
```

5) Example usage — src/app/page.tsx
-----------------------------------
```tsx
import Hero from "./_components/hero/Hero";

export default async function Home() {
  return (
    <>
      <Hero
        title="Dockside Bites"
        address="123 Pier Avenue, Harbor City"
        hours="until 8:30 PM"
        infoHref="/about"
      />
      {/* rest of your page content… */}
    </>
  );
}
```

Extensibility
-------------
- Add `HeroCompact` with smaller typography/padding for sub-pages.
- Localize strings by passing translated `title/address/hours` props.
- Move hours logic into a server helper that formats business hours consistently.

Testing Notes
-------------
- Screenshot test the hero at sm/md/lg to verify typography steps.
- Ensure the bullet separators collapse correctly if `infoHref` is omitted.
- Validate contrast against `bg-base-200` with your chosen DaisyUI theme.
