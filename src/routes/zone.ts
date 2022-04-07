import Router from "koa-router";
import { connectDB } from "../utils";
import { validToken } from "./_middleware";
import { getZoneList, addZone, getZone } from "../service";
import { PlainQuery, UserRole } from "../model";
import type { RouterContext, Zone } from "../model";

const router = new Router();
router.prefix("/zone");

router.get("/info", async (ctx: RouterContext<Zone | null>) => {
  const { id, name } = ctx.query as PlainQuery;

  const failBody = {
    code: 0,
    data: null,
    message: "获取专区信息失败",
  };

  if (!id && !name) {
    ctx.body = failBody;
    return;
  }

  const sql = await connectDB();
  const zoneInfo = await getZone(sql)({ id: id ? +id : undefined, name });

  ctx.body = {
    code: 1,
    data: zoneInfo,
    message: "获取专区信息成功",
  };
});

router.get("/list", async (ctx: RouterContext<Zone[]>) => {
  const { id, name } = ctx.query as PlainQuery;

  const failBody = {
    code: 0,
    data: null,
    message: "获取专区列表失败",
  };

  const sql = await connectDB();
  const zoneList = await getZoneList(sql)({ id: id ? +id : undefined, name });

  ctx.body = {
    code: 1,
    data: zoneList,
    message: "获取专区列表成功",
  };
});

router.post(
  "/add",
  validToken(UserRole.ADMIN),
  async (ctx: RouterContext<Zone | null>) => {
    const { name } = ctx.request.body;

    const failBody = {
      code: 0,
      data: null,
      message: "新增专区失败",
    };

    if (typeof name !== "string") {
      ctx.body = failBody;
      return;
    }

    const sql = await connectDB();
    const info = await addZone(sql)(name);

    ctx.body = info
      ? {
          code: 1,
          data: info,
          message: "新增专区成功",
        }
      : failBody;
  }
);

export default router;
