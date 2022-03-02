import Router from "koa-router";
import { RouterContext } from "../../src/model";

const router = new Router();
router.prefix("/user");

router.all("/login", async (ctx: RouterContext, next: any) => {
  ctx.body = {
    code: 1,
    data: {},
    message: "",
  };
});

export default router;
