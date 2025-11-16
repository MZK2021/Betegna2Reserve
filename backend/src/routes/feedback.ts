import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { feedbacks, rooms, users } from "../data/store";
import type { Feedback } from "../models/types";

const router = Router();

const feedbackSchema = z.object({
  toUserId: z.string().optional(),
  roomId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  stayStart: z.string().datetime().optional(),
  stayEnd: z.string().datetime().optional(),
});

router.post("/", requireAuth, (req: AuthRequest, res) => {
  const parse = feedbackSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
  }
  const data = parse.data;
  if (!data.toUserId && !data.roomId) {
    return res.status(400).json({ error: "toUserId or roomId is required" });
  }
  const now = new Date();
  const fb: Feedback = {
    id: `fb_${Date.now()}`,
    fromUserId: req.user!.id,
    toUserId: data.toUserId,
    roomId: data.roomId,
    rating: data.rating,
    comment: data.comment,
    stayStart: data.stayStart ? new Date(data.stayStart) : undefined,
    stayEnd: data.stayEnd ? new Date(data.stayEnd) : undefined,
    createdAt: now,
    updatedAt: now,
  };
  feedbacks.push(fb);

  if (fb.roomId) {
    const room = rooms.find((r) => r.id === fb.roomId);
    if (room) {
      const roomFeedback = feedbacks.filter((f) => f.roomId === room.id);
      room.ratingCount = roomFeedback.length;
      room.ratingAvg =
        roomFeedback.reduce((sum, f) => sum + f.rating, 0) / (room.ratingCount || 1);
      room.updatedAt = new Date();
    }
  }
  if (fb.toUserId) {
    const user = users.find((u) => u.id === fb.toUserId);
    if (user) {
      const userFeedback = feedbacks.filter((f) => f.toUserId === user.id);
      user.ratingCount = userFeedback.length;
      user.ratingAvg =
        userFeedback.reduce((sum, f) => sum + f.rating, 0) / (user.ratingCount || 1);
      user.updatedAt = new Date();
    }
  }

  return res.status(201).json(fb);
});

router.get("/rooms/:id", (req, res) => {
  const list = feedbacks.filter((f) => f.roomId === req.params.id);
  return res.json(list);
});

router.get("/users/:id", (req, res) => {
  const list = feedbacks.filter((f) => f.toUserId === req.params.id);
  return res.json(list);
});

export const feedbackRouter = router;


