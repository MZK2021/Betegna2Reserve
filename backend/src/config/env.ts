export const config = {
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
  accessTokenTtlSec: 15 * 60, // 15 minutes
  refreshTokenTtlSec: 7 * 24 * 60 * 60, // 7 days
};


