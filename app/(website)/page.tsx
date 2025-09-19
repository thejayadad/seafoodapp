// src/app/page.tsx
export const dynamic = "force-dynamic";

import Hero from "@/components/hero/hero";
import CategorySelect from "@/components/filters/category-select";
import SearchForm from "@/components/filters/search-form";
import SegmentedFulfillment from "@/components/filters/segmentedFulfillment";
import TimePill from "@/components/filters/timepill";
import OrderSummaryCard from "@/components/filters/order-summary";
import { FeedWrapper } from "@/components/ui/feed-wrapper";
import { StickyWrapper } from "@/components/ui/sticky-wrapper";
import { getItemsByFilters } from "@/components/filters/data-fetchers";
import ItemCard from "@/components/order/item-card-add";
import SeaNotice from "@/components/ui/sea-notice";

export const metadata = {
  title: "Dockside Bites — Online Seafood Ordering",
};

type PageProps = {
  searchParams?: {
    q?: string;
    cat?: string;
    mode?: "pickup" | "delivery";
  };
};

export default async function HomePage({ searchParams }: PageProps) {
  const q = searchParams?.q ?? null;
  const cat = searchParams?.cat ?? null;
  const mode = searchParams?.mode === "delivery" ? "delivery" : "pickup";

  const categories = await getItemsByFilters({ q, cat });

  return (
    <div>
      {/* HERO */}
      <Hero
        title="Dockside Bites"
        address="123 Pier Avenue, Harbor City"
        hours="until 8:30 PM"
        infoHref="/about"
      />

      {/* STICKY FILTERS */}
      <div className="max-w-7xl mx-auto sm:px-2 py-6 sticky top-14 bg-base-100 z-50">
        <div className="flex items-center gap-4 border-b border-neutral-200 pb-3">
          <CategorySelect active={cat} q={q} />
          <div className="flex-1">
            <SearchForm q={q} cat={cat} />
          </div>
          <div className="hidden md:flex items-center gap-3">
            <SegmentedFulfillment mode={mode} q={q} cat={cat} />
            <TimePill />
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="flex flex-row-reverse max-w-7xl mx-auto gap-[48px] px-4">
        <StickyWrapper>
          <OrderSummaryCard />
        </StickyWrapper>

        <FeedWrapper>
  <section className="space-y-8">
    <h2 className="text-xl font-semibold">
      {cat ? "Category Items" : q ? "Search Results" : "Popular Items"}
    </h2>

    {categories.flatMap((c) => c.items).length === 0 ? (
      <SeaNotice
        tone="neutral"
        icon="waves"
        message={
          q
            ? `We couldn’t find anything matching “${q}”. Try a different search.`
            : cat
            ? "No items in this category yet. Please pick another."
            : "Please choose a category to browse items."
        }
      />
    ) : (
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.flatMap((c) => c.items).map((it) => (
          <ItemCard
            key={it.id}
            id={it.id}
            slug={it.slug}
            name={it.name}
            description={it.description}
            priceCents={it.priceCents}
          />
        ))}
      </div>
    )}
  </section>
</FeedWrapper>
      </div>
    </div>
  );
}
