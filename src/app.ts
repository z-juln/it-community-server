/**
 * init db
 */
import { connectDB, initDatabase } from "./utils";
connectDB().then((sql) => {
  initDatabase(sql);
});

import Koa from "koa";
const app: Koa = new Koa();

import Debug from "debug";
const debug = Debug("http");

import views from "koa-views";
import bodyParser from "koa-bodyparser";
import serve from "koa-static";

import { logRoute } from "./routes/_middleware";
import index from "./routes/index";
import users from "./routes/user";
import provider from "./routes/provider";
import zone from "./routes/zone";
import studyRoute from "./routes/studyRoute";
import studySet from "./routes/studySet";
import studyItem from "./routes/studyItem";
import discuss from "./routes/discuss";
import ranking from "./routes/ranking";

// body parser
app.use(
  bodyParser({
    enableTypes: ["json", "form", "text"],
  })
);

app.use(serve(__dirname + "/public"));
app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);

// logger
app.use(async (ctx: Koa.Context, next: Function) => {
  const start: number = Date.now();
  await next();
  const now: number = Date.now();
  const ms = now - start;
  debug(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(logRoute);
app.use(index.routes()).use(index.allowedMethods());
app.use(users.routes()).use(users.allowedMethods());
app.use(provider.routes()).use(provider.allowedMethods());
app.use(zone.routes()).use(zone.allowedMethods());
app.use(studyRoute.routes()).use(studyRoute.allowedMethods());
app.use(studySet.routes()).use(studySet.allowedMethods());
app.use(studyItem.routes()).use(studyItem.allowedMethods());
app.use(discuss.routes()).use(discuss.allowedMethods());
app.use(ranking.routes()).use(ranking.allowedMethods());

// error-handling
app.on("error", (err: Error, ctx: Koa.Context) => {
  console.error("server error", err, ctx);
});

export default app;
