"use server";

import { db } from "@/lib/db";
import { paintings } from "@/lib/db/schema";
import { eq, ne, or, ilike, desc, sql, and, isNotNull, notInArray } from "drizzle-orm";

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
      for (const artwork of results) {
        const imageUrl = artwork.image_id
          ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
          : null;
        await db
          .insert(paintings)
          .values({
            id: `artic_${artwork.id}`,
            title: artwork.title,
            artistDisplay: artwork.artist_display,
            imageId: artwork.image_id,
            imageUrl,
            source: "artic",
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
              imageUrl,
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

const MET_BASE = "https://collectionapi.metmuseum.org/public/collection/v1";

export async function syncMetPaintings(query: string) {
  if (!query.trim()) return [];

  try {
    // Step 1: Get objectID list
    const searchRes = await fetch(
      `${MET_BASE}/search?q=${encodeURIComponent(query)}&hasImages=true&medium=Paintings&isPublicDomain=true`,
    );
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const objectIds: number[] = (searchData.objectIDs || []).slice(0, 20);

    if (objectIds.length === 0) return [];

    // Step 2: Fetch details in batches of 10
    const details: any[] = [];
    for (let i = 0; i < objectIds.length; i += 10) {
      const batch = objectIds.slice(i, i + 10);
      const settled = await Promise.allSettled(
        batch.map((id) =>
          fetch(`${MET_BASE}/objects/${id}`).then((r) => r.json()),
        ),
      );
      for (const result of settled) {
        if (result.status === "fulfilled") details.push(result.value);
      }
    }

    // Filter by public domain, image presence, and object type
    const valid = details.filter(
      (obj) =>
        obj.isPublicDomain === true &&
        obj.primaryImageSmall &&
        obj.primaryImageSmall.trim() !== "" &&
        obj.objectName === "Painting",
    );

    for (const obj of valid) {
      const artistDisplay = [obj.artistDisplayName, obj.artistDisplayBio]
        .filter(Boolean)
        .join("\n") || null;

      await db
        .insert(paintings)
        .values({
          id: `met_${obj.objectID}`,
          title: obj.title,
          artistDisplay,
          imageId: null,
          imageUrl: obj.primaryImageSmall,
          source: "met",
          dateDisplay: obj.objectDate || null,
          mediumDisplay: obj.medium || null,
          placeOfOrigin: obj.country || null,
          dimensions: obj.dimensions || null,
          fullData: obj,
        })
        .onConflictDoUpdate({
          target: paintings.id,
          set: {
            title: obj.title,
            artistDisplay,
            imageUrl: obj.primaryImageSmall,
            dateDisplay: obj.objectDate || null,
            mediumDisplay: obj.medium || null,
            placeOfOrigin: obj.country || null,
            dimensions: obj.dimensions || null,
            fullData: obj,
            updatedAt: new Date(),
          },
        });
    }

    return valid;
  } catch (error) {
    console.error("Error syncing Met paintings:", error);
    return [];
  }
}

export async function searchPaintings(query: string, limit: number = 10) {
  if (!query.trim()) return [];

  await Promise.all([
    searchAndSyncArtworks(query, limit),
    syncMetPaintings(query),
  ]);

  return db.query.paintings.findMany({
    where: and(
      isNotNull(paintings.imageUrl),
      or(
        ilike(paintings.title, `%${query}%`),
        ilike(paintings.artistDisplay, `%${query}%`),
      ),
    ),
    limit,
    orderBy: [desc(paintings.updatedAt)],
  });
}

export async function getLibraryPaintings(params: {
  page?: number;
  limit?: number;
  search?: string;
  artist?: string;
}) {
  const { page = 1, limit = 20, search = "", artist = "" } = params;

  if (page === 1) {
    if (search.trim()) {
      await Promise.all([
        searchAndSyncArtworks(search),
        syncMetPaintings(search),
      ]);
    }

    if (artist.trim()) {
      await Promise.all([
        searchAndSyncArtworks(artist, 40),
        syncMetPaintings(artist),
      ]);
    }
  }

  const offset = (page - 1) * limit;

  const hasImage = and(isNotNull(paintings.imageUrl), ne(paintings.imageUrl, ""));

  let whereClause: ReturnType<typeof and> = hasImage;

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

    whereClause = and(hasImage, ...conditions);
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

export async function getDiscoverPaintings(limit: number = 8, excludeIds: string[] = []) {
  return db.query.paintings.findMany({
    where: excludeIds.length
      ? and(isNotNull(paintings.imageUrl), notInArray(paintings.id, excludeIds))
      : isNotNull(paintings.imageUrl),
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
  const featuredQueries = [
    "Claude Monet",
    "Vincent van Gogh",
    "Odilon Redon",
    "Gustav Klimt",
    "Hilma af Klint",
  ];
  for (const query of featuredQueries) {
    await Promise.all([
      searchAndSyncArtworks(query),
      syncMetPaintings(query),
    ]);
  }
}
