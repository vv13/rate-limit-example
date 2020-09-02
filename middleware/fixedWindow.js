import Redis from 'ioredis'

const FIX_WINDOW_SIZE = 60; // second
const FIX_WINDOW_MAX_REQUEST = 100;

const redisClient = new Redis(6379);

export const fixedWindow = async (ctx, next) => {
  const redisKey = `${ctx.ip}:ratelimit`;
  const curCount = await redisClient.get(redisKey);
  if (!curCount) {
    await redisClient.setex(redisKey, FIX_WINDOW_SIZE, 1);
    next();
    return;
  }
  if (Number(curCount) < FIX_WINDOW_MAX_REQUEST) {
    await redisClient.incr(redisKey);
    next();
  } else {
    ctx.status = 429;
    ctx.body = "you have too many requests";
  }
};
