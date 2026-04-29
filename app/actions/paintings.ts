"use server";

import { db } from "@/lib/db";
import { paintings } from "@/lib/db/schema";
import { eq, ne, or, ilike, desc, sql, and, isNotNull, notInArray } from "drizzle-orm";

const WIKIMEDIA_BASE = "https://commons.wikimedia.org/w/api.php";
// CC licenses + all public-domain variants (PD-Art, PD-old, PD-old-100, etc.)
// Famous paintings like Mona Lisa / Starry Night are public domain, not CC.
const ALLOWED_LICENSES = ["CC0", "CC BY", "CC BY-SA", "Public domain", "PD"];

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

// EXIF timestamps look like "2018:02:14 00:00:00" — these are scan/upload dates, not creation dates
function isExifTimestamp(val: string): boolean {
  return /^\d{4}:\d{2}:\d{2}/.test(val);
}

async function syncWikimediaPaintings(query: string): Promise<void> {
  // Cache check: skip API call if we already have fully-enriched wikimedia results.
  // 'wikimediaRelevanceIndex' is the latest sentinel — records missing it (fetched by older
  // logic) will be re-fetched and upserted with the relevance index included.
  const [cached] = await db
    .select({ count: sql<number>`count(*)` })
    .from(paintings)
    .where(
      and(
        eq(paintings.source, "wikimedia"),
        sql`${paintings.fullData} ? 'wikimediaRelevanceIndex'`,
        or(
          ilike(paintings.title, `%${query}%`),
          ilike(paintings.artistDisplay, `%${query}%`),
        ),
      ),
    );

  if (Number(cached.count) > 0) return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `${query} painting`,
      gsrnamespace: "6",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "800",
      format: "json",
      gsrlimit: "10",
      origin: "*",
    });

    const res = await fetch(`${WIKIMEDIA_BASE}?${params}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return;

    const data = await res.json();
    const pages: Record<string, any> = data.query?.pages ?? {};

    const rows: {
      id: string;
      title: string;
      artistDisplay: string | null;
      imageId: null;
      imageUrl: string;
      source: string;
      dateDisplay: string | null;
      mediumDisplay: null;
      placeOfOrigin: null;
      description: string | null;
      dimensions: null;
      fullData: unknown;
    }[] = [];

    // Fallback position counter for engines that omit page.index
    let fallbackPosition = 0;

    for (const [pageId, page] of Object.entries(pages)) {
      // page.index is 1-based in Wikimedia's API; convert to 0-based (0 = most relevant)
      const relevanceIndex =
        typeof page.index === "number" ? page.index - 1 : fallbackPosition;
      fallbackPosition++;
      const imageinfo = page.imageinfo?.[0];
      if (!imageinfo) continue;

      // Prefer the pre-scaled thumbnail (~960px); fall back to original URL only when
      // thumburl is absent. Original files can be 100MB+ (e.g. Google Art Project scans).
      const imageUrl: string = imageinfo.thumburl ?? imageinfo.url ?? "";
      if (!imageUrl || !/\.(jpg|jpeg|png)$/i.test(imageUrl)) continue;

      const meta = imageinfo.extmetadata ?? {};
      const license: string = meta.LicenseShortName?.value ?? "";
      if (!ALLOWED_LICENSES.some((l) => license.startsWith(l))) continue;

      const rawTitle: string = page.title ?? "";
      const title = rawTitle
        .replace(/^File:/i, "")
        .replace(/\.[^.]+$/, "")
        .trim();
      if (!title) continue;

      const artistDisplay = meta.Artist?.value
        ? stripHtml(meta.Artist.value) || null
        : null;

      // Prefer meta.Date (human-readable creation year like "1889") over DateTimeOriginal
      // which is typically an EXIF scan/upload timestamp (e.g. "2018:02:14 00:00:00")
      const rawDate = meta.Date?.value || meta.DateTimeOriginal?.value || null;
      const dateDisplay =
        rawDate && !isExifTimestamp(rawDate) ? rawDate : null;

      // ImageDescription is the primary source for the About section
      const description = meta.ImageDescription?.value
        ? stripHtml(meta.ImageDescription.value) || null
        : null;

      const credit = meta.Credit?.value ?? null;

      rows.push({
        id: `wikimedia_${pageId}`,
        title,
        artistDisplay,
        imageId: null,
        imageUrl,
        source: "wikimedia",
        dateDisplay,
        mediumDisplay: null,
        placeOfOrigin: null,
        description,
        dimensions: null,
        // fullData is spread into the artwork object when starting a chat (PaintingCard).
        // The chat sidebar reads date_display and description from the spread — mirror them here
        // so Wikimedia cards show the same Details / About sections as ArtIC and Met cards.
        fullData: {
          wikimediaRelevanceIndex: relevanceIndex,
          date_display: dateDisplay,
          description,
          license,
          credit,
          pageId,
        },
      });
    }

    if (rows.length === 0) return;

    await db
      .insert(paintings)
      .values(rows)
      .onConflictDoUpdate({
        target: paintings.id,
        set: {
          title: sql`excluded.title`,
          artistDisplay: sql`excluded.artist_display`,
          imageUrl: sql`excluded.image_url`,
          dateDisplay: sql`excluded.date_display`,
          description: sql`excluded.description`,
          fullData: sql`excluded.full_data`,
          updatedAt: new Date(),
        },
      });
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("Wikimedia fallback failed:", err);
  }
}

export async function searchAndSyncArtworks(query: string, limit: number = 15) {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(
        query,
      )}&fields=id,title,artist_display,image_id,description,medium_display,date_display,place_of_origin,dimensions&limit=${limit}`,
    );
    if (!response.ok) return [];
    const data = await response.json();
    const results = data.data || [];

    if (results.length > 0) {
      const rows = results.map((artwork: any) => {
        const imageUrl = artwork.image_id
          ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
          : null;
        return {
          id: `artic_${artwork.id}`,
          title: artwork.title,
          artistDisplay: artwork.artist_display,
          imageId: artwork.image_id,
          imageUrl,
          source: "artic" as const,
          dateDisplay: artwork.date_display,
          mediumDisplay: artwork.medium_display,
          placeOfOrigin: artwork.place_of_origin,
          description: artwork.description,
          dimensions: artwork.dimensions,
          fullData: artwork,
        };
      });

      await db
        .insert(paintings)
        .values(rows)
        .onConflictDoUpdate({
          target: paintings.id,
          set: {
            title: sql`excluded.title`,
            artistDisplay: sql`excluded.artist_display`,
            imageId: sql`excluded.image_id`,
            imageUrl: sql`excluded.image_url`,
            dateDisplay: sql`excluded.date_display`,
            mediumDisplay: sql`excluded.medium_display`,
            placeOfOrigin: sql`excluded.place_of_origin`,
            description: sql`excluded.description`,
            dimensions: sql`excluded.dimensions`,
            fullData: sql`excluded.full_data`,
            updatedAt: new Date(),
          },
        });
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

    if (valid.length > 0) {
      const rows = valid.map((obj: any) => {
        const artistDisplay = [obj.artistDisplayName, obj.artistDisplayBio]
          .filter(Boolean)
          .join("\n") || null;
        const description = obj.tags?.map((t: any) => t.term).join(", ") || null;
        return {
          id: `met_${obj.objectID}`,
          title: obj.title,
          artistDisplay,
          imageId: null as null,
          imageUrl: obj.primaryImageSmall,
          source: "met" as const,
          dateDisplay: obj.objectDate || null,
          mediumDisplay: obj.medium || null,
          placeOfOrigin: obj.country || null,
          dimensions: obj.dimensions || null,
          description,
          fullData: obj,
        };
      });

      await db
        .insert(paintings)
        .values(rows)
        .onConflictDoUpdate({
          target: paintings.id,
          set: {
            title: sql`excluded.title`,
            artistDisplay: sql`excluded.artist_display`,
            imageUrl: sql`excluded.image_url`,
            dateDisplay: sql`excluded.date_display`,
            mediumDisplay: sql`excluded.medium_display`,
            placeOfOrigin: sql`excluded.place_of_origin`,
            dimensions: sql`excluded.dimensions`,
            description: sql`excluded.description`,
            fullData: sql`excluded.full_data`,
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

async function syncBothSources(query: string, limit?: number) {
  await Promise.all([
    searchAndSyncArtworks(query, limit),
    syncMetPaintings(query),
  ]);
}

const dbSearchWhere = (query: string) =>
  and(
    isNotNull(paintings.imageUrl),
    or(
      ilike(paintings.title, `%${query}%`),
      ilike(paintings.artistDisplay, `%${query}%`),
    ),
  );

// Sort priority: artic → met → wikimedia, with per-source secondary criteria.
// Pure in-memory sort — no extra DB queries.
function sortPaintingResults<T extends { source: string | null; fullData: unknown }>(
  results: T[],
): T[] {
  const GROUP: Record<string, number> = { artic: 0, met: 1, wikimedia: 2 };

  return [...results].sort((a, b) => {
    const aG = GROUP[a.source ?? ""] ?? 3;
    const bG = GROUP[b.source ?? ""] ?? 3;
    if (aG !== bG) return aG - bG;

    const aF = (a.fullData as Record<string, any>) ?? {};
    const bF = (b.fullData as Record<string, any>) ?? {};

    if (a.source === "artic") {
      // Boosted results first (ArtIC search relevance flag)
      return (bF.is_boosted ? 1 : 0) - (aF.is_boosted ? 1 : 0);
    }
    if (a.source === "met") {
      // Museum highlights first
      return (bF.isHighlight ? 1 : 0) - (aF.isHighlight ? 1 : 0);
    }
    if (a.source === "wikimedia") {
      // Lower index = more relevant (Elasticsearch rank from Wikimedia)
      const aIdx =
        typeof aF.wikimediaRelevanceIndex === "number"
          ? aF.wikimediaRelevanceIndex
          : Infinity;
      const bIdx =
        typeof bF.wikimediaRelevanceIndex === "number"
          ? bF.wikimediaRelevanceIndex
          : Infinity;
      return aIdx - bIdx;
    }
    return 0;
  });
}

export async function searchPaintings(query: string, limit: number = 10) {
  if (!query.trim()) return [];

  // All three sources run in parallel. Wikimedia has its own cache check so the
  // external API call happens only once per query; subsequent calls are free DB reads.
  // Running in parallel means no extra wall-clock latency compared to ArtIC + Met alone.
  await Promise.all([
    syncBothSources(query, limit),
    syncWikimediaPaintings(query),
  ]);

  return sortPaintingResults(
    await db.query.paintings.findMany({
      where: dbSearchWhere(query),
      limit,
      orderBy: [desc(paintings.updatedAt)],
    }),
  );
}

export async function getLibraryPaintings(params: {
  page?: number;
  limit?: number;
  search?: string;
  artist?: string;
}) {
  const { page = 1, limit = 20, search = "", artist = "" } = params;

  if (page === 1) {
    if (search.trim()) await syncBothSources(search);
    if (artist.trim()) await syncBothSources(artist, 40);
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
    await syncBothSources(query);
  }
}
