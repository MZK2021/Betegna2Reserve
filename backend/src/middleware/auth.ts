import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import type { UserRole } from "../models/types";
import { users } from "../data/store";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    const user = users.find((u) => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = { id: user.id, role: user.role };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}


