// utils/redis.ts
import Redis from 'ioredis';
const redisHost = process.env.NODE_ENV === 'production' ? 'redis' : 'localhost'
const redis = new Redis({
  host: redisHost,
  port: 6379
});

export default redis;
