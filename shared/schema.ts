import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { z } from "zod";

// Production persistence lives in Supabase (`public.waitlist`), accessed from
// the browser via `@supabase/supabase-js`. The Drizzle/SQLite table below is
// retained ONLY for the legacy Express + better-sqlite3 server under `server/`
// (kept for local dev / reference) — Vercel does not run it.

export const waitlist = sqliteTable("waitlist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  installVolume: text("install_volume").notNull(),
  bottleneck: text("bottleneck").notNull().default(""),
  demoLastStep: text("demo_last_step").notNull().default(""),
  demoMostClickedStep: text("demo_most_clicked_step").notNull().default(""),
  demoStepClicks: text("demo_step_clicks").notNull().default(""),
  createdAt: integer("created_at").notNull(),
});

// Client-side waitlist payload. `demoStepClicks` is a JSON object so the
// browser can hand Supabase a real jsonb value (not a stringified blob).
export const insertWaitlistSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Enter a valid work email").max(160),
  company: z.string().min(1, "Company is required").max(160),
  role: z.enum(["Dealer/Owner", "Crew Lead", "Electrician", "Sales", "Other"]),
  installVolume: z.enum([
    "0-10/month",
    "11-25/month",
    "26-50/month",
    "50+/month",
  ]),
  bottleneck: z.string().max(2000).default(""),
  demoLastStep: z.string().max(40).default(""),
  demoMostClickedStep: z.string().max(40).default(""),
  demoStepClicks: z.record(z.number()).default({}),
});

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type WaitlistEntry = typeof waitlist.$inferSelect;
