import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index";
import path from "path";

async function main() {
  console.log("Running migrations...");
  try {
    await migrate(db, {
      migrationsFolder: path.resolve(process.cwd(), "lib/db/migrations"),
    });
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();