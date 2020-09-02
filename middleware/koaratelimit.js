import ratelimit from "koa-ratelimit";

export const koaRateLimit = ratelimit({
  driver: "memory",
  db: new Map(),
  duration: 60 * 1000,
  errorMessage: "Sometimes You Just Have to Slow Down.",
  id: (ctx) => ctx.ip,
  headers: {
    remaining: "Rate-Limit-Remaining",
    reset: "Rate-Limit-Reset",
    total: "Rate-Limit-Total",
  },
  max: 100,
  disableHeader: false,
});
