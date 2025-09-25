// src/app/admin/menu-mock/page.tsx
"use client";

import { useMemo, useState } from "react";

/* ===================== Types (aligned to your Prisma) ===================== */
type Category = {
  id: string;
  name: string;
  slug: string;
  index: number;
  createdAt: Date;
  updatedAt: Date;
};

type MenuItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageUrl?: string;
  isAvailable: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

/* ===================== Mock seeds ===================== */
const seedCats: Category[] = [
  mkCat("Rolls", 0),
  mkCat("Plates", 1),
  mkCat("Sides", 2),
];

const seedItems: MenuItem[] = [
  mkItem("Lobster Roll", "Fresh lobster, toasted bun", 1799, seedCats[0].id, "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200"),
  mkItem("Crab Roll", "Sweet crab meat, lemon aioli", 1599, seedCats[0].id),
  mkItem("Fish & Chips", "Crispy cod, fries, tartar", 1299, seedCats[1].id, "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=1200"),
  mkItem("Grilled Salmon", "Herb butter, lemon", 1499, seedCats[1].id),
  mkItem("Clam Chowder", "New England style", 899, seedCats[2].id),
  mkItem("Coleslaw", "House-made slaw", 399, seedCats[2].id),
];

/* ===================== Helpers ===================== */
function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function mkCat(name: string, index: number): Category {
  const now = new Date();
  return {
    id: mkId("cat"),
    name,
    slug: slugify(name),
    index,
    createdAt: now,
    updatedAt: now,
  };
}
function mkItem(
  name: string,
  description: string,
  priceCents: number,
  categoryId: string,
  imageUrl?: string
): MenuItem {
  const now = new Date();
  return {
    id: mkId("itm"),
    name,
    slug: slugify(name),
    description,
    priceCents,
    imageUrl,
    isAvailable: true,
    categoryId,
    createdAt: now,
    updatedAt: now,
  };
}
function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

