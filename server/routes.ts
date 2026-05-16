import type { Express } from "express";
import { createServer } from "node:http";
import type { Server } from "node:http";
import { storage } from "./storage";
import { insertWaitlistSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // POST /api/waitlist — accept signups
  app.post("/api/waitlist", async (req, res) => {
    const parsed = insertWaitlistSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid submission",
        details: parsed.error.flatten(),
      });
    }
    try {
      const entry = await storage.createWaitlistEntry(parsed.data);
      return res.status(201).json({ ok: true, id: entry.id });
    } catch (err) {
      console.error("waitlist insert failed", err);
      return res.status(500).json({ error: "Could not save your entry. Try again." });
    }
  });

  // GET /api/waitlist/count — public counter for social proof (validation only)
  app.get("/api/waitlist/count", async (_req, res) => {
    try {
      const count = await storage.countWaitlist();
      return res.json({ count });
    } catch {
      return res.json({ count: 0 });
    }
  });

  return httpServer;
}
