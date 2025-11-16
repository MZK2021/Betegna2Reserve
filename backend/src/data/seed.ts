import bcrypt from "bcryptjs";
import { users } from "./store";
import type { User } from "../models/types";
import { seedMockData } from "./mockData";

/**
 * Initialize test users for development/testing
 * TODO: Remove this before production
 */
export async function seedTestUsers() {
  // Check if test users already exist
  const testUserExists = users.some((u) => u.email === "test@betegna.com");
  const adminUserExists = users.some((u) => u.email === "admin@betegna.com");
  const ownerUserExists = users.some((u) => u.email === "owner@betegna.com");

  if (testUserExists && adminUserExists && ownerUserExists) {
    return; // Already seeded
  }

  const now = new Date();

  // Regular test user (TENANT)
  if (!testUserExists) {
    const testUser: User = {
      id: "test_user_001",
      name: "Test User",
      email: "test@betegna.com",
      passwordHash: await bcrypt.hash("test123", 10),
      role: "TENANT",
      cityCurrent: "Dubai",
      occupation: "Software Developer",
      languages: ["English", "Amharic"],
      createdAt: now,
      updatedAt: now,
    };
    users.push(testUser);
    console.log("✅ Test user created: test@betegna.com / test123");
  }

  // Admin test user
  if (!adminUserExists) {
    const adminUser: User = {
      id: "admin_user_001",
      name: "Admin User",
      email: "admin@betegna.com",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      cityCurrent: "Dubai",
      occupation: "Administrator",
      languages: ["English", "Amharic"],
      createdAt: now,
      updatedAt: now,
    };
    users.push(adminUser);
    console.log("✅ Admin user created: admin@betegna.com / admin123");
  }

  // Room Owner test user
  if (!ownerUserExists) {
    const ownerUser: User = {
      id: "owner_user_001",
      name: "Room Owner",
      email: "owner@betegna.com",
      passwordHash: await bcrypt.hash("owner123", 10),
      role: "OWNER",
      cityCurrent: "Dubai",
      occupation: "Property Manager",
      languages: ["English", "Amharic", "Oromiffa"],
      gender: "Male",
      religion: "Orthodox",
      isPhoneVerified: true,
      ratingAvg: 4.5,
      ratingCount: 12,
      createdAt: now,
      updatedAt: now,
    };
    users.push(ownerUser);
    console.log("✅ Owner user created: owner@betegna.com / owner123");
  }
}

/**
 * Seed all mock data (users, rooms, ads, feedback)
 */
export async function seedAll() {
  await seedTestUsers();
  await seedMockData();
}

