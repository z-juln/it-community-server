import jwt from "jsonwebtoken";
import { secret } from "../utils";
import { UserRole } from "../model";
import type { Next } from "koa";
import type { RouterContext, SavedUserResult } from "../model";

export const logRoute = async (ctx: RouterContext, next: Next) => {
  console.log(
    "\n  url: ",
    ctx.url,
    "\n\tquery: ",
    ctx.query,
    "\n\trequest body: ",
    ctx.request.body
  );
  await next();
};

export const validToken =
  (...roles: UserRole[]) =>
  async (ctx: RouterContext, next: Next) => {
    if (roles.length === 0) {
      roles.push(UserRole.COMMON);
    }

    let valid = false;
    const token = ctx.request.headers["authorization"];
    try {
      const userInfo = jwt.verify(token ?? "", secret) as SavedUserResult;
      valid = roles.includes(userInfo.role);
    } catch {}
    if (!valid) {
      ctx.throw(401, { code: -2, message: "身份验证失败" });
    }
    await next();
  };
