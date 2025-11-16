import { analyticsEvents } from "../data/store";
import type { AnalyticsEvent, AnalyticsEventType } from "../models/types";

export function logEvent(
  type: AnalyticsEventType,
  data: { anonymousUserId?: string; properties?: Record<string, unknown> } = {},
): void {
  const now = new Date();
  const event: AnalyticsEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    anonymousUserId: data.anonymousUserId,
    properties: data.properties ?? {},
    createdAt: now,
  };
  analyticsEvents.push(event);
}


