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
    demo_last_step TEXT NOT NULL DEFAULT '',
    demo_most_clicked_step TEXT NOT NULL DEFAULT '',
    demo_step_clicks TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );
`);

const waitlistColumns = sqlite
  .prepare("PRAGMA table_info(waitlist)")
  .all() as Array<{ name: string }>;
const hasColumn = (name: string) => waitlistColumns.some((column) => column.name === name);
if (!hasColumn("demo_last_step")) {
  sqlite.exec("ALTER TABLE waitlist ADD COLUMN demo_last_step TEXT NOT NULL DEFAULT '';");
}
if (!hasColumn("demo_most_clicked_step")) {
  sqlite.exec("ALTER TABLE waitlist ADD COLUMN demo_most_clicked_step TEXT NOT NULL DEFAULT '';");
}
if (!hasColumn("demo_step_clicks")) {
  sqlite.exec("ALTER TABLE waitlist ADD COLUMN demo_step_clicks TEXT NOT NULL DEFAULT '';");
}

export const db = drizzle(sqlite);

export interface IStorage {
  createWaitlistEntry(entry: InsertWaitlist): Promise<WaitlistEntry>;
  listWaitlistEntries(): Promise<WaitlistEntry[]>;
  countWaitlist(): Promise<number>;
  getDemoInterestSummary(): Promise<{
    total: number;
    lastStepCounts: Record<string, number>;
    mostClickedStepCounts: Record<string, number>;
  }>;
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

  async getDemoInterestSummary() {
    const rows = db.select().from(waitlist).all();
    const lastStepCounts: Record<string, number> = {};
    const mostClickedStepCounts: Record<string, number> = {};
    for (const row of rows) {
      if (row.demoLastStep) {
        lastStepCounts[row.demoLastStep] = (lastStepCounts[row.demoLastStep] ?? 0) + 1;
      }
      if (row.demoMostClickedStep) {
        mostClickedStepCounts[row.demoMostClickedStep] =
          (mostClickedStepCounts[row.demoMostClickedStep] ?? 0) + 1;
      }
    }
    return { total: rows.length, lastStepCounts, mostClickedStepCounts };
  }
}

export const storage = new DatabaseStorage();
