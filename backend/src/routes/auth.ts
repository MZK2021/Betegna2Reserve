import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { users, refreshTokens } from "../data/store";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import type { User } from "../models/types";
import { logEvent } from "../analytics/logger";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["TENANT", "OWNER", "BOTH"]).default("TENANT"),
});

router.post("/register", async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
  }
  const { name, email, password, role } = parse.data;
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date();
  const user: User = {
    id: `user_${Date.now()}`,
    name,
    email,
    passwordHash,
    role,
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);

  logEvent("profile_created", {
    anonymousUserId: user.id,
    occupation: user.occupation,
    city_current: user.cityCurrent,
    gender: user.gender,
    religion: user.religion,
  });

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
  refreshTokens.set(refreshToken, user.id);

  return res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
  }
  const { email, password } = parse.data;
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
  refreshTokens.set(refreshToken, user.id);

  return res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
});

router.post("/logout", (req, res) => {
  const token = req.body?.refreshToken as string | undefined;
  if (token && refreshTokens.has(token)) {
    refreshTokens.delete(token);
  }
  return res.json({ success: true });
});

router.post("/refresh", (req, res) => {
  const token = req.body?.refreshToken as string | undefined;
  if (!token) {
    return res.status(400).json({ error: "Missing refreshToken" });
  }
  if (!refreshTokens.has(token)) {
    return res.status(401).json({ error: "Invalid refreshToken" });
  }
  try {
    const payload = verifyRefreshToken(token);
    const user = users.find((u) => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: "Invalid refreshToken" });
  }
});

export const authRouter = router;


