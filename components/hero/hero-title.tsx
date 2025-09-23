'use client'
import {useEffect, useState} from "react"

type Props = { title: string };
export default function HeroTitle({ title }: Props) {
    const [show, setShow] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 200)
    return () => clearTimeout(timeout)
  }, [])
  return (
    <h1 className={`
    text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight transform transition-all duration-700 ${
      show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
    }
    `}>
      {title}
    </h1>
  );
}
