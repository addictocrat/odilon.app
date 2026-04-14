"use server";

import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { nanoid } from "nanoid";

function normalizeMessages(messages: any[]): any[] {
  if (!Array.isArray(messages)) return [];
  
  return messages.map((m, idx) => {
    // Ensure we have a string content, fallback to parts if necessary
    let content = m.content || "";
    if (!content && Array.isArray(m.parts)) {
      content = m.parts
        .map((p: any) => (p.type === "text" ? p.text : ""))
        .join("")
        .trim();
    }

    // AI SDK strictly needs a content string to prioritize it over parts in some cases
    return {
      ...m,
      id: m.id || `msg-${idx}-${nanoid(7)}`,
      role: m.role || "assistant",
      content: content || " ", // Use a space as last resort to satisfy non-empty constraints
      createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
    };
  });
}

export async function createConversation(artworkData: any) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const introMessage = {
    id: "intro",
    role: "assistant",
    content: `Welcome to the sanctuary. We are standing before "${artworkData.title}," a vision by ${artworkData.artist_display}. The colors are still breathing... what secrets shall we uncover together?`,
    createdAt: new Date(),
  };

  const [newChat] = await db
    .insert(chats)
    .values({
      userId: session.userId,
      artworkId: String(artworkData.id),
      artworkData: artworkData,
      messages: [introMessage],
    })
    .returning();

  revalidatePath("/dashboard");
  return newChat.id;
}

export async function getConversations() {
  const session = await getSession();
  if (!session) return [];

  const userChats = await db.query.chats.findMany({
    where: eq(chats.userId, session.userId),
    orderBy: [desc(chats.updatedAt)],
  });

  return userChats.map((chat) => ({
    ...chat,
    messages: normalizeMessages(chat.messages as any[]),
  }));
}

export async function getConversation(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const chat = await db.query.chats.findFirst({
    where: eq(chats.id, id),
  });

  if (!chat) return null;

  return {
    ...chat,
    messages: normalizeMessages(chat.messages as any[]),
  };
}

export async function updateConversationMessages(id: string, messages: any[]) {
  const session = await getSession();
  console.log("Updating Conversation:", id, "Session:", !!session, "Message Count:", messages.length);
  
  if (!session) {
    console.error("Unauthorized update attempt for chat", id);
    throw new Error("Unauthorized");
  }

  const normalized = normalizeMessages(messages);

  try {
    await db
      .update(chats)
      .set({
        messages: normalized,
        updatedAt: new Date(),
      })
      .where(eq(chats.id, id));
    
    console.log("Update success for:", id);
  } catch (error) {
    console.error("Drizzle update error for chat", id, ":", error);
    throw error;
  }

  revalidatePath(`/chat/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteConversation(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Verify ownership before deletion
  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, id), eq(chats.userId, session.userId)),
  });

  if (!chat) {
    throw new Error("Conversation not found or access denied");
  }

  await db.delete(chats).where(eq(chats.id, id));

  revalidatePath("/dashboard");
  revalidatePath("/chat");
}
