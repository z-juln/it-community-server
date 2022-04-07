import { getApplyProviderList } from './../service/provider';
import { validJsonStr } from "./../utils/json";
import Router from "koa-router";
import jwt from "jsonwebtoken";
import { connectDB } from "../utils";
import { validToken } from "./_middleware";
import { applyProvider, getUser, postArticle, passApplyProvider } from "../service";
import { Apply, PlainQuery, RouterContext, SavedUserResult, UserRole } from "../model";

const router = new Router();
router.prefix("/provider");

router.get(
  "/apply-info",
  validToken(UserRole.COMMON, UserRole.PROVIDER, UserRole.ADMIN),
  async (ctx: RouterContext<Apply | null>) => {
    const failBody = {
      code: 0,
      data: null,
      message: "获取申请信息失败",
    };

    const token = ctx.request.headers["authorization"];
    if (!token) {
      ctx.body = failBody;
      return;
    }

    const { uid } = (jwt.decode(token) as SavedUserResult);
    const sql = await connectDB();
    const info = (await getApplyProviderList(sql)({ uid }))[0] ?? null;
  
    if (!info) {
      ctx.body = failBody;
      return;
    }

    ctx.body = {
      code: 1,
      data: info,
      message: "获取申请信息成功",
    };
  }
)

router.get(
  "/getApplyList",
  validToken(UserRole.ADMIN),
  async (ctx: RouterContext<Apply[]>) => {
    const { uid, status } = ctx.query as PlainQuery;
    
    const sql = await connectDB();
    const list = await getApplyProviderList(sql)({ uid: uid ? +uid : undefined, status: status as any });
    for (const applyInfo of list) {
      const userInfo = (await getUser(sql)({ uid: applyInfo.uid }))!;
      applyInfo.user = userInfo;
    }

    ctx.body = {
      code: 1,
      data: list,
      message: "获取申请列表成功",
    };
  }
)

router.post(
  "/apply",
  validToken(),
  async (ctx: RouterContext<SavedUserResult>) => {
    const failBody = {
      code: 0,
      data: null,
      message: "申请题主失败",
    };

    const token = ctx.request.headers["authorization"];
    if (!token) {
      ctx.body = failBody;
      return;
    }
    const userInfo = jwt.decode(token) as SavedUserResult;

    const sql = await connectDB();
    const res = await applyProvider(sql)(userInfo.uid);

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

router.post(
  "/pass-apply",
  validToken(UserRole.ADMIN),
  async (ctx: RouterContext<SavedUserResult>) => {
    const { uid } = ctx.request.body as PlainQuery;

    const failBody = {
      code: 0,
      data: null,
      message: "申请题主失败",
    };

    if (uid === null || uid === undefined) {
      ctx.body = failBody;
      return;
    }

    const sql = await connectDB();
    const res = await passApplyProvider(sql)(+uid);

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

// addStudyItem
router.post(
  "/post-article",
  validToken(UserRole.PROVIDER, UserRole.ADMIN),
  async (ctx: RouterContext<{ articleId: number }>) => {
    const failBody = {
      code: 0,
      data: null,
      message: "文章发布失败",
    };

    const {
      title,
      content,
      detail,
      setId,
      articleId = -1,
    } = ctx.request.body as PlainQuery;
    if (!title || !content || !setId || !validJsonStr(content)) {
      ctx.body = failBody;
      return;
    }

    const token = ctx.request.headers["authorization"];
    if (!token) {
      ctx.body = failBody;
      return;
    }
    const userInfo = jwt.decode(token) as SavedUserResult;

    const sql = await connectDB();
    const mayBeArticleId = await postArticle(sql)({
      uid: userInfo.uid,
      title,
      detail: detail ?? content.slice(0, 20),
      content,
      setId: +setId,
      articleId: +articleId,
    });

    if (mayBeArticleId === null) {
      ctx.body = failBody;
      return;
    }

    ctx.body = {
      code: 1,
      data: {
        articleId: mayBeArticleId,
      },
      message: "文章发布成功",
    };
  }
);

export default router;
