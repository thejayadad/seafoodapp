// src/app/_components/hero/HeroTitle.tsx
type Props = { title: string };
export default function HeroTitle({ title }: Props) {
  return (
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
      {title}
    </h1>
  );
}
