# Hour 1 — Setup & Models (SSR‑only)

**Goal for this hour**: Ship a clean, server‑rendered foundation:
- Next.js (App Router) + Tailwind + DaisyUI
- Prisma + PostgreSQL with seed data
- Minimal SSR layout + home page rendering menu from DB

> **Constraint**: No client components or client state in Hour 1. All routes/pages are React Server Components.

---

## 0) Prerequisites (5 min)
- Node 18+ and npm installed
- A PostgreSQL database (local Docker or cloud). Copy your connection string.

---

## 1) Scaffold the project (5–7 min)
npx create-next-app@latest johnnies-mini \
  --ts --tailwind --eslint --app --src-dir
cd johnnies-mini

npm i -D prisma
npm i @prisma/client
npx prisma init

npm i daisyui
npm i -D ts-node @types/node

---

## 2) Tailwind + DaisyUI setup (3 min)
// tailwind.config.ts
import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: { themes: ["light"] },
} satisfies Config;

---

## 3) Environment variables (3–5 min)
// .env.local
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"

---

## 4) Prisma schema (10–12 min)
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id             String          @id @default(cuid())
  name           String?
  email          String          @unique
  emailVerified  DateTime?
  image          String?
  orders         Order[]         @relation("OrdersByEmail")

  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}

enum OrderStatus {
  PENDING
  PAID
  CANCELED
}

model Category {
  id        String      @id @default(cuid())
  name      String
  slug      String      @unique
  index     Int         @default(0)
  items     MenuItem[]

  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model MenuItem {
  id           String       @id @default(cuid())
  name         String
  slug         String       @unique
  description  String       @default("")
  priceCents   Int
  imageUrl     String?
  isAvailable  Boolean      @default(true)

  categoryId   String
  category     Category     @relation(fields: [categoryId], references: [id])
  orderItems   OrderItem[]

  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

model Order {
  id                     String       @id @default(cuid())
  userEmail              String
  user                   User         @relation("OrdersByEmail", fields: [userEmail], references: [email])

  status                 OrderStatus  @default(PENDING)
  subtotalCents          Int
  stripeSessionId        String?      @unique
  stripePaymentIntentId  String?

  items                  OrderItem[]

  createdAt              DateTime     @default(now())
  updatedAt              DateTime     @updatedAt
}

model OrderItem {
  id             String    @id @default(cuid())
  orderId        String
  order          Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)

  menuItemId     String
  menuItem       MenuItem  @relation(fields: [menuItemId], references: [id])

  qty            Int       @default(1)
  unitPriceCents Int
}

npx prisma migrate dev -n "init"

// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

---

## 5) Seed minimal data (5–7 min)
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.category.createMany({
    data: [
      { name: "Lobster", slug: "lobster", index: 1 },
      { name: "Shrimp", slug: "shrimp", index: 2 },
      { name: "Clams & Oysters", slug: "shellfish", index: 3 },
      { name: "Fresh Fish", slug: "fish", index: 4 },
    ],
    skipDuplicates: true,
  });

  const cat = await prisma.category.findFirst({ where: { slug: "lobster" } });
  if (cat) {
    await prisma.menuItem.createMany({
      data: [
        { name: "Live Lobster 1.25lb", slug: "live-lobster-125", description: "Classic, sweet & tender.", priceCents: 2499, categoryId: cat.id },
        { name: "Lobster Roll", slug: "lobster-roll", description: "Lightly dressed, toasted bun.", priceCents: 1899, categoryId: cat.id },
      ],
      skipDuplicates: true,
    });
  }
}

main().finally(() => prisma.$disconnect());

// package.json
{
  "name": "resturantwebsite",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "db:seed": "prisma db seed"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"commonjs\"} prisma/seed.ts"
  },

npm i -D ts-node
npx prisma db seed

---

## 6) SSR layout + home page (5–10 min)
// src/app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-dvh">
        <nav className="navbar bg-base-100 border-b">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">
              Johnnie’s <span className="opacity-60 ml-1">Mini</span>
            </a>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}

// src/app/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  const cats = await prisma.category.findMany({
    orderBy: { index: "asc" },
    include: { items: { where: { isAvailable: true } } },
  });

  return (
    <div className="space-y-8">
      {cats.map((cat) => (
        <section key={cat.id} id={cat.slug}>
          <h2 className="text-2xl font-semibold mb-3">{cat.name}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.items.map((it) => (
              <article key={it.id} className="card bg-base-100 shadow">
                <div className="card-body">
                  <h3 className="card-title">{it.name}</h3>
                  <p className="text-sm opacity-70">{it.description}</p>
                  <div className="card-actions justify-between items-center">
                    <span className="font-semibold">${(it.priceCents / 100).toFixed(2)}</span>
                    <Link className="btn btn-sm" href={`/item/${it.slug}`}>
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

---

## 7) Smoke test (3–5 min)
npm run dev

Visit http://localhost:3000 → categories + items should render from DB.

---

## What’s next (Hour 2 preview)
- Item detail page (SSR)
- Server actions to create orders + Stripe Checkout session
- Webhook endpoint to mark PAID
- Admin SSR pages

---

## Appendix — Troubleshooting
- Enum errors: ensure your enum OrderStatus { PENDING PAID CANCELED } has values on separate lines.
- Relation errors: confirm MenuItem includes orderItems OrderItem[].
- Prisma duplication: ensure src/lib/prisma.ts matches global pattern.
- DB permissions: check Postgres user rights.
