import Router from "koa-router";
import { RouterContext } from "../../src/model";
const router = new Router();

router.get("/", async (ctx: RouterContext, next: any) => {
  ctx.body = {
    code: 1,
    data: {},
    message: "",
  };
});

router.get("/health", async (ctx: RouterContext, next: any) => {
  ctx.body = {
    code: 1,
    data: {},
    message: "",
  };
});

const json = async (ctx: Router.RouterContext, next: any) => {
  ctx.body = {
    query: ctx.request.query,
    body: ctx.request.body,
    headers: ctx.request.headers,
  };
};
router.get("/json", json);
router.post("/json", json);

const string = async (ctx: Router.RouterContext, next: any) => {
  ctx.body = "welcome to Koa!";
};
router.get("/string", string);
router.post("/string", string);

export default router;