/* ===================== Page ===================== */
export default function MenuMockPage() {
  const [cats, setCats] = useState<Category[]>(seedCats);
  const [items, setItems] = useState<MenuItem[]>(seedItems);
  const [activeCatId, setActiveCatId] = useState<string>(cats[0]?.id ?? "");
  const [query, setQuery] = useState("");

  const activeCat = cats.find((c) => c.id === activeCatId) ?? cats[0];
  const itemsInActiveCat = items
    .filter((i) => i.categoryId === activeCat?.id)
    .sort((a, b) => orderIndex(items, a, activeCat?.id) - orderIndex(items, b, activeCat?.id));

  const filteredAllItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (cats.find((c) => c.id === i.categoryId)?.name.toLowerCase() ?? "").includes(q)
    );
  }, [items, cats, query]);

  /* ---------- Category Actions ---------- */
  function createCategory() {
    const name = prompt("Category name?");
    if (!name) return;
    const exists = cats.some((c) => c.slug === slugify(name));
    const cat = mkCat(exists ? `${name} ${cats.length + 1}` : name, cats.length);
    setCats((prev) => [...prev, cat]);
    setActiveCatId(cat.id);
  }
  function renameCategory(id: string) {
    const cat = cats.find((c) => c.id === id);
    if (!cat) return;
    const name = prompt("New category name:", cat.name);
    if (!name) return;
    const updated: Category = { ...cat, name, slug: slugify(name), updatedAt: new Date() };
    setCats((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }
  function deleteCategory(id: string) {
    const count = items.filter((i) => i.categoryId === id).length;
    if (count > 0 && !confirm(`Delete category with ${count} item(s)? They will be moved to "Uncategorized".`)) return;
    // Ensure "Uncategorized"
    let unc = cats.find((c) => c.slug === "uncategorized");
    if (!unc) {
      unc = mkCat("Uncategorized", cats.length);
      setCats((prev) => [...prev, unc!]);
    }
    // Move items
    setItems((prev) => prev.map((i) => (i.categoryId === id ? { ...i, categoryId: unc!.id } : i)));
    setCats((prev) => prev.filter((c) => c.id !== id));
    if (activeCatId === id) setActiveCatId(unc!.id);
  }
  function reorderCategory(id: string, dir: -1 | 1) {
    setCats((prev) => {
      const sorted = [...prev].sort((a, b) => a.index - b.index);
      const idx = sorted.findIndex((c) => c.id === id);
      const to = Math.min(Math.max(idx + dir, 0), sorted.length - 1);
      [sorted[idx].index, sorted[to].index] = [sorted[to].index, sorted[idx].index];
      return [...sorted];
    });
  }

  /* ---------- Item Actions ---------- */
  function addItem(catId: string) {
    const name = prompt("Item name?");
    if (!name) return;
    const priceStr = prompt("Price (e.g. 12.99)?", "9.99");
    const cents = Math.round(Number(priceStr) * 100) || 0;
    const it = mkItem(name, "", cents, catId);
    setItems((prev) => [...prev, it]);
  }
  function editItem(id: string) {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    const name = prompt("Name:", it.name) ?? it.name;
    const desc = prompt("Description:", it.description) ?? it.description;
    const price = prompt("Price (e.g. 12.99):", (it.priceCents / 100).toFixed(2)) ?? (it.priceCents / 100).toFixed(2);
    const url = prompt("Image URL (optional):", it.imageUrl ?? "") ?? it.imageUrl ?? "";
    const cents = Math.round(Number(price) * 100) || 0;
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              name,
              slug: slugify(name),
              description: desc,
              priceCents: cents,
              imageUrl: url || undefined,
              updatedAt: new Date(),
            }
          : x
      )
    );
  }
  function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  }
  function toggleAvailability(id: string) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, isAvailable: !x.isAvailable } : x)));
  }
  function moveItem(id: string, toCatId: string) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, categoryId: toCatId } : x)));
  }
  function reorderItemWithinCategory(id: string, dir: -1 | 1) {
    // purely visual: swap order by array order within filtered list
    const list = itemsInActiveCat.map((x) => x.id);
    const idx = list.indexOf(id);
    const to = Math.min(Math.max(idx + dir, 0), list.length - 1);
    if (idx === to) return;
    // rebuild items array in that category order
    const reorderedIds = [...list];
    [reorderedIds[idx], reorderedIds[to]] = [reorderedIds[to], reorderedIds[idx]];
    setItems((prev) => {
      const inCat = prev.filter((x) => x.categoryId === activeCatId);
      const outCat = prev.filter((x) => x.categoryId !== activeCatId);
      const reordered = reorderedIds.map((rid) => inCat.find((x) => x.id === rid)!);
      return [...outCat, ...reordered];
    });
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 lg:p-8 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Menu Manager (Mock)</h1>
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={createCategory}>+ New Category</button>
          <input
            className="input input-bordered input-sm w-64"
            placeholder="Search items or categories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        {/* Sidebar: Categories */}
        <aside className="rounded-xl border bg-white">
          <div className="p-3 border-b text-sm font-semibold">Categories</div>
          <ul className="divide-y">
            {cats.sort((a, b) => a.index - b.index).map((c) => (
              <li key={c.id} className={`flex items-center gap-2 px-3 py-2 ${activeCatId === c.id ? "bg-neutral-50" : ""}`}>
                <button
                  className="text-left flex-1 hover:underline"
                  onClick={() => setActiveCatId(c.id)}
                  title={c.slug}
                >
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs opacity-60">/{c.slug}</div>
                </button>
                <div className="join">
                  <button className="btn btn-xs join-item" title="Up" onClick={() => reorderCategory(c.id, -1)}>↑</button>
                  <button className="btn btn-xs join-item" title="Down" onClick={() => reorderCategory(c.id, +1)}>↓</button>
                </div>
                <details className="dropdown dropdown-end">
                  <summary className="btn btn-ghost btn-xs">⋯</summary>
                  <ul className="menu dropdown-content bg-base-100 rounded-box shadow p-2 z-10 w-40">
                    <li><button onClick={() => renameCategory(c.id)}>Rename</button></li>
                    <li><button className="text-error" onClick={() => deleteCategory(c.id)}>Delete</button></li>
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main: Items in active category */}
        <main className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{activeCat?.name ?? "—"}</h2>
              <div className="text-xs opacity-60">/{activeCat?.slug}</div>
            </div>
            <button className="btn btn-sm" onClick={() => addItem(activeCat?.id ?? cats[0]?.id ?? "")}>+ Add Item</button>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {itemsInActiveCat.length === 0 && (
              <div className="col-span-full text-sm opacity-60 border rounded-xl bg-white p-6">
                No items yet. Click <b>+ Add Item</b> to create your first menu item.
              </div>
            )}

            {itemsInActiveCat.map((it, idx) => {
              const catOptions = cats.sort((a, b) => a.index - b.index);
              return (
                <div key={it.id} className="rounded-xl border bg-white p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg bg-neutral-100 overflow-hidden flex items-center justify-center">
                      {it.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs opacity-50">No image</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium">{it.name}</div>
                        <span className={`badge ${it.isAvailable ? "badge-success" : "badge-ghost"}`}>
                          {it.isAvailable ? "Available" : "Hidden"}
                        </span>
                      </div>
                      <div className="text-xs opacity-60 break-all">/{it.slug}</div>
                      <div className="text-sm mt-1">{it.description || <span className="opacity-40 italic">No description</span>}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">{money(it.priceCents)}</div>
                    <div className="join">
                      <button className="btn btn-xs join-item" title="Move up" disabled={idx === 0} onClick={() => reorderItemWithinCategory(it.id, -1)}>↑</button>
                      <button className="btn btn-xs join-item" title="Move down" disabled={idx === itemsInActiveCat.length - 1} onClick={() => reorderItemWithinCategory(it.id, +1)}>↓</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button className="btn btn-xs" onClick={() => editItem(it.id)}>Edit</button>
                    <button className="btn btn-xs" onClick={() => toggleAvailability(it.id)}>
                      {it.isAvailable ? "Hide" : "Show"}
                    </button>
                    <select
                      className="select select-bordered select-xs col-span-2"
                      value={activeCat?.id}
                      onChange={(e) => moveItem(it.id, e.target.value)}
                      title="Move to category"
                    >
                      {catOptions.map((c) => (
                        <option key={c.id} value={c.id}>{`Move to: ${c.name}`}</option>
                      ))}
                    </select>
                    <button className="btn btn-xs btn-error col-span-2" onClick={() => deleteItem(it.id)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Global search panel (quick view across all items) */}
          {query && (
            <section className="space-y-3">
              <h3 className="font-semibold">Search results</h3>
              <div className="rounded-xl border bg-white overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b">
                    <tr>
                      <Th>Item</Th>
                      <Th>Category</Th>
                      <Th>Price</Th>
                      <Th>Avail</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAllItems.map((it) => {
                      const cat = cats.find((c) => c.id === it.categoryId);
                      return (
                        <tr key={it.id} className="border-b last:border-0">
                          <Td className="whitespace-nowrap">{it.name}</Td>
                          <Td className="whitespace-nowrap">{cat?.name ?? "—"}</Td>
                          <Td>{money(it.priceCents)}</Td>
                          <Td>{it.isAvailable ? "Yes" : "No"}</Td>
                          <Td>
                            <div className="flex gap-2">
                              <button className="btn btn-xs" onClick={() => { setActiveCatId(it.categoryId); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                                Open
                              </button>
                              <button className="btn btn-xs" onClick={() => editItem(it.id)}>Edit</button>
                            </div>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>

      <footer className="text-xs opacity-60">
        Mock interface. Replace prompts with modals/forms and wire to Prisma + Server Actions later.
      </footer>
    </div>
  );
}

/* ===================== Small UI helpers ===================== */
function orderIndex(all: MenuItem[], m: MenuItem, catId?: string) {
  // visual order = array order within category slice
  return all.filter((x) => x.categoryId === (catId ?? m.categoryId)).findIndex((x) => x.id === m.id);
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>;
}
