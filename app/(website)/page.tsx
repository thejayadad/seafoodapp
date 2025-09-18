import Hero from "@/components/hero/hero";

export default function Home() {
  return (
    <div>
        <Hero
        title="Dockside Bites"
        address="123 Pier Avenue, Harbor City"
        hours="until 8:30 PM"
        infoHref="/about"
      />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-4 border-b border-neutral-200 pb-3">
        Cat
        <div className="flex-1">
              SEARCH    
        </div>
        <div className="hidden md:flex items-center gap-3">
          SEGMENTED
        </div>
        </div>        
      </div>
    </div>
  );
}
