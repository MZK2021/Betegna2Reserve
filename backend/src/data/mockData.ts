import bcrypt from "bcryptjs";
import { users, rooms, ads, feedbacks } from "./store";
import type { User, Room, Ad, Feedback } from "../models/types";

const areas = {
  UAE: {
    Dubai: ["Downtown", "Marina", "JBR", "Deira", "Bur Dubai"],
    "Abu Dhabi": ["Corniche", "Al Khalidiyah", "Al Markaziyah", "Yas Island"],
    Sharjah: ["Al Qasimia", "Al Nahda", "Al Majaz"],
    Ajman: ["Al Nuaimiya", "Al Rashidiya"],
  },
  KSA: {
    Riyadh: ["Al Olaya", "Al Malaz", "Al Wurud"],
    Jeddah: ["Al Balad", "Al Hamra", "Corniche"],
    Dammam: ["Al Khobar", "Al Faisaliyah"],
  },
  QATAR: {
    Doha: ["West Bay", "Al Sadd", "Pearl Qatar"],
  },
  OMAN: {
    Muscat: ["Al Khuwair", "Ruwi", "Seeb"],
  },
  BAHRAIN: {
    Manama: ["Adliya", "Juffair", "Seef"],
  },
  KUWAIT: {
    "Kuwait City": ["Salmiya", "Hawally", "Jabriya"],
  },
  LEBANON: {
    Beirut: ["Hamra", "Achrafieh", "Downtown"],
  },
  YEMEN: {
    "Sana'a": ["Old City", "Hadda", "Al Sabeen"],
  },
  EGYPT: {
    Cairo: ["Zamalek", "Maadi", "Heliopolis"],
    Alexandria: ["Montaza", "Stanley"],
  },
};

const ethiopianNames = {
  male: ["Abebe", "Tadesse", "Mulugeta", "Yonas", "Solomon", "Daniel", "Mekonnen", "Haile"],
  female: ["Marta", "Tigist", "Hirut", "Selam", "Aster", "Mulu", "Yodit", "Rahel"],
  last: ["Tesfaye", "Gebre", "Haile", "Mengistu", "Tadesse", "Assefa", "Kebede", "Worku"],
};

const occupations = [
  "Nurse",
  "Domestic Worker",
  "Cleaner",
  "Office Worker",
  "Driver",
  "Student",
  "Security Guard",
  "Restaurant Worker",
  "Teacher",
  "Engineer",
];

