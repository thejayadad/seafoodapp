// src/components/filters/search-form.tsx
import { Search } from "lucide-react";
import SearchReset from "./search-reset";

export default function SearchForm({ q, cat }: { q: string|null; cat: string|null }) {
  return (
    <form action="/" method="GET" className="relative w-full max-w-xl">
      <div className="absolute inset-y-0 left-3 flex items-center">
        <Search className="h-4 w-4 opacity-60" />
      </div>
      <input
        type="search"
        name="q"
        defaultValue={q ?? ""}
        placeholder="Search"
        className="input input-bordered h-11 w-full pl-10 pr-16 rounded-md"
      />
      {cat ? <input name="cat" type="hidden" value={cat} /> : null}
      <div className="absolute inset-y-0 right-1 flex items-center">
        <SearchReset q={q} cat={cat} />
      </div>
    </form>
  );
}
