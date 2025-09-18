// src/app/order/_data/fetchers.ts
import { prisma } from "@/lib/prisma";

export async function getCategoriesBare() {
  return prisma.category.findMany({
    orderBy: { index: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export async function getItemsByFilters(opts: { q?: string|null; cat?: string|null }) {
  const { q, cat } = opts;
  return prisma.category.findMany({
    ...(cat ? { where: { slug: cat } } : {}),
    orderBy: { index: "asc" },
    include: {
      items: {
        where: {
          ...(q ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          } : {}),
          isAvailable: true,
        },
        orderBy: { name: "asc" },
      },
    },
  });
}
