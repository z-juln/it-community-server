import { SavedUserResult } from "./../model/user";
import { DiscussWithChildren } from "./../model/discuss";
import { getDiscussList, deleteDiscuss } from "./../service/discuss";
import Router from "koa-router";
import jwt from "jsonwebtoken";
import { connectDB } from "../utils";
import { validToken } from "./_middleware";
import { addDiscuss } from "../service";
import { PlainQuery, RouterContext, UserRole, Discuss } from "../model";

const router = new Router();
router.prefix("/discuss");

router.post(
  "/add",
  validToken(UserRole.COMMON, UserRole.PROVIDER, UserRole.ADMIN),
  async (ctx: RouterContext<any>) => {
    const {
      topId = "-1",
      content,
      type = "super",
      super_id = "-1",
      super_type = "item",
    } = ctx.request.body as PlainQuery;

    const failBody = {
      code: 0,
      data: null,
      message: "评论失败",
    };

    const token = ctx.request.headers["authorization"];
    if (!token) {
      ctx.body = failBody;
      return;
    }
    const userInfo = jwt.decode(token) as SavedUserResult;

    const sql = await connectDB();
    const res = await addDiscuss(sql)({
      topId: +topId,
      user_id: userInfo.uid,
      content,
      type: type as any,
      super_id: +super_id,
      super_type: super_type as any,
    });

    if (res === null) {
      ctx.body = failBody;
      return;
    }

    ctx.body = {
      code: 1,
      data: res,
      message: "申请题主成功",
    };
  }
);

router.get("/list", async (ctx: RouterContext<DiscussWithChildren[]>) => {
  const { super_type = "item", super_id, ...restProps } = ctx.query as PlainQuery;

  const sql = await connectDB();
  const discussList = await getDiscussList(sql)({
    super_id: super_id ? +super_id : undefined,
    super_type: super_type as any,
    ...restProps,
  });

  ctx.body = {
    code: 1,
    data: discussList,
    message: "获取评论列表成功",
  };
});

router.post('/del', validToken(UserRole.ADMIN), async (ctx: RouterContext<1 | 0>) => {
  const { id } = ctx.request.body as PlainQuery;

  const failBody = {
    code: 0,
    data: null,
    message: "删除评论失败",
  };

  if (!id) {
    ctx.body = failBody;
    return;
  }

  const sql = await connectDB();
  const success = await deleteDiscuss(sql)(+id);

  ctx.body = {
    code: 1,
    data: success ? 1 : 0,
    message: "删除评论成功",
  };
});

export default router;
