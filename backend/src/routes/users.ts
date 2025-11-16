import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { users } from "../data/store";

const router = Router();

router.get("/me", requireAuth, (req: AuthRequest, res) => {
  const user = users.find((u) => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const { passwordHash, ...safeUser } = user;
  return res.json(safeUser);
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  religion: z.string().optional(),
  languages: z.array(z.string()).optional(),
  occupation: z.string().optional(),
  cityCurrent: z.string().optional(),
  preferredCities: z.array(z.string()).optional(),
  workSchedule: z.string().optional(),
  preferences: z
    .object({
      preferredGender: z.string().optional(),
      preferredReligion: z.string().optional(),
      budgetMin: z.number().optional(),
      budgetMax: z.number().optional(),
      stayDuration: z.string().optional(),
      smokingTolerance: z.string().optional(),
      alcoholTolerance: z.string().optional(),
    })
    .partial()
    .optional(),
});

router.put("/me", requireAuth, (req: AuthRequest, res) => {
  const parse = updateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
  }
  const user = users.find((u) => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  Object.assign(user, parse.data, { updatedAt: new Date() });
  const { passwordHash, ...safeUser } = user;
  return res.json(safeUser);
});

export const usersRouter = router;


