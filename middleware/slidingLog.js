import Redis from "ioredis";

const DURATION = 60;
const MAX_REQ_IN_DURATION = 100;
const redisClient = new Redis(6379);

export const slidingLog = async (ctx, next) => {
  const redisKey = `ratelimit:${ctx.ip}`;
  const durationEnd = Date.now();
  const durationStart = durationEnd - DURATION * 1000;
  const exists = await redisClient.exists(redisKey);
  if (!exists) {
    await redisClient
      .multi()
      .zadd(redisKey, durationEnd, durationEnd)
      .expire(redisKey, DURATION)
      .exec();
    next();
    return;
  }
  const re = await redisClient
    .multi()
    .zremrangebyscore(redisKey, 0, durationStart)
    .zcard(redisKey)
    .expire(redisKey, DURATION)
    .exec();
  if (re[1][1] < MAX_REQ_IN_DURATION) {
    await redisClient.zadd(redisKey, durationEnd, durationEnd);
    next();
  } else {
    ctx.status = 429;
    ctx.body = "you have too many requests";
  }
};
