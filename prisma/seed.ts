import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Lobster", slug: "lobster", index: 1 },
    { name: "Shrimp", slug: "shrimp", index: 2 },
    { name: "Clams & Oysters", slug: "shellfish", index: 3 },
    { name: "Fresh Fish", slug: "fish", index: 4 },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, index: c.index },
      create: c,
    });
  }

  const items = [
    {
      name: "Live Lobster 1.25lb",
      slug: "live-lobster-125",
      description: "Classic, sweet & tender.",
      priceCents: 2499,
      categorySlug: "lobster",
    },
    {
      name: "Lobster Roll",
      slug: "lobster-roll",
      description: "Lightly dressed, toasted bun.",
      priceCents: 1899,
      categorySlug: "lobster",
    },
  ];

  for (const it of items) {
    const cat = await prisma.category.findUnique({ where: { slug: it.categorySlug } });
    if (!cat) throw new Error(`Missing category for item: ${it.slug} → ${it.categorySlug}`);

    await prisma.menuItem.upsert({
      where: { slug: it.slug },
      update: {
        name: it.name,
        description: it.description,
        priceCents: it.priceCents,
        categoryId: cat.id,
        isAvailable: true,
      },
      create: {
        name: it.name,
        slug: it.slug,
        description: it.description,
        priceCents: it.priceCents,
        categoryId: cat.id,
        isAvailable: true,
      },
    });
  }
}

main()
  .then(() => console.log("✅ Seed complete"))
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
