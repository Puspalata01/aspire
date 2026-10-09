import { Redis } from "ioredis";
import { env } from "@/server/config";

type Globals = { __aspireRedis?: Redis };
const g = globalThis as unknown as Globals;

export function getRedis(): Redis | null {
  if (!env.REDIS_URL) return null;
  if (!g.__aspireRedis) {
    const client = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      connectTimeout: 2_000,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });
    client.on("error", () => undefined);
    g.__aspireRedis = client;
  }
  return g.__aspireRedis;
}

export type RedisCheck = { status: "connected" | "not_configured" | "error"; detail?: string };

export async function checkRedis(): Promise<RedisCheck> {
  const redis = getRedis();
  if (!redis) return { status: "not_configured" };
  try {
    if (redis.status === "wait") await redis.connect();
    const pong = await redis.ping();
    if (pong !== "PONG") throw new Error(`unexpected reply: ${pong}`);
    return { status: "connected" };
  } catch (error) {
    try {
      redis.disconnect();
    } catch {
      // ignore teardown failures
    }
    delete g.__aspireRedis;
    return { status: "error", detail: error instanceof Error ? error.message : String(error) };
  }
}
