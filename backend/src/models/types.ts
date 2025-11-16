export type UserRole = "TENANT" | "OWNER" | "BOTH" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  gender?: string;
  religion?: string;
  languages?: string[];
  occupation?: string;
  cityCurrent?: string;
  preferredCities?: string[];
  workSchedule?: string;
  preferences?: {
    preferredGender?: string;
    preferredReligion?: string;
    budgetMin?: number;
    budgetMax?: number;
    stayDuration?: string;
    smokingTolerance?: string;
    alcoholTolerance?: string;
  };
  ratingAvg?: number;
  ratingCount?: number;
  isPhoneVerified?: boolean;
  isIdVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  ownerId: string;
  country: string;
  city: string;
  area: string;
  roomType: "SHARED" | "PRIVATE" | "BED_SPACE";
  bedsTotal: number;
  bedsAvailable: number;
  priceMonthly: number;
  depositAmount?: number;
  utilitiesIncluded?: {
    electricity?: boolean;
    water?: boolean;
    internet?: boolean;
    gas?: boolean;
  };
  shortStayAllowed: boolean;
  minStayMonths?: number;
  rules?: {
    smoking?: string;
    alcohol?: string;
    visitors?: string;
    quietHours?: string;
  };
  preferences?: {
    preferredGender?: string;
    preferredReligion?: string;
    preferredOccupation?: string;
  };
  amenities?: string[];
  photos?: string[];
  description?: string;
  status: "ACTIVE" | "FULL" | "ARCHIVED";
  ratingAvg?: number;
  ratingCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Feedback {
  id: string;
  fromUserId: string;
  toUserId?: string;
  roomId?: string;
  rating: number;
  comment?: string;
  stayStart?: Date;
  stayEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AdPosition =
  | "LANDING_TOP"
  | "LISTING_SIDEBAR"
  | "CHAT_BOTTOM"
  | "PROFILE_SIDEBAR";

export interface Ad {
  id: string;
  mediaUrl: string;
  type: "IMAGE" | "VIDEO";
  linkUrl: string;
  position: AdPosition;
  countries?: string[];
  cities?: string[];
  active: boolean;
  startAt?: Date;
  endAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  roomId?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AnalyticsEventType =
  | "profile_created"
  | "listing_created"
  | "search_performed"
  | "ad_clicked";

export interface AnalyticsEvent {
  id: string;
  anonymousUserId?: string;
  type: AnalyticsEventType;
  properties: Record<string, unknown>;
  createdAt: Date;
}


