import Router from "koa-router";
import jwt from "jsonwebtoken";
import { connectDB, secret } from "../utils";
import { validToken } from "./_middleware";
import { login, getUser, register, getUserList } from "../service";
import { PlainQuery, RouterContext, SavedUserResult, UserRole } from "../model";

const router = new Router();
router.prefix("/user");

router.get("/list", async (ctx: RouterContext<SavedUserResult[]>) => {
  const { name, uid, github, role, type } = ctx.query as PlainQuery;

  const sql = await connectDB();
  const userList = await getUserList(sql)({
    name,
    uid: uid ? +uid : undefined,
    github,
    role: role as any,
    type: type as any,
  });

  ctx.body = {
    code: 1,
    data: userList,
    message: "获取用户信息成功",
  };
});

router.get("/info", async (ctx: RouterContext<SavedUserResult>) => {
  const { name } = ctx.query;

  const failBody = {
    code: 0,
    data: null,
    message: "获取用户信息失败",
  };

  if (typeof name !== "string") {
    ctx.body = failBody;
    return;
  }

  const sql = await connectDB();
  const info = await getUser(sql)({ name });

  ctx.body = info
    ? {
        code: 1,
        data: info,
        message: "获取用户信息成功",
      }
    : failBody;
});

router.post("/login", async (ctx: RouterContext<SavedUserResult>) => {
  const { name, password } = ctx.request.body;

  const failBody = {
    code: 0,
    data: null,
    message: "登陆失败",
  };

  if (typeof name !== "string" || typeof password !== "string") {
    ctx.body = failBody;
    return;
  }

  const sql = await connectDB();
  const info = await login(sql)(name, password);

  if (!info) {
    ctx.body = failBody;
    return;
  }

  ctx.body = {
    code: 1,
    data: info,
    token: jwt.sign(info, secret),
    message: "登陆成功",
  };
});

router.post("/register", async (ctx: RouterContext<SavedUserResult>) => {
  const { name, password } = ctx.request.body;

  const failBody = {
    code: 0,
    data: null,
    message: "注册失败",
  };

  if (typeof name !== "string" || typeof password !== "string") {
    ctx.body = failBody;
    return;
  }

  const sql = await connectDB();
  const info = await register(sql)(name, password);

  if (!info) {
    ctx.body = failBody;
    return;
  }

  ctx.body = {
    code: 1,
    data: info,
    token: jwt.sign(info, secret),
    message: "注册成功",
  };
});

router.get("/me", validToken(), async (ctx: RouterContext<SavedUserResult>) => {
  const failBody = {
    code: 0,
    data: null,
    message: "获取用户信息失败",
  };

  const token = ctx.request.headers["authorization"];
  if (!token) {
    ctx.body = failBody;
    return;
  }
  const userInfo = jwt.decode(token) as SavedUserResult;

  ctx.body = {
    code: 1,
    data: userInfo,
    message: "获取用户信息成功",
  };
});

// TODO logout
// TODO github-auth
// TODO avatar

export default router;
