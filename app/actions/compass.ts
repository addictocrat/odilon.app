"use server";

import { db } from "@/lib/db";
import { compassContents } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function getSavedContents() {
  const session = await getSession();
  if (!session) return [];

  return await db.query.compassContents.findMany({
    where: and(
      eq(compassContents.userId, session.userId),
      eq(compassContents.isSaved, true),
    ),
    orderBy: [desc(compassContents.createdAt)],
  });
}

export async function generateRecommendations(
  selectedIds: string[],
  targetTypes: string[],
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const selectedContents = await db.query.compassContents.findMany({
    where: and(
      eq(compassContents.userId, session.userId),
      inArray(compassContents.id, selectedIds),
    ),
  });

  if (selectedContents.length === 0) throw new Error("No contents selected");

  const prompt = `You are Odilon Compass, a soulful content recommender. 
Based on these favorite items:
${selectedContents
  .map(
    (c) =>
      `- ${c.type}: ${c.title} by ${c.creator} (${c.year}) - ${c.description}`,
  )
  .join("\n")}

Suggest exactly 9 new contents strictly in these formats: ${targetTypes.join(", ")}.
Reflect the theme, feeling, and "soul" of the selected items.

Return ONLY a JSON array:
[
  {
    "type": "format type",
    "title": "content title",
    "creator": "author or creator",
    "year": "release year",
    "link": "url (youtube creator's channel url for video, spotify artist's url for music, imdb for movie/tv, goodreads for book, steam for game, etc)",
    "description": "short description",
    "why": "soulful explanation referencing the favorite items intersection",
    "tags": ["tag1", "tag2", "tag3"]
  }
]`;

  const { text } = await generateText({
    model: openrouter(
      process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001",
    ),
    prompt,
    temperature: 0.7,
  });

  try {
    const rawRecs = JSON.parse(text);
    return rawRecs;
  } catch (e) {
    console.error("Failed to parse recommendations", text);
    throw new Error("AI failed to provide valid recommendations");
  }
}

export async function saveContent(data: {
  type: string;
  title: string;
  creator?: string;
  year?: string;
  link?: string;
  description?: string;
  why?: string;
  tags?: string[];
}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [newContent] = await db
    .insert(compassContents)
    .values({
      userId: session.userId,
      type: data.type,
      title: data.title,
      creator: data.creator,
      year: data.year,
      link: data.link,
      description: data.description,
      why: data.why,
      tags: data.tags || [],
      isSaved: true,
    })
    .returning();

  revalidatePath("/compass/saved");
  return newContent;
}

export async function deleteContent(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  await db
    .delete(compassContents)
    .where(
      and(
        eq(compassContents.id, id),
        eq(compassContents.userId, session.userId),
      ),
    );

  revalidatePath("/compass/saved");
}

export async function updateContent(
  id: string,
  data: {
    type: string;
    title: string;
    creator?: string;
    year?: string;
    link?: string;
    description?: string;
    why?: string;
    tags?: string[];
  },
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [updatedContent] = await db
    .update(compassContents)
    .set({
      type: data.type,
      title: data.title,
      creator: data.creator,
      year: data.year,
      link: data.link,
      description: data.description,
      why: data.why,
      tags: data.tags,
    })
    .where(
      and(
        eq(compassContents.id, id),
        eq(compassContents.userId, session.userId),
      ),
    )
    .returning();

  revalidatePath("/compass/saved");
  return updatedContent;
}
