import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────
// users
// ─────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─────────────────────────────────────────────
// email_verification_tokens
// ─────────────────────────────────────────────
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// ─────────────────────────────────────────────
// password_reset_tokens
// ─────────────────────────────────────────────
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// ─────────────────────────────────────────────
// chats
// ─────────────────────────────────────────────
export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  artworkId: text("artwork_id").notNull(),
  artworkData: jsonb("artwork_data").notNull(),
  messages: jsonb("messages").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─────────────────────────────────────────────
// paintings
// ─────────────────────────────────────────────
export const paintings = pgTable("paintings", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  artistDisplay: text("artist_display"),
  imageId: text("image_id"),
  imageUrl: text("image_url"),
  source: text("source").notNull().default("artic"),
  dateDisplay: text("date_display"),
  mediumDisplay: text("medium_display"),
  placeOfOrigin: text("place_of_origin"),
  description: text("description"),
  dimensions: text("dimensions"),
  fullData: jsonb("full_data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─────────────────────────────────────────────
// Inferred types
// ─────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;

// ─────────────────────────────────────────────
// compass_contents
// ─────────────────────────────────────────────
export const compassContents = pgTable("compass_contents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // Book, Movie, TV Show, Podcast, Music, Game, Article, YouTube
  title: text("title").notNull(),
  creator: text("creator"),
  year: text("year"),
  link: text("link"),
  description: text("description"),
  why: text("why"), // Explanation why it was recommended
  playUrl: text("play_url"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  isSaved: boolean("is_saved").notNull().default(true), // Distinguish between user's own saved vs AI suggested (if we store them temporarily)
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CompassContent = typeof compassContents.$inferSelect;
export type NewCompassContent = typeof compassContents.$inferInsert;

export type Painting = typeof paintings.$inferSelect;
export type NewPainting = typeof paintings.$inferInsert;
