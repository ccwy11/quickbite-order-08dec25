// import { config } from "dotenv";
// import { drizzle } from 'drizzle-orm/neon-http';

// config({ path: ".env" }); // or .env.local

// export const db = drizzle(process.env.DATABASE_URL!);



import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

// neonConfig.fetchConnectionCache = true;

// const sql = neon(process.env.DATABASE_URL!);
// export const db = drizzle(sql, { schema });

// Lazy connect – only at runtime
let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
  }
  return db;
}