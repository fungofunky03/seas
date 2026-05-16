import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const waitlist = sqliteTable("waitlist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  installVolume: text("install_volume").notNull(),
  bottleneck: text("bottleneck").notNull().default(""),
  createdAt: integer("created_at").notNull(),
});

export const insertWaitlistSchema = createInsertSchema(waitlist)
  .omit({ id: true, createdAt: true })
  .extend({
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
  });

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type WaitlistEntry = typeof waitlist.$inferSelect;
