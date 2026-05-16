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

  // GET /api/waitlist/demo-interest — aggregate demo step interest for internal validation
  app.get("/api/waitlist/demo-interest", async (_req, res) => {
    try {
      const summary = await storage.getDemoInterestSummary();
      return res.json(summary);
    } catch {
      return res.json({ total: 0, lastStepCounts: {}, mostClickedStepCounts: {} });
    }
  });

  // GET /api/internal/validation-summary — aggregate validation dashboard data without exposing PII
  app.get("/api/internal/validation-summary", async (_req, res) => {
    try {
      const entries = await storage.listWaitlistEntries();
      const demoInterest = await storage.getDemoInterestSummary();
      const roleCounts: Record<string, number> = {};
      const volumeCounts: Record<string, number> = {};
      const bottleneckCounts: Record<string, number> = {
        quoting: 0,
        scheduling: 0,
        handoff: 0,
        service: 0,
        rebooking: 0,
      };

      for (const entry of entries) {
        roleCounts[entry.role] = (roleCounts[entry.role] ?? 0) + 1;
        volumeCounts[entry.installVolume] = (volumeCounts[entry.installVolume] ?? 0) + 1;
        const text = entry.bottleneck.toLowerCase();
        if (text.includes("quote") || text.includes("estimate") || text.includes("proposal")) {
          bottleneckCounts.quoting += 1;
        }
        if (text.includes("schedul") || text.includes("calendar") || text.includes("route")) {
          bottleneckCounts.scheduling += 1;
        }
        if (text.includes("handoff") || text.includes("crew") || text.includes("text")) {
          bottleneckCounts.handoff += 1;
        }
        if (text.includes("service") || text.includes("warranty") || text.includes("callback")) {
          bottleneckCounts.service += 1;
        }
        if (text.includes("rebook") || text.includes("renew") || text.includes("annual")) {
          bottleneckCounts.rebooking += 1;
        }
      }

      return res.json({
        total: entries.length,
        roleCounts,
        volumeCounts,
        bottleneckCounts,
        demoInterest,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error("validation summary failed", err);
      return res.status(500).json({ error: "Could not load validation summary" });
    }
  });

  return httpServer;
}
