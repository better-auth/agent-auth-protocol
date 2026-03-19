import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Per-IP sliding window: 10 requests per 60 seconds.
 * Prevents rapid-fire abuse while allowing normal demo usage.
 */
export const chatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "aap:demo:chat",
});

/**
 * Daily budget cap across all users: 500 requests/day.
 * Acts as a cost circuit breaker for the OpenRouter API key.
 */
export const dailyBudgetLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(500, "1 d"),
  analytics: true,
  prefix: "aap:demo:daily",
});

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"
  );
}
