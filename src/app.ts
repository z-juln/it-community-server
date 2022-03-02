import Koa from "koa";
const app: Koa = new Koa();

import Debug from "debug";
const debug = Debug("http");

import views from "koa-views";
import bodyParser from "koa-bodyparser";
import serve from "koa-static";

import index from "./routes/index";
import users from "./routes/user";

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
app.use(index.routes()).use(index.allowedMethods());
app.use(users.routes()).use(users.allowedMethods());

// error-handling
app.on("error", (err: Error, ctx: Koa.Context) => {
  console.error("server error", err, ctx);
});

export default app;
