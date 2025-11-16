import { Router } from "express";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth";
import { ads, analyticsEvents, feedbacks, rooms, users } from "../data/store";
import { z } from "zod";
import type { Ad } from "../models/types";

const router = Router();

router.use(requireAuth, requireRole(["ADMIN"]));

router.get("/users", (_req, res) => {
  const safeUsers = users.map(({ passwordHash, ...rest }) => rest);
  return res.json(safeUsers);
});

router.post("/users/:id/suspend", (req: AuthRequest, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.isPhoneVerified = false;
  user.updatedAt = new Date();
  return res.json({ success: true });
});

router.get("/rooms", (_req, res) => {
  return res.json(rooms);
});

router.get("/feedback", (_req, res) => {
  return res.json(feedbacks);
});

const adSchema = z.object({
  mediaUrl: z.string().url(),
  type: z.enum(["IMAGE", "VIDEO"]),
  linkUrl: z.string().url(),
  position: z.enum(["LANDING_TOP", "LISTING_SIDEBAR", "CHAT_BOTTOM", "PROFILE_SIDEBAR"]),
  countries: z.array(z.string()).optional(),
  cities: z.array(z.string()).optional(),
  active: z.boolean().default(true),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
});

router.post("/ads", (req, res) => {
  const parse = adSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
  }
  const now = new Date();
  const ad: Ad = {
    id: `ad_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    ...parse.data,
    startAt: parse.data.startAt ? new Date(parse.data.startAt) : undefined,
    endAt: parse.data.endAt ? new Date(parse.data.endAt) : undefined,
  };
  ads.push(ad);
  return res.status(201).json(ad);
});

router.put("/ads/:id", (req, res) => {
  const ad = ads.find((a) => a.id === req.params.id);
  if (!ad) return res.status(404).json({ error: "Ad not found" });
  const parse = adSchema.partial().safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
  }
  Object.assign(ad, parse.data, {
    updatedAt: new Date(),
    startAt: parse.data.startAt ? new Date(parse.data.startAt) : ad.startAt,
    endAt: parse.data.endAt ? new Date(parse.data.endAt) : ad.endAt,
  });
  return res.json(ad);
});

router.delete("/ads/:id", (req, res) => {
  const idx = ads.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Ad not found" });
  ads.splice(idx, 1);
  return res.json({ success: true });
});

router.get("/analytics/summary", (_req, res) => {
  const usersPerCity: Record<string, number> = {};
  users.forEach((u) => {
    if (!u.cityCurrent) return;
    usersPerCity[u.cityCurrent] = (usersPerCity[u.cityCurrent] || 0) + 1;
  });

  const listingsPerCity: Record<string, number> = {};
  rooms.forEach((r) => {
    listingsPerCity[r.city] = (listingsPerCity[r.city] || 0) + 1;
  });

  return res.json({
    usersPerCity,
    listingsPerCity,
    eventsCount: analyticsEvents.length,
  });
});

export const adminRouter = router;


