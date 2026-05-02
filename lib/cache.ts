import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await getRedis().get<T>(key);
    return data;
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    await getRedis().set(key, value, { ex: ttlSeconds });
  } catch {
    // cache failure is non-fatal
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await getRedis().del(key);
  } catch {
    // ignore
  }
}

export const TTL = {
  AIRPORTS: 60 * 60 * 24 * 30,
  CALENDAR: 60 * 60 * 6,
  FLIGHTS: 60 * 15,
  MONTHLY: 60 * 60 * 24,
  POPULAR: 60 * 60 * 24,
} as const;
