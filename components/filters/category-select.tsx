// src/components/filters/category-select.tsx
import { homeHref } from "@/lib/url";
import Link from "next/link";
import { getCategoriesBare } from "./data-fetchers";
import { ChevronDown } from "lucide-react";

export default async function CategorySelect({
  active,
  q,
}: {
  active: string | null;
  q: string | null;
}) {
  const cats = await getCategoriesBare();
  const currentLabel =
    cats.find((c) => c.slug === active)?.name ?? "Categories";

  const linkTo = (slug: string | null) => homeHref({ q, cat: slug });

  return (
    <div className="dropdown">
      {/* Trigger uses focus, so clicking outside closes the menu */}
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost h-11 min-h-0 px-3 rounded-md
                   border border-neutral-200
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200"
        aria-haspopup="listbox"
        aria-expanded="false"
      >
        <span className="mr-2 truncate max-w-[9rem]">{currentLabel}</span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </div>

      <ul
        tabIndex={0}
        className="menu dropdown-content z-[1] mt-2 w-56 p-2 rounded-box
                   bg-base-100 shadow
                   border border-neutral-200"
        role="listbox"
      >
        <li>
          <Link
            href={linkTo(null)}
            className={`rounded-md border border-transparent
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200
                        ${!active ? "active" : ""}`}
            role="option"
            aria-selected={!active}
          >
            All
          </Link>
        </li>

        {cats.map((c) => (
          <li key={c.id}>
            <Link
              href={linkTo(c.slug)}
              className={`rounded-md border border-transparent
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200
                          ${active === c.slug ? "active" : ""}`}
              role="option"
              aria-selected={active === c.slug}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
