// src/app/_components/layout/FixedRightAside.tsx
// Renders children fixed on the right for ≥lg; hidden on smaller screens.
// The 'placeholderWidth' reserves layout space in the grid column.
export default function FixedRightAside({
  children,
  topPx = 96,            // ~header(64) + spacing(32)
  insetPaddingPx = 24,   // container inner padding (px)
  containerMaxRem = 80,  // Tailwind max-w-7xl = 80rem
}: {
  children: React.ReactNode;
  topPx?: number;
  insetPaddingPx?: number;
  containerMaxRem?: number;
}) {
  // Right offset aligns to: (viewport - min(viewport, containerMax)) / 2 + insetPadding
  const style = {
    top: `calc(${topPx}px)`,
    right: `calc((100vw - min(100vw, ${containerMaxRem}rem)) / 2 + ${insetPaddingPx}px)`,
  } as React.CSSProperties;

  return (
    <>
      {/* The fixed element (only ≥lg) */}
      <div
        className="hidden lg:block fixed z-30"
        style={style}
      >
        {children}
      </div>

      {/* NOTE: The caller should render an empty column (placeholder) inside the grid
          so layout reserves space where this fixed aside sits. */}
    </>
  );
}
