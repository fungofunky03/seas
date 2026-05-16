import { waitlist } from "@shared/schema";
import type { WaitlistEntry, InsertWaitlist } from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { desc } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

// Bootstrap the waitlist table on cold start (no migrations needed for single-table app)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    install_volume TEXT NOT NULL,
    bottleneck TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );
`);

export const db = drizzle(sqlite);

export interface IStorage {
  createWaitlistEntry(entry: InsertWaitlist): Promise<WaitlistEntry>;
  listWaitlistEntries(): Promise<WaitlistEntry[]>;
  countWaitlist(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async createWaitlistEntry(entry: InsertWaitlist): Promise<WaitlistEntry> {
    return db
      .insert(waitlist)
      .values({ ...entry, createdAt: Date.now() })
      .returning()
      .get();
  }

  async listWaitlistEntries(): Promise<WaitlistEntry[]> {
    return db.select().from(waitlist).orderBy(desc(waitlist.createdAt)).all();
  }

  async countWaitlist(): Promise<number> {
    const rows = db.select().from(waitlist).all();
    return rows.length;
  }
}

export const storage = new DatabaseStorage();
