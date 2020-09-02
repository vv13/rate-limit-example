import Koa from "koa";
// import { slidingWindow } from "./middleware/slidingWindow.js";
// import { slidingLog } from "./middleware/slidingLog.js";
// import { leakyBucket } from "./middleware/leakyBucket.js";
import { tokenBucket } from "./middleware/tokenBucket.js";
const app = new Koa();

// app.use(slidingWindow);
// app.use(slidingLog);
// app.use(leakyBucket);
app.use(tokenBucket);

app.use(async (ctx) => (ctx.body = "Hello World"));
app.listen(3000);