const religions = ["Orthodox", "Muslim", "Protestant", "Catholic"];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createMockUsers() {
  const now = new Date();
  let userIdCounter = 1;

  for (const [country, cities] of Object.entries(areas)) {
    for (const [city, cityAreas] of Object.entries(cities)) {
      // Create 3-5 users per city (mix of tenants and owners) for better data population
      const userCount = randomInt(3, 5);
      for (let i = 0; i < userCount; i++) {
        const isOwner = Math.random() > 0.5;
        const gender = Math.random() > 0.5 ? "male" : "female";
        const firstName = randomElement(ethiopianNames[gender as keyof typeof ethiopianNames]);
        const lastName = randomElement(ethiopianNames.last);
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${userIdCounter}@betegna.com`;

        const user: User = {
          id: `user_${userIdCounter++}`,
          name,
          email,
          phone: `+971${randomInt(500000000, 599999999)}`,
          passwordHash: await bcrypt.hash("password123", 10),
          role: isOwner ? "OWNER" : "TENANT",
          gender: gender === "male" ? "Male" : "Female",
          religion: randomElement(religions),
          languages: ["Amharic", "English", randomElement(["Oromiffa", "Tigrinya"])],
          occupation: randomElement(occupations),
          cityCurrent: city,
          preferredCities: [city],
          workSchedule: randomElement(["Day", "Night", "Shift"]),
          preferences: {
            preferredGender: randomElement(["Any", "Same", "Female", "Male"]),
            preferredReligion: randomElement(["Any", "Orthodox", "Muslim"]),
            budgetMin: randomInt(500, 1500),
            budgetMax: randomInt(2000, 5000),
            stayDuration: randomElement(["1-3 months", "3-6 months", "6+ months"]),
            smokingTolerance: randomElement(["No", "Yes", "Outside only"]),
            alcoholTolerance: randomElement(["No", "Yes"]),
          },
          ratingAvg: randomInt(35, 50) / 10,
          ratingCount: randomInt(2, 15),
          isPhoneVerified: Math.random() > 0.3,
          isIdVerified: Math.random() > 0.5,
          createdAt: new Date(now.getTime() - randomInt(0, 90) * 24 * 60 * 60 * 1000),
          updatedAt: now,
        };

        users.push(user);
      }
    }
  }

  console.log(`✅ Created ${users.length} mock users`);
}

async function createMockRooms() {
  const now = new Date();
  let roomIdCounter = 1;
  const ownerUsers = users.filter((u) => u.role === "OWNER" || u.role === "BOTH");

  for (const [country, cities] of Object.entries(areas)) {
    for (const [city, cityAreas] of Object.entries(cities)) {
      const cityOwners = ownerUsers.filter((u) => u.cityCurrent === city);
      if (cityOwners.length === 0) continue;

      // Create 4-6 rooms per city for better data population
      const roomCount = randomInt(4, 6);
      for (let i = 0; i < roomCount; i++) {
        const owner = randomElement(cityOwners);
        const area = randomElement(cityAreas);
        const roomType = randomElement<Room["roomType"]>(["SHARED", "PRIVATE", "BED_SPACE"]);
        const bedsTotal = roomType === "BED_SPACE" ? randomInt(2, 4) : randomInt(1, 2);
        const bedsAvailable = randomInt(1, bedsTotal);

        const basePrice = country === "UAE" ? 1500 : country === "QATAR" ? 1800 : 1200;
        const priceMonthly = randomInt(basePrice, basePrice + 1000);

        const room: Room = {
          id: `room_${roomIdCounter++}`,
          ownerId: owner.id,
          country,
          city,
          area,
          roomType,
          bedsTotal,
          bedsAvailable,
          priceMonthly,
          depositAmount: Math.random() > 0.5 ? priceMonthly : undefined,
          utilitiesIncluded: {
            electricity: Math.random() > 0.3,
            water: Math.random() > 0.3,
            internet: Math.random() > 0.2,
            gas: Math.random() > 0.5,
          },
          shortStayAllowed: Math.random() > 0.6,
          minStayMonths: randomInt(1, 3),
          rules: {
            smoking: randomElement(["Not allowed", "Outside only", "Allowed"]),
            alcohol: randomElement(["Not allowed", "Allowed"]),
            visitors: randomElement(["Allowed", "Limited", "Not allowed"]),
            quietHours: randomElement(["10 PM - 6 AM", "11 PM - 7 AM", "Flexible"]),
          },
          preferences: {
            preferredGender: randomElement(["Any", "Female", "Male"]),
            preferredReligion: randomElement(["Any", "Orthodox", "Muslim"]),
            preferredOccupation: randomElement(["Any", "Student", "Worker"]),
          },
          amenities: [
            ...(Math.random() > 0.2 ? ["Wi-Fi"] : []),
            ...(Math.random() > 0.2 ? ["AC"] : []),
            ...(Math.random() > 0.3 ? ["Laundry"] : []),
            ...(Math.random() > 0.4 ? ["Parking"] : []),
            ...(Math.random() > 0.3 ? ["Furnished"] : []),
          ],
          photos: (() => {
            // Different room images from Unsplash - varied and realistic
            const roomImages = [
              ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"],
              ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800&h=600&fit=crop"],
              ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=600&fit=crop"],
              ["https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop"],
              ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"],
              ["https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"],
              ["https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop"],
              ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"],
            ];
            return randomElement(roomImages);
          })(),
          description: `Cozy ${roomType.toLowerCase()} room in ${area}, ${city}. Perfect for Ethiopian community members. Close to public transport and Ethiopian restaurants.`,
          status: bedsAvailable > 0 ? "ACTIVE" : "FULL",
          ratingAvg: randomInt(35, 50) / 10,
          ratingCount: randomInt(1, 10),
          createdAt: new Date(now.getTime() - randomInt(0, 60) * 24 * 60 * 60 * 1000),
          updatedAt: now,
        };

        rooms.push(room);
      }
    }
  }

  console.log(`✅ Created ${rooms.length} mock rooms`);
}

function createMockAds() {
  const now = new Date();

  // Ethiopian business ads - relevant to the community
  const ethiopianGroceryAds = [
    {
      mediaUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=400&fit=crop",
      linkUrl: "https://example.com/ethiopian-grocery",
      title: "Ethiopian Grocery Store - Fresh Ingredients"
    },
    {
      mediaUrl: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=400&fit=crop",
      linkUrl: "https://example.com/ethiopian-market",
      title: "Ethiopian Market - Spices & More"
    },
    {
      mediaUrl: "https://images.unsplash.com/photo-1556910103-2d2624629b5a?w=800&h=400&fit=crop",
      linkUrl: "https://example.com/ethiopian-spices",
      title: "Ethiopian Spices & Traditional Foods"
    }
  ];

  const ethiopianRestaurantAds = [
    {
      mediaUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop",
      linkUrl: "https://example.com/ethiopian-restaurant",
      title: "Ethiopian Restaurant - Authentic Cuisine"
    },
    {
      mediaUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop",
      linkUrl: "https://example.com/ethiopian-cuisine",
      title: "Traditional Ethiopian Food - Injera & More"
    },
    {
      mediaUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=400&fit=crop",
      linkUrl: "https://example.com/ethiopian-food",
      title: "Ethiopian Restaurant - Home Away From Home"
    }
  ];

  const sponsorBanners = [
    {
      mediaUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=400&fit=crop",
      linkUrl: "https://example.com/sponsor",
      title: "Community Sponsor"
    },
    {
      mediaUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
      linkUrl: "https://example.com/community-support",
      title: "Supporting Ethiopian Community"
    }
  ];

  // Landing Top Ad
  const landingAd: Ad = {
    id: "ad_landing_top",
    mediaUrl: randomElement(sponsorBanners).mediaUrl,
    type: "IMAGE",
    linkUrl: randomElement(sponsorBanners).linkUrl,
    position: "LANDING_TOP",
    countries: undefined,
    cities: undefined,
    active: true,
    startAt: now,
    endAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
  };
  ads.push(landingAd);

  // Listing Sidebar Ads - Ethiopian Grocery & Restaurant
  const sidebarGroceryAd: Ad = {
    id: "ad_listing_sidebar_grocery",
    mediaUrl: randomElement(ethiopianGroceryAds).mediaUrl,
    type: "IMAGE",
    linkUrl: randomElement(ethiopianGroceryAds).linkUrl,
    position: "LISTING_SIDEBAR",
    countries: ["UAE", "KSA", "QATAR", "OMAN", "BAHRAIN", "KUWAIT", "LEBANON", "YEMEN", "EGYPT"],
    cities: undefined,
    active: true,
    startAt: now,
    endAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
  };
  ads.push(sidebarGroceryAd);

  const sidebarRestaurantAd: Ad = {
    id: "ad_listing_sidebar_restaurant",
    mediaUrl: randomElement(ethiopianRestaurantAds).mediaUrl,
    type: "IMAGE",
    linkUrl: randomElement(ethiopianRestaurantAds).linkUrl,
    position: "LISTING_SIDEBAR",
    countries: ["UAE", "KSA", "QATAR", "OMAN", "BAHRAIN", "KUWAIT", "LEBANON", "YEMEN", "EGYPT"],
    cities: undefined,
    active: true,
    startAt: now,
    endAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
  };
  ads.push(sidebarRestaurantAd);

  // Chat Bottom Ad
  const chatAd: Ad = {
    id: "ad_chat_bottom",
    mediaUrl: randomElement(sponsorBanners).mediaUrl,
    type: "IMAGE",
    linkUrl: randomElement(sponsorBanners).linkUrl,
    position: "CHAT_BOTTOM",
    countries: ["UAE", "KSA", "QATAR"],
    cities: undefined,
    active: true,
    startAt: now,
    endAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
  };
  ads.push(chatAd);

  // Profile Sidebar Ad
  const profileAd: Ad = {
    id: "ad_profile_sidebar",
    mediaUrl: randomElement(ethiopianGroceryAds).mediaUrl,
    type: "IMAGE",
    linkUrl: randomElement(ethiopianGroceryAds).linkUrl,
    position: "PROFILE_SIDEBAR",
    countries: ["UAE", "KSA", "QATAR"],
    cities: undefined,
    active: true,
    startAt: now,
    endAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
  };
  ads.push(profileAd);

  console.log(`✅ Created ${ads.length} mock ads (Ethiopian businesses)`);
}

function createMockFeedback() {
  const now = new Date();
  const tenantUsers = users.filter((u) => u.role === "TENANT" || u.role === "BOTH");
  const activeRooms = rooms.filter((r) => r.status === "ACTIVE");

  // Create 1-2 feedback per room
  for (const room of activeRooms.slice(0, Math.min(20, activeRooms.length))) {
    const feedbackCount = randomInt(1, 2);
    for (let i = 0; i < feedbackCount; i++) {
      const tenant = randomElement(tenantUsers);
      const feedback: Feedback = {
        id: `feedback_${room.id}_${i}`,
        fromUserId: tenant.id,
        roomId: room.id,
        rating: randomInt(3, 5),
        comment: randomElement([
          "Great place, very clean and friendly host!",
          "Perfect location, close to everything.",
          "Comfortable room, would stay again.",
          "Nice area, good value for money.",
          "Host was very helpful and understanding.",
        ]),
        stayStart: new Date(now.getTime() - randomInt(30, 90) * 24 * 60 * 60 * 1000),
        stayEnd: new Date(now.getTime() - randomInt(0, 30) * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - randomInt(0, 15) * 24 * 60 * 60 * 1000),
        updatedAt: now,
      };

      feedbacks.push(feedback);
    }
  }

  console.log(`✅ Created ${feedbacks.length} mock feedback entries`);
}

export async function seedMockData() {
  console.log("🌱 Seeding mock data...");
  await createMockUsers();
  await createMockRooms();
  createMockAds();
  createMockFeedback();
  console.log("✅ Mock data seeding complete!");
}

