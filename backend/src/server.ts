import app from "./app";
import { seedAll } from "./data/seed";

const PORT = process.env.PORT || 4000;

// Initialize test users and mock data on server start
seedAll().then(() => {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Betegna backend listening on port ${PORT}`);
    console.log("\n📝 Test Credentials:");
    console.log("   User:  test@betegna.com / test123");
    console.log("   Owner: owner@betegna.com / owner123");
    console.log("   Admin: admin@betegna.com / admin123");
    console.log("   (Remove these before production)\n");
  });
});


