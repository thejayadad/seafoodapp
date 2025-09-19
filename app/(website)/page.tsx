// src/app/page.tsx
export const dynamic = "force-dynamic";

import Hero from "@/components/hero/hero";
import CategorySelect from "@/components/filters/category-select";
import SearchForm from "@/components/filters/search-form";
import SegmentedFulfillment from "@/components/filters/segmentedFulfillment";
import TimePill from "@/components/filters/timepill";
import { getItemsByFilters } from "@/components/filters/data-fetchers";
import OrderSummaryCard from "@/components/filters/order-summary";
import SeaNotice from "@/components/ui/sea-notice";
import { FeedWrapper } from "@/components/ui/feed-wrapper";
import { StickyWrapper } from "@/components/ui/sticky-wrapper";
import ItemCard from "@/components/order/item-card-add";

type PageProps = {
  searchParams?: { q?: string; cat?: string; mode?: "pickup" | "delivery" };
};

export default async function HomePage({ searchParams }: PageProps) {
  const q = searchParams?.q ?? null;
  const cat = searchParams?.cat ?? null;
  const mode: "pickup" | "delivery" =
    searchParams?.mode === "delivery" ? "delivery" : "pickup";

  const categories = await getItemsByFilters({ q, cat });
  const flatItems = categories.flatMap((c) => c.items);

  // Temporary static options (replace with DB-driven later)
  const defaultSizes = [
    { id: "sm", label: "Small", deltaCents: 0, required: true },
    { id: "lg", label: "Large", deltaCents: 200 },
    { id: "pan", label: "Pan", deltaCents: 1700 },
  ] as const;

  const defaultAddons = [
    { id: "green-onion", label: "Extra Green Onions", deltaCents: 50 },
    { id: "veg", label: "Extra Vegetables", deltaCents: 100 },
    { id: "extra-meat", label: "Extra Meat", deltaCents: 200 },
  ] as const;

  return (
    <div>
      <Hero
        title="Dockside Bites"
        address="123 Pier Avenue, Harbor City"
        hours="until 8:30 PM"
        infoHref="/about"
      />

      {/* Sticky Filters under header */}
      <div className="max-w-7xl mx-auto sm:px-2 py-6 sticky top-14 z-50 bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/80">
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

      {/* Main two-column layout */}
      <div className="flex flex-row-reverse max-w-7xl mx-auto gap-[48px] px-4">
        {/* Right rail */}
        <StickyWrapper>
          <OrderSummaryCard />
        </StickyWrapper>

        {/* Left feed */}
        <FeedWrapper>
          <section className="space-y-8">
            <h2 className="text-xl font-semibold">Popular Items</h2>

            {flatItems.length === 0 ? (
              <SeaNotice
                message={
                  q || cat
                    ? "We’re out at sea finding this one — try a different search or category."
                    : "We’re prepping today’s fresh catch — check back soon!"
                }
                icon={q || cat ? "ship" : "waves"}
                tone={q || cat ? "info" : "neutral"}
                className="my-6"
              />
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {flatItems.map((it) => (
                  <ItemCard
                    key={it.id}
                    id={it.id}
                    slug={it.slug}
                    name={it.name}
                    description={it.description}
                    priceCents={it.priceCents}
                    sizes={defaultSizes as any}
                    addons={defaultAddons as any}
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
