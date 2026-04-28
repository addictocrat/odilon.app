ALTER TABLE "paintings" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "paintings" ADD COLUMN "source" text DEFAULT 'artic' NOT NULL;--> statement-breakpoint
UPDATE "paintings" SET "image_url" = 'https://www.artic.edu/iiif/2/' || "image_id" || '/full/843,/0/default.jpg' WHERE "image_id" IS NOT NULL AND "image_url" IS NULL;--> statement-breakpoint
UPDATE "paintings" SET "id" = 'artic_' || "id" WHERE "id" NOT LIKE 'artic_%' AND "id" NOT LIKE 'met_%';--> statement-breakpoint
UPDATE "chats" SET "artwork_id" = 'artic_' || "artwork_id" WHERE "artwork_id" ~ '^[0-9]+$';