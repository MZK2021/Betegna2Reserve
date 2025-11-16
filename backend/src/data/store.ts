import { Ad, AnalyticsEvent, Conversation, Feedback, Message, Room, User } from "../models/types";

// In-memory data stores for MVP; replace with real DB later.

export const users: User[] = [];
export const rooms: Room[] = [];
export const feedbacks: Feedback[] = [];
export const ads: Ad[] = [];
export const analyticsEvents: AnalyticsEvent[] = [];
export const conversations: Conversation[] = [];
export const messages: Message[] = [];

export const refreshTokens = new Map<string, string>(); // refreshToken -> userId


