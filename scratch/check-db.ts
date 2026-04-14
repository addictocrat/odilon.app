import { db } from "../lib/db";
import { chats } from "../lib/db/schema";
import { desc } from "drizzle-orm";

async function check() {
  const latestChats = await db.select().from(chats).orderBy(desc(chats.createdAt)).limit(5);
  console.log(JSON.stringify(latestChats, null, 2));
  process.exit(0);
}

check();
