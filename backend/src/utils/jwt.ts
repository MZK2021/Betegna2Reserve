import jwt from "jsonwebtoken";
import { config } from "../config/env";
import type { UserRole } from "../models/types";

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.accessTokenTtlSec,
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.refreshTokenTtlSec,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtAccessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtRefreshSecret) as JwtPayload;
}


