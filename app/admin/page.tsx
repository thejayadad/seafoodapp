// src/app/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELED";
type Mode = "PICKUP" | "DELIVERY";

/** ------------------ MOCK DATA ------------------ */
const mockOrders = [
  {
    id: "o_1",
    number: 1012,
    createdAt: new Date(Date.now() - 1000 * 60 * 12),
    customer: "Olivia R.",
    mode: "DELIVERY" as Mode,
    totalCents: 4825,
    status: "PENDING" as OrderStatus,
    address: { line1: "12 Harbor Way", city: "Boston", postal: "02115" },
    items: [
      { name: "Lobster Roll", qty: 2, priceCents: 1799 },
      { name: "Clam Chowder", qty: 1, priceCents: 899 },
    ],
    notes: "Leave at door",
  },
  {
    id: "o_2",
    number: 1011,
    createdAt: new Date(Date.now() - 1000 * 60 * 40),
    customer: "Sam N.",
    mode: "PICKUP" as Mode,
    totalCents: 2699,
    status: "PREPARING" as OrderStatus,
    items: [
      { name: "Fish & Chips", qty: 1, priceCents: 1299 },
      { name: "Iced Tea", qty: 1, priceCents: 299 },
      { name: "Grilled Salmon", qty: 1, priceCents: 1101 },
    ],
  },
  {
    id: "o_3",
    number: 1010,
    createdAt: new Date(Date.now() - 1000 * 60 * 70),
    customer: "Guest",
    mode: "DELIVERY" as Mode,
    totalCents: 1899,
    status: "READY" as OrderStatus,
    address: { line1: "88 Wharf St", city: "Cambridge", postal: "02139" },
    items: [
      { name: "Shrimp Po’ Boy", qty: 1, priceCents: 1299 },
      { name: "Chowder", qty: 1, priceCents: 600 },
    ],
  },
];

const mockCategories = [
  {
    id: "c1",
    name: "Rolls",
    items: [
      {
        id: "i1",
        name: "Lobster Roll",
        priceCents: 1799,
        available: true,
        slug: "lobster-roll",
        updatedAt: new Date(),
      },
      {
        id: "i2",
        name: "Crab Roll",
        priceCents: 1599,
        available: true,
        slug: "crab-roll",
        updatedAt: new Date(),
      },
    ],
  },
  {
    id: "c2",
    name: "Plates",
    items: [
      {
        id: "i3",
        name: "Fish & Chips",
        priceCents: 1299,
        available: true,
        slug: "fish-and-chips",
        updatedAt: new Date(),
      },
      {
        id: "i4",
        name: "Grilled Salmon",
        priceCents: 1499,
        available: false,
        slug: "grilled-salmon",
        updatedAt: new Date(),
      },
    ],
  },
];

const mockHours: Array<{ day: number; open: string; close: string }> = [
  { day: 0, open: "11:00", close: "18:00" },
  { day: 1, open: "11:00", close: "20:00" },
  { day: 2, open: "11:00", close: "20:00" },
  { day: 3, open: "11:00", close: "20:00" },
  { day: 4, open: "11:00", close: "21:00" },
  { day: 5, open: "10:30", close: "21:00" },
  { day: 6, open: "10:30", close: "19:00" },
];

const mockHolidays = [{ dateISO: "2025-11-27", reason: "Thanksgiving" }];
const mockZips = [{ postal: "02115" }, { postal: "02116" }, { postal: "02139" }];

