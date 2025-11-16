# Test Credentials

**⚠️ FOR DEVELOPMENT/TESTING ONLY - REMOVE BEFORE PRODUCTION**

## Regular User
- **Email:** `test@betegna.com`
- **Password:** `test123`
- **Role:** TENANT

## Room Owner User
- **Email:** `owner@betegna.com`
- **Password:** `owner123`
- **Role:** OWNER

## Admin User
- **Email:** `admin@betegna.com`
- **Password:** `admin123`
- **Role:** ADMIN

---

These test users are automatically created when the backend server starts. They are stored in memory and will be lost when the server restarts (unless you register them again through the signup flow).

To remove these test users:
1. Delete `backend/src/data/seed.ts`
2. Remove the import and call in `backend/src/server.ts`

