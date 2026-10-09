import { Redis } from "ioredis";
import { env } from "@/server/config";
import { logger } from "@/server/logger";

type PubSubMessage = {
  event: string;
  channel: string;
  payload: unknown;
};

let publisher: Redis | null = null;
let subscriber: Redis | null = null;
const subscribers = new Map<string, Set<(msg: PubSubMessage) => void>>();

export function getPublisher(): Redis | null {
  if (!env.REDIS_URL) return null;
  if (!publisher) {
    publisher = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      connectTimeout: 2_000,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });
    publisher.on("error", (err) => logger.warn({ err }, "Redis publisher error"));
  }
  return publisher;
}

export function getSubscriber(): Redis | null {
  if (!env.REDIS_URL) return null;
  if (!subscriber) {
    subscriber = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      connectTimeout: 2_000,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });
    subscriber.on("error", (err) => logger.warn({ err }, "Redis subscriber error"));
    subscriber.on("message", (channel, message) => {
      try {
        const msg: PubSubMessage = JSON.parse(message);
        const handlers = subscribers.get(channel);
        if (handlers) {
          handlers.forEach((fn) => fn(msg));
        }
      } catch (err) {
        logger.warn({ err, channel }, "Failed to parse pub/sub message");
      }
    });
  }
  return subscriber;
}

export async function publish(channel: string, event: string, payload: unknown): Promise<boolean> {
  const redis = getPublisher();
  if (!redis) return false;
  try {
    await redis.publish(channel, JSON.stringify({ event, channel, payload }));
    return true;
  } catch (err) {
    logger.warn({ err, channel }, "Failed to publish message");
    return false;
  }
}

export function subscribe(channel: string, handler: (msg: PubSubMessage) => void): () => void {
  const redis = getSubscriber();
  if (!redis) {
    return () => {};
  }
  
  if (!subscribers.has(channel)) {
    subscribers.set(channel, new Set());
    redis.subscribe(channel).catch((err) => logger.warn({ err }, "Subscribe failed"));
  }
  
  subscribers.get(channel)!.add(handler);
  
  return () => {
    const handlers = subscribers.get(channel);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        subscribers.delete(channel);
        redis.unsubscribe(channel).catch(() => {});
      }
    }
  };
}

export const REALTIME_CHANNELS = {
  SOS_NEW: "sos:new",
  RISK_HEATMAP_UPDATED: "risk:heatmap:updated",
  FLEET_LOCATION: "fleet:location",
  ALERT_NEW: "alert:new",
  ROAD_STATUS_CHANGE: "road:status_change",
  SHELTER_STATUS_CHANGE: "shelter:status_change",
} as const;

export async function publishSosNew(payload: unknown) {
  return publish(REALTIME_CHANNELS.SOS_NEW, "sos:new", payload);
}

export async function publishRiskHeatmapUpdated(payload: unknown) {
  return publish(REALTIME_CHANNELS.RISK_HEATMAP_UPDATED, "risk:heatmap:updated", payload);
}

export async function publishFleetLocation(payload: unknown) {
  return publish(REALTIME_CHANNELS.FLEET_LOCATION, "fleet:location", payload);
}

export async function publishAlertNew(payload: unknown) {
  return publish(REALTIME_CHANNELS.ALERT_NEW, "alert:new", payload);
}

export async function publishRoadStatusChange(payload: unknown) {
  return publish(REALTIME_CHANNELS.ROAD_STATUS_CHANGE, "road:status_change", payload);
}

export async function publishShelterStatusChange(payload: unknown) {
  return publish(REALTIME_CHANNELS.SHELTER_STATUS_CHANGE, "shelter:status_change", payload);
}