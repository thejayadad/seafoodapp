'use client'
import {useEffect, useState} from "react"
import Link from "next/link";
import Bullet from "./bullet";

type Props = {
  address: string;
  hours: string;
  infoHref?: string; // e.g. /about or external link
};

export default function HeroMeta({ address, hours, infoHref }: Props) {
      const [show, setShow] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 200)
    return () => clearTimeout(timeout)
  }, [])
  return (
    <p className={

      `text-sm sm:text-base opacity-80 transition-all duration-700 delay-150
      ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `
    }>
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
