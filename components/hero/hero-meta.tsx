// src/app/_components/hero/HeroMeta.tsx
import Link from "next/link";
import Bullet from "./bullet";

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
