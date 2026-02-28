import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function migrate() {
  try {
    console.log("Adding staff profile fields to user table...");
    
    await db.run(sql`ALTER TABLE user ADD COLUMN bio TEXT`);
    console.log("✓ Added bio column");
    
    await db.run(sql`ALTER TABLE user ADD COLUMN expertise TEXT`);
    console.log("✓ Added expertise column");
    
    await db.run(sql`ALTER TABLE user ADD COLUMN linkedin TEXT`);
    console.log("✓ Added linkedin column");
    
    console.log("✅ Migration completed successfully!");
  } catch (error: any) {
    if (error.message?.includes("duplicate column name")) {
      console.log("✓ Columns already exist - no migration needed");
    } else {
      console.error("❌ Migration failed:", error.message);
      throw error;
    }
  }
}

migrate()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
