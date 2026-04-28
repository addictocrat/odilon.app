"use server";

import { db } from "@/lib/db";
import { paintings } from "@/lib/db/schema";
import { eq, or, ilike, desc, sql, and, isNotNull } from "drizzle-orm";

export async function searchAndSyncArtworks(query: string, limit: number = 15) {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(
        query,
      )}&fields=id,title,artist_display,image_id,description,medium_display,date_display,place_of_origin,dimensions&limit=${limit}`,
    );
    const data = await response.json();
    const results = data.data || [];

    if (results.length > 0) {
      // Upsert into our database
      for (const artwork of results) {
        await db
          .insert(paintings)
          .values({
            id: String(artwork.id),
            title: artwork.title,
            artistDisplay: artwork.artist_display,
            imageId: artwork.image_id,
            dateDisplay: artwork.date_display,
            mediumDisplay: artwork.medium_display,
            placeOfOrigin: artwork.place_of_origin,
            description: artwork.description,
            dimensions: artwork.dimensions,
            fullData: artwork,
          })
          .onConflictDoUpdate({
            target: paintings.id,
            set: {
              title: artwork.title,
              artistDisplay: artwork.artist_display,
              imageId: artwork.image_id,
              dateDisplay: artwork.date_display,
              mediumDisplay: artwork.medium_display,
              placeOfOrigin: artwork.place_of_origin,
              description: artwork.description,
              dimensions: artwork.dimensions,
              fullData: artwork,
              updatedAt: new Date(),
            },
          });
      }
    }

    return results;
  } catch (error) {
    console.error("Error searching and syncing artworks:", error);
    throw error;
  }
}

export async function getLibraryPaintings(params: {
  page?: number;
  limit?: number;
  search?: string;
  artist?: string;
}) {
  const { page = 1, limit = 20, search = "", artist = "" } = params;

  // If searching or filtering by artist, sync from ArtIC first to ensure we have results
  if (search.trim()) {
    await searchAndSyncArtworks(search);
  }

  if (artist.trim()) {
    await searchAndSyncArtworks(artist, 40); // Fetch more results for artist filter
  }

  const offset = (page - 1) * limit;

  let whereClause = undefined;

  if (search || artist) {
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(paintings.title, `%${search}%`),
          ilike(paintings.artistDisplay, `%${search}%`),
        ),
      );
    }
    if (artist) {
      conditions.push(ilike(paintings.artistDisplay, `%${artist}%`));
    }

    if (conditions.length > 1) {
      whereClause = and(...conditions);
    } else {
      whereClause = conditions[0];
    }
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(paintings)
    .where(whereClause);

  const results = await db.query.paintings.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: [desc(paintings.createdAt)],
  });

  return {
    paintings: results,
    totalCount: Number(countResult.count),
    totalPages: Math.ceil(Number(countResult.count) / limit),
    currentPage: page,
  };
}

export async function getDiscoverPaintings(limit: number = 8) {
  return db.query.paintings.findMany({
    where: isNotNull(paintings.imageId),
    limit,
    orderBy: [desc(paintings.createdAt)],
  });
}

export async function getUniqueArtists() {
  const results = await db
    .select({ artist: paintings.artistDisplay })
    .from(paintings)
    .groupBy(paintings.artistDisplay)
    .orderBy(paintings.artistDisplay);

  return results.map((r) => r.artist).filter(Boolean) as string[];
}

export async function seedFeaturedPaintings() {
  // This is a one-time thing or can be called to populate initial data
  const featuredQueries = [
    "Claude Monet",
    "Vincent van Gogh",
    "Odilon Redon",
    "Gustav Klimt",
    "Hilma af Klint",
  ];
  for (const query of featuredQueries) {
    await searchAndSyncArtworks(query);
  }
}