/** ------------------ UTIL ------------------ */
function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** ------------------ SIDE TABS ------------------ */
const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "orders", label: "Orders", icon: "🧾" },
  { id: "menu", label: "Menu", icon: "🍤" },
  { id: "hours", label: "Hours & Closures", icon: "⏰" },
  { id: "delivery", label: "Delivery Zones", icon: "🚚" },
  { id: "settings", label: "Settings", icon: "⚙️" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function useHashTab(defaultTab: TabId): [TabId, (t: TabId) => void] {
  const [tab, setTab] = useState<TabId>(() => {
    if (typeof window === "undefined") return defaultTab;
    const h = window.location.hash.replace("#", "");
    return (TABS.find((t) => t.id === h)?.id ?? defaultTab) as TabId;
  });
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace("#", "");
      if (TABS.some((t) => t.id === h)) setTab(h as TabId);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const set = (t: TabId) => {
    setTab(t);
    if (typeof window !== "undefined") history.replaceState(null, "", `#${t}`);
  };
  return [tab, set];
}

/** ------------------ PAGE ------------------ */
export default function AdminMockPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [categories, setCategories] = useState(mockCategories);
  const [hours, setHours] = useState(mockHours);
  const [holidays, setHolidays] = useState(mockHolidays);
  const [zips, setZips] = useState(mockZips);
  const [tab, setTab] = useHashTab("overview");

  // KPIs
  const kpis = useMemo(() => {
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todays = orders.filter((o) => o.createdAt >= start);
    const total = todays.reduce((s, o) => s + o.totalCents, 0);
    const pending = orders.filter((o) => o.status === "PENDING").length;
    return { ordersToday: todays.length, revenueToday: money(total), pending };
  }, [orders]);

  // Actions (mock)
  const setOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };
  const toggleAvailability = (itemId: string) => {
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        items: c.items.map((i) =>
          i.id === itemId
            ? { ...i, available: !i.available, updatedAt: new Date() }
            : i
        ),
      }))
    );
  };
  const reorderItem = (catId: string, fromIdx: number, direction: -1 | 1) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        const next = [...c.items];
        const toIdx = Math.min(Math.max(fromIdx + direction, 0), next.length - 1);
        [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
        return {
          ...c,
          items: next.map((it) => ({ ...it, updatedAt: new Date() })),
        };
      })
    );
  };
  const moveItem = (itemId: string, toCatId: string) => {
    setCategories((prev) => {
      const out = prev.map((c) => ({
        ...c,
        items: c.items.map((it) =>
          it.id === itemId ? { ...it, updatedAt: new Date() } : it
        ),
      }));
      const fromCat = out.find((c) => c.items.some((i) => i.id === itemId));
      const fromIdx = fromCat ? fromCat.items.findIndex((i) => i.id === itemId) : -1;
      if (!fromCat || fromIdx < 0) return prev;
      const item = fromCat.items[fromIdx];
      fromCat.items.splice(fromIdx, 1);
      const toCat = out.find((c) => c.id === toCatId);
      if (toCat) toCat.items.push({ ...item, updatedAt: new Date() });
      return [...out];
    });
  };
  const upsertHour = (day: number, open: string, close: string) => {
    setHours((prev) => {
      const idx = prev.findIndex((h) => h.day === day);
      if (idx === -1) return [...prev, { day, open, close }];
      const next = [...prev];
      next[idx] = { day, open, close };
      return next;
    });
  };
  const addHoliday = (dateISO: string, reason: string) =>
    setHolidays((prev) => [...prev, { dateISO, reason }]);
  const removeHoliday = (dateISO: string) =>
    setHolidays((prev) => prev.filter((h) => h.dateISO !== dateISO));
  const addZip = (postal: string) =>
    setZips((prev) =>
      prev.some((z) => z.postal === postal) ? prev : [...prev, { postal }]
    );
  const removeZip = (postal: string) =>
    setZips((prev) => prev.filter((z) => z.postal !== postal));

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* centered width */}
      <div className="mx-auto max-w-screen-xl p-4 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
          {/* Sidebar Tabs */}
          <aside className="rounded-xl border border-neutral-200 bg-white h-fit sticky top-4">
            <div className="px-4 py-3 border-b border-neutral-200">
              <div className="text-lg font-semibold">Dockside Admin</div>
              <div className="text-xs opacity-60">Mock / Side Tabs</div>
            </div>
            <nav className="p-2">
              <ul className="space-y-1">
                {TABS.map((t) => (
                  <li key={t.id}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 ${
                        tab === t.id ? "bg-neutral-50" : "bg-white"
                      }`}
                      onClick={() => setTab(t.id)}
                      aria-current={tab === t.id ? "page" : undefined}
                    >
                      <span className="mr-2">{t.icon}</span>
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main */}
          <main className="space-y-6">
            {/* Overview */}
            {tab === "overview" && (
              <section className="grid gap-4 sm:grid-cols-3">
                <KpiCard title="Orders Today" value={kpis.ordersToday} />
                <KpiCard title="Revenue Today" value={kpis.revenueToday} />
                <KpiCard title="Pending Orders" value={kpis.pending} />
              </section>
            )}

            {/* Orders */}
            {tab === "orders" && (
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Orders</h2>
                <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <Th>#</Th>
                        <Th>Created</Th>
                        <Th>Customer</Th>
                        <Th>Mode</Th>
                        <Th>Total</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr
                          key={o.id}
                          className="border-b border-neutral-200 last:border-0"
                        >
                          <Td>#{o.number}</Td>
                          <Td>
                            {o.createdAt.toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </Td>
                          <Td>{o.customer}</Td>
                          <Td>{o.mode}</Td>
                          <Td>{money(o.totalCents)}</Td>
                          <Td>
                            <StatusBadge status={o.status} />
                          </Td>
                          <Td>
                            <div className="flex items-center gap-2">
                              <select
                                className="select select-bordered select-xs border-neutral-200"
                                value={o.status}
                                onChange={(e) =>
                                  setOrderStatus(
                                    o.id,
                                    e.target.value as OrderStatus
                                  )
                                }
                              >
                                {[
                                  "PENDING",
                                  "CONFIRMED",
                                  "PREPARING",
                                  "READY",
                                  "OUT_FOR_DELIVERY",
                                  "COMPLETED",
                                  "CANCELED",
                                ].map((s) => (
                                  <option key={s} value={s}>
                                    {s.replaceAll("_", " ")}
                                  </option>
                                ))}
                              </select>
                              <details className="dropdown dropdown-end">
                                <summary className="btn btn-xs">View</summary>
                                <ul className="menu dropdown-content bg-base-100 rounded-box shadow p-2 w-72 z-10 border border-neutral-200">
                                  <li className="menu-title">Items</li>
                                  {o.items?.map((it, i) => (
                                    <li key={i} className="flex justify-between">
                                      <span>
                                        {it.qty}× {it.name}
                                      </span>
                                      <span className="opacity-70">
                                        {money(it.priceCents)}
                                      </span>
                                    </li>
                                  ))}
                                  {o.address && (
                                    <>
                                      <li className="menu-title mt-2">
                                        Delivery
                                      </li>
                                      <li className="text-xs opacity-80">
                                        {o.address.line1}, {o.address.city}{" "}
                                        {o.address.postal}
                                      </li>
                                    </>
                                  )}
                                  {o.notes && (
                                    <>
                                      <li className="menu-title mt-2">Notes</li>
                                      <li className="text-xs opacity-80">
                                        {o.notes}
                                      </li>
                                    </>
                                  )}
                                </ul>
                              </details>
                            </div>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Menu */}
            {tab === "menu" && (
              <section className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {categories.flatMap((c) =>
                    c.items.map((it, idx) => (
                      <article
                        key={it.id}
                        className="rounded-xl border border-neutral-200 bg-white p-4 flex flex-col gap-3"
                      >
                        <header className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{it.name}</div>
                            <div className="text-xs opacity-60">/{it.slug}</div>
                          </div>
                          <span
                            className={`badge ${
                              it.available ? "badge-success" : "badge-ghost"
                            }`}
                          >
                            {it.available ? "Available" : "Hidden"}
                          </span>
                        </header>

                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold">
                            {money(it.priceCents)}
                          </div>
                          <div className="join">
                            <button
                              className="btn btn-xs join-item"
                              onClick={() => reorderItem(c.id, idx, -1)}
                              disabled={idx === 0}
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              className="btn btn-xs join-item"
                              onClick={() => reorderItem(c.id, idx, +1)}
                              disabled={idx === c.items.length - 1}
                              title="Move down"
                            >
                              ↓
                            </button>
                          </div>
                        </div>

                        <footer className="mt-1 pt-3 border-t border-neutral-200 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              className="btn btn-xs"
                              onClick={() => toggleAvailability(it.id)}
                            >
                              {it.available ? "Hide Item" : "Show Item"}
                            </button>
                            <select
                              className="select select-bordered select-xs border-neutral-200"
                              value={c.id}
                              onChange={(e) => moveItem(it.id, e.target.value)}
                              title="Move to category"
                            >
                              {categories.map((cc) => (
                                <option key={cc.id} value={cc.id}>
                                  Move to: {cc.name}
                                </option>
                              ))}
                            </select>
                            <button className="btn btn-xs btn-ghost">
                              Edit
                            </button>
                            <button className="btn btn-xs btn-error">
                              Delete
                            </button>
                          </div>
                          <div className="text-xs opacity-60">
                            Last updated {it.updatedAt.toLocaleDateString()} • #
                            {idx + 1} in{" "}
                            <span className="opacity-80">{c.name}</span>
                          </div>
                        </footer>
                      </article>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* Hours & Closures */}
            {tab === "hours" && (
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Store Hours & Closures</h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <h3 className="font-semibold mb-3">Weekly Hours</h3>
                    <div className="space-y-2">
                      {hours
                        .slice()
                        .sort((a, b) => a.day - b.day)
                        .map((h) => (
                          <div key={h.day} className="flex items-center gap-2">
                            <div className="w-12 text-sm">
                              {dayNames[h.day]}
                            </div>
                            <input
                              className="input input-bordered input-xs w-24 border-neutral-200"
                              defaultValue={h.open}
                              onBlur={(e) =>
                                upsertHour(
                                  h.day,
                                  e.currentTarget.value,
                                  h.close
                                )
                              }
                            />
                            <span className="opacity-60 text-xs">to</span>
                            <input
                              className="input input-bordered input-xs w-24 border-neutral-200"
                              defaultValue={h.close}
                              onBlur={(e) =>
                                upsertHour(
                                  h.day,
                                  h.open,
                                  e.currentTarget.value
                                )
                              }
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <h3 className="font-semibold mb-3">Holiday Closures</h3>
                    <form
                      className="flex items-center gap-2 mb-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(
                          e.currentTarget as HTMLFormElement
                        );
                        const dateISO = String(fd.get("date"));
                        const reason = String(fd.get("reason") || "");
                        if (dateISO) addHoliday(dateISO, reason);
                        (e.currentTarget as HTMLFormElement).reset();
                      }}
                    >
                      <input
                        name="date"
                        type="date"
                        className="input input-bordered input-sm border-neutral-200"
                        required
                      />
                      <input
                        name="reason"
                        placeholder="Reason"
                        className="input input-bordered input-sm border-neutral-200"
                      />
                      <button className="btn btn-sm">Add</button>
                    </form>
                    <ul className="space-y-2">
                      {holidays.map((h) => (
                        <li
                          key={h.dateISO}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>
                            {h.dateISO} —{" "}
                            <span className="opacity-70">
                              {h.reason || "Closure"}
                            </span>
                          </span>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => removeHoliday(h.dateISO)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* Delivery Zones */}
            {tab === "delivery" && (
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Delivery Zones</h2>
                <div className="rounded-xl border border-neutral-200 bg-white p-4">
                  <form
                    className="flex items-center gap-2 mb-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(
                        e.currentTarget as HTMLFormElement
                      );
                      const zip = String(fd.get("zip") || "").trim();
                      if (zip) addZip(zip);
                      (e.currentTarget as HTMLFormElement).reset();
                    }}
                  >
                    <input
                      name="zip"
                      placeholder="Add ZIP (e.g., 02115)"
                      className="input input-bordered input-sm w-48 border-neutral-200"
                    />
                    <button className="btn btn-sm">Add</button>
                  </form>
                  <div className="flex flex-wrap gap-2">
                    {zips.map((z) => (
                      <span key={z.postal} className="badge badge-lg gap-2">
                        {z.postal}
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => removeZip(z.postal)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Settings */}
            {tab === "settings" && (
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Settings</h2>
                <div className="rounded-xl border border-neutral-200 bg-white p-4 grid gap-3 md:grid-cols-2">
                  <ToggleRow label="Accept Pickup Orders" initiallyOn />
                  <ToggleRow label="Accept Delivery Orders" initiallyOn />
                  <ToggleRow label="Auto-Confirm Orders" initiallyOn={false} />
                  <ToggleRow label="Show Popular Items" initiallyOn />
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/** ------------------ UI bits ------------------ */
function KpiCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-top">{children}</td>;
}
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "badge-neutral",
    CONFIRMED: "badge-info",
    PREPARING: "badge-warning",
    READY: "badge-success",
    OUT_FOR_DELIVERY: "badge-info",
    COMPLETED: "badge-ghost",
    CANCELED: "badge-error",
  };
  return (
    <span className={`badge ${styles[status] || "badge-ghost"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
function ToggleRow({
  label,
  initiallyOn = true,
}: {
  label: string;
  initiallyOn?: boolean;
}) {
  const [on, setOn] = useState(initiallyOn);
  return (
    <label className="flex items-center justify-between border border-neutral-200 rounded-lg p-3 bg-white">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={on}
        onChange={() => setOn(!on)}
        className="toggle"
      />
    </label>
  );
}
