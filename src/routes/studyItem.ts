import { getApplyStudyItemList } from './../service/studyItem';
import Router from "koa-router";
import jwt from "jsonwebtoken";
import { connectDB, secret } from "../utils";
import { validToken } from "./_middleware";
import {
  getStudyItem,
  getStudyItemList,
  getStudySet,
  passApplyStudyItem,
} from "../service";
import {
  RouterContext,
  PlainQuery,
  StudyItem,
  DBStudyItem,
  Apply,
  UserRole,
} from "../model";

const router = new Router();
router.prefix("/study-item");

router.get("/info", async (ctx: RouterContext<StudyItem | null>) => {
  const { id } = ctx.query as PlainQuery;

  const failBody = {
    code: 0,
    data: null,
    message: "获取题目信息失败",
  };

  if (!id) {
    ctx.body = failBody;
    return;
  }

  const sql = await connectDB();
  const dbInfo = await getStudyItem(sql)(+id);
  let info: StudyItem | null = dbInfo as any as StudyItem;
  if (dbInfo && info) {
    info.set = (await getStudySet(sql)({ id: dbInfo.set_id }))!;
  }

  ctx.body = {
    code: 1,
    data: info,
    message: "获取题目信息成功",
  };
});

router.get("/list", async (ctx: RouterContext<DBStudyItem[]>) => {
  const {
    setId = "-1",
    pageIndex = "0",
    pageNum = "20",
  } = ctx.query as PlainQuery;

  const sql = await connectDB();
  const list = await getStudyItemList(sql)({
    set_id: +setId,
    startIndex: +pageIndex * +pageNum,
    pageNum: +pageNum,
  });

  ctx.body = {
    code: 1,
    data: list,
    message: "获取题目列表成功",
  };
});

// TODO add 在./provider.ts中的post-apply中

router.post(
  "/apply-list",
  async (ctx: RouterContext<Apply[]>) => {
    const {
      uid,
      status,
      target_id,
      title,
    } = ctx.request.body as PlainQuery;

    const sql = await connectDB();
    const list = await getApplyStudyItemList(sql)({
      uid: uid ? +uid : undefined,
      status: status as any,
      target_id: target_id ? +target_id : undefined,
      title,
    });

    ctx.body = {
      code: 1,
      data: list,
      message: "获取申请列表成功",
    };
  });


router.post(
  "/pass-apply",
  validToken(UserRole.ADMIN),
  async (ctx: RouterContext<StudyItem>) => {
    const { id } = ctx.request.body as PlainQuery;

    const failBody = {
      code: 0,
      data: null,
      message: "学点审核通过操作失败",
    };

    if (id === null || id === undefined) {
      ctx.body = failBody;
      return;
    }

    const sql = await connectDB();
    const res = await passApplyStudyItem(sql)(+id);

    if (res === null) {
      ctx.body = failBody;
      return;
    }

    ctx.body = {
      code: 1,
      data: res,
      message: "学点审核通过操作成功",
    };
  }
);

export default router;
