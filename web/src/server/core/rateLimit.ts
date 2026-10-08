import { ApiError } from "@/server/core/errors";
import { httpErrors } from "@/server/core/errors";
import { getRedis } from "@/server/core/redis";
import { logger } from "@/server/logger";

export type RateLimitOptions = {
  windowSec?: number;
  maxHits?: number;
};

const DEFAULT_LIMITS = { windowSec: 60, maxHits: 10 };

export async function rateLimitHit(
  identifier: string,
  namespace = "default",
  options: RateLimitOptions = {},
): Promise<void> {
  const { windowSec, maxHits } = { ...DEFAULT_LIMITS, ...options };
  const redis = getRedis();
  if (!redis) return;

  try {
    if (redis.status === "wait") await redis.connect();
    const key = `rl:${namespace}:${identifier}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSec);
    if (count > maxHits) throw httpErrors.rateLimited();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.warn({ err: error }, "rate limiter unavailable — failing open");
  }
}