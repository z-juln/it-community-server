import { addNotification, readNotification } from './../service/notification';
import { SavedUserResult } from "./../model/user";
import Router from "koa-router";
import jwt from "jsonwebtoken";
import { connectDB } from "../utils";
import { validToken } from "./_middleware";
import { getNotificationList } from "../service";
import { Notification, PlainQuery, RouterContext, UserRole } from "../model";

const router = new Router();
router.prefix("/notification");

router.post(
  "/add",
  validToken(UserRole.COMMON, UserRole.PROVIDER, UserRole.ADMIN),
  async (ctx: RouterContext<Notification | null>) => {
    const {
      uid,
      type,
      target_id = "-1",
      meta = "{}",
    } = ctx.request.body as PlainQuery;

    const failBody = {
      code: 0,
      data: null,
      message: "创建通知失败",
    };

    if (!uid || !type) {
      ctx.body = failBody;
      return;
    }

    const sql = await connectDB();
    const result = await addNotification(sql)({
      uid: +uid,
      type: type as any,
      target_id: +target_id,
      meta,
    });

    ctx.body = {
      code: 1,
      data: result,
      message: "创建通知成功",
    };
  }
);

router.get(
  "/list",
  validToken(UserRole.COMMON, UserRole.PROVIDER, UserRole.ADMIN),
  async (ctx: RouterContext<Notification[]>) => {

    const failBody = {
      code: 0,
      data: null,
      message: "获取通知列表失败",
    };

    const token = ctx.request.headers["authorization"];
    if (!token) {
      ctx.body = failBody;
      return;
    }
    const userInfo = jwt.decode(token) as SavedUserResult;

    const sql = await connectDB();
    const list = await getNotificationList(sql)(userInfo.uid);

    ctx.body = {
      code: 1,
      data: list,
      message: "获取通知列表成功",
    };
  }
);

router.post(
  "/read",
  validToken(UserRole.COMMON, UserRole.PROVIDER, UserRole.ADMIN),
  async (ctx: RouterContext<Notification | null>) => {
    const { id } = ctx.request.body as PlainQuery;

    const failBody = {
      code: 0,
      data: null,
      message: "获取通知列表失败",
    };

    const token = ctx.request.headers["authorization"];
    if (!token || !id) {
      ctx.body = failBody;
      return;
    }
    const userInfo = jwt.decode(token) as SavedUserResult;

    const sql = await connectDB();
    const result = await readNotification(sql)({
      id: +id,
      uid: userInfo.uid,
    });

    ctx.body = {
      code: 1,
      data: result,
      message: "获取通知列表成功",
    };
  }
);

export default router;
