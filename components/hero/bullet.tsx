
// src/app/_components/hero/Bullet.tsx
// Small visual separator • with a11y-friendly markup
export default function Bullet() {
  return (
    <span aria-hidden className="mx-2 select-none opacity-60">
      &bull;
    </span>
  );
}
