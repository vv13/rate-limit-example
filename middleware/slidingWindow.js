import Redis from "ioredis";

const DURATION = 60;
const MAX_REQ_IN_DURATION = 100;
const SPLIT_DURATION = 0.0001;

const redisClient = new Redis(6379);

export const slidingWindow = async (ctx, next) => {
  const redisKey = `ratelimit:${ctx.ip}`;
  const durationEnd = Date.now();
  const durationStart = durationEnd - DURATION * 1000;
  const splitStart = durationEnd - SPLIT_DURATION * 1000;
  const userRequestMap = await redisClient.hgetall(redisKey);
  if (Object.keys(userRequestMap).length === 0) {
    await redisClient
      .multi()
      .hset(redisKey, durationEnd, 1)
      .expire(redisKey, DURATION)
      .exec();
    next();
    return;
  }
  let requestCount = 0;
  let splitTimestamp = null;
  for (let [timestamp, count] of Object.entries(userRequestMap)) {
    if (Number(timestamp) < durationStart) {
      await redisClient.hdel(redisKey, timestamp);
    } else {
      requestCount += Number(count);
      if (Number(timestamp) > splitStart) {
        splitTimestamp = timestamp;
      }
    }
  }
  if (requestCount < MAX_REQ_IN_DURATION) {
    await redisClient.hincrby(redisKey, splitTimestamp ? splitTimestamp : durationEnd, 1);
    await redisClient.expire(redisKey, DURATION);
    next();
  } else {
    ctx.status = 429;
    ctx.body = "you have too many requests";
  }
};
