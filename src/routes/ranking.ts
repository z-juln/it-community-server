import jwt from "jsonwebtoken";
import Router from "koa-router";
import { connectDB } from "../utils";
import { PlainQuery, Ranking, RouterContext, SavedUserResult } from "../model";
import { getRankingList } from "../service";

const router = new Router();
router.prefix("/ranking");

router.get("/list", async (ctx: RouterContext<Ranking>) => {
  const { type, limit = "20" } = ctx.query as PlainQuery;

  const failBody = {
    code: 0,
    data: null,
    message: "获取排行榜失败",
  };

  if (!type) {
    ctx.body = failBody;
    return;
  }

  const token = ctx.request.headers["authorization"];
  const userInfo = token ? (jwt.decode(token) as SavedUserResult) : null;

  const sql = await connectDB();
  const ranking: Ranking = await getRankingList(sql)(
    type as any,
    +limit,
    userInfo?.uid
  );

  ctx.body = {
    code: 1,
    data: ranking,
    message: "获取排行榜成功",
  };
});

export default router;
