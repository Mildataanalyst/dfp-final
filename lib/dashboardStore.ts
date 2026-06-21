import { Redis } from '@upstash/redis';
import { DEFAULT_DASHBOARD_DATA } from './progressData';

export const DASHBOARD_KEY = 'dashboard:data';

function withWarning(message: string) {
  return { ...DEFAULT_DASHBOARD_DATA, _dashboardWarning: message };
}

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function getDashboardData() {
  const redis = getRedis();
  if (!redis) {
    return withWarning('Progress storage is not connected yet. Showing default dashboard data until Upstash Redis is configured.');
  }

  try {
    const data = await redis.get(DASHBOARD_KEY);
    return data || DEFAULT_DASHBOARD_DATA;
  } catch (err) {
    console.error('Dashboard Redis read failed:', err);
    return withWarning('Progress storage could not be reached. Showing default dashboard data.');
  }
}

export async function setDashboardData(data: any) {
  const redis = getRedis();
  if (!redis) {
    throw new Error('Progress storage is not connected. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel before publishing.');
  }
  await redis.set(DASHBOARD_KEY, data);
}
