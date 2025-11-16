import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { rooms, users } from "../data/store";
import type { Room } from "../models/types";
import { logEvent } from "../analytics/logger";

const router = Router();

const roomSchema = z.object({
  country: z.string().min(1),
  city: z.string().min(1),
  area: z.string().min(1),
  roomType: z.enum(["SHARED", "PRIVATE", "BED_SPACE"]),
  bedsTotal: z.number().int().min(1),
  bedsAvailable: z.number().int().min(0),
  priceMonthly: z.number().min(0),
  depositAmount: z.number().min(0).optional(),
  utilitiesIncluded: z
    .object({
      electricity: z.boolean().optional(),
      water: z.boolean().optional(),
      internet: z.boolean().optional(),
      gas: z.boolean().optional(),
    })
    .partial()
    .optional(),
  shortStayAllowed: z.boolean(),
  minStayMonths: z.number().int().min(0).optional(),
  rules: z
    .object({
      smoking: z.string().optional(),
      alcohol: z.string().optional(),
      visitors: z.string().optional(),
      quietHours: z.string().optional(),
    })
    .partial()
    .optional(),
  preferences: z
    .object({
      preferredGender: z.string().optional(),
      preferredReligion: z.string().optional(),
      preferredOccupation: z.string().optional(),
    })
    .partial()
    .optional(),
  amenities: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "FULL", "ARCHIVED"]).optional(),
});

router.post("/", requireAuth, (req: AuthRequest, res) => {
  const parse = roomSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
  }
  const now = new Date();
  const room: Room = {
    id: `room_${Date.now()}`,
    ownerId: req.user!.id,
    ratingAvg: 0,
    ratingCount: 0,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    ...parse.data,
  };
  rooms.push(room);

  logEvent("listing_created", {
    anonymousUserId: req.user!.id,
    properties: {
      country: room.country,
      city: room.city,
      area: room.area,
      price_range: room.priceMonthly,
      short_stay_allowed: room.shortStayAllowed,
      room_type: room.roomType,
    },
  });

  return res.status(201).json(room);
});

router.get("/my-rooms", requireAuth, (req: AuthRequest, res) => {
  const userRooms = rooms.filter((r) => r.ownerId === req.user!.id);
  return res.json(userRooms);
});

router.get("/", (req, res) => {
  const { country, city, area, minPrice, maxPrice, gender, religion, smoking, stayDuration, amenities, shortStay, page = "1", pageSize = "10" } =
    req.query;

  let result = rooms.filter((r) => r.status === "ACTIVE");

  if (country) result = result.filter((r) => r.country === country);
  if (city) result = result.filter((r) => r.city === city);
  if (area) result = result.filter((r) => r.area === area);
  if (minPrice) result = result.filter((r) => r.priceMonthly >= Number(minPrice));
  if (maxPrice) result = result.filter((r) => r.priceMonthly <= Number(maxPrice));
  if (shortStay === "true") result = result.filter((r) => r.shortStayAllowed);
  if (amenities) {
    const list = String(amenities).split(",");
    result = result.filter((r) => list.every((a) => r.amenities?.includes(a)));
  }
  if (gender || religion || smoking || stayDuration) {
    result = result.filter((r) => {
      const prefs = r.preferences || {};
      if (gender && prefs.preferredGender && prefs.preferredGender !== gender) return false;
      if (religion && prefs.preferredReligion && prefs.preferredReligion !== religion) return false;
      if (smoking && r.rules?.smoking && r.rules.smoking !== smoking) return false;
      if (stayDuration && r.minStayMonths && String(r.minStayMonths) !== stayDuration) return false;
      return true;
    });
  }

  const pageNum = Number(page) || 1;
  const sizeNum = Number(pageSize) || 10;
  const start = (pageNum - 1) * sizeNum;
  const paginated = result.slice(start, start + sizeNum);

  logEvent("search_performed", {
    properties: {
      city,
      filters_used: { country, area, gender, religion, smoking, stayDuration, amenities },
      budget_range: { minPrice, maxPrice },
      role: "TENANT",
    },
  });

  return res.json({
    items: paginated,
    total: result.length,
    page: pageNum,
    pageSize: sizeNum,
  });
});

router.get("/:id", (req, res) => {
  const room = rooms.find((r) => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  const owner = users.find((u) => u.id === room.ownerId);
  return res.json({
    ...room,
    owner: owner
      ? {
          id: owner.id,
          name: owner.name,
          ratingAvg: owner.ratingAvg,
          ratingCount: owner.ratingCount,
        }
      : null,
  });
});

router.put("/:id", requireAuth, (req: AuthRequest, res) => {
  const room = rooms.find((r) => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  if (room.ownerId !== req.user!.id && req.user!.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const parse = roomSchema.partial().safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
  }
  Object.assign(room, parse.data, { updatedAt: new Date() });
  return res.json(room);
});

router.delete("/:id", requireAuth, (req: AuthRequest, res) => {
  const room = rooms.find((r) => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  if (room.ownerId !== req.user!.id && req.user!.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  room.status = "ARCHIVED";
  room.updatedAt = new Date();
  return res.json({ success: true });
});

export const roomsRouter = router;


