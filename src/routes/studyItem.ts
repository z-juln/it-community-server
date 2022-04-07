import Router from "koa-router";
import jwt from "jsonwebtoken";
import { connectDB, secret } from "../utils";
import { validToken } from "./_middleware";
import {
  getStudyItem,
  getStudyItemList,
  getStudySet,
  getStudySetList,
  getZone,
} from "../service";
import type {
  RouterContext,
  PlainQuery,
  StudyItem,
  DBStudyItem,
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
  const list = await getStudyItemList(sql)(
    +setId,
    +pageIndex * +pageNum,
    +pageNum
  );

  ctx.body = {
    code: 1,
    data: list,
    message: "获取题目列表成功",
  };
});

// TODO add

export default router;
