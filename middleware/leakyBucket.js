import Redis from "ioredis";

const RATE = 1000;
const CAPACITY = 5;
const redisClient = new Redis(6379);

export const leakyBucket = async (ctx, next) => {
  const redisKey = `ratelimit:${ctx.ip}`;
  const now = Date.now();
  const exists = await redisClient.exists(redisKey);
  if (!exists) {
    await redisClient
      .multi()
      .hset(redisKey, "amount", 1)
      .hset(redisKey, "update_time", now)
      .expire(redisKey, (1 * RATE) / 1000)
      .exec();
    next();
    return;
  }
  const updateTime = await redisClient.hget(redisKey, "update_time");
  const amount = await redisClient.hget(redisKey, "amount");
  const newAmount = Math.ceil(
    Math.max(0, amount - (now - updateTime) / RATE) + 1
  );

  if (newAmount <= CAPACITY) {
    await redisClient
      .multi()
      .hset(redisKey, "update_time", now)
      .hset(redisKey, "amount", newAmount)
      .expire(redisKey, newAmount * RATE / 1000)
      .exec()
    next();
  } else {
    ctx.status = 429;
    ctx.body = "you have too many requests";
  }
};
