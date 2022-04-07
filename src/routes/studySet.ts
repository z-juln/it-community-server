import Router from "koa-router";
import jwt from "jsonwebtoken";
import { connectDB, secret } from "../utils";
import { validToken } from "./_middleware";
import { addStudySet, getStudySet, getStudySetList, getZone } from "../service";
import { RouterContext, DBStudySet, StudySet, PlainQuery, UserRole, SavedUserResult } from "../model";

const router = new Router();
router.prefix("/study-set");

router.post(
  "/add",
  validToken(UserRole.PROVIDER),
  async (ctx: RouterContext<StudySet | null>
) => {
  const { name, zone_id, detail="", links="[]" } = ctx.request.body as PlainQuery;

  const failBody = {
    code: 0,
    data: null,
    message: "创建学库失败",
  };

  const token = ctx.request.headers["authorization"];
  if (!token) {
    ctx.body = failBody;
    return;
  }
  const userInfo = jwt.decode(token) as SavedUserResult;

  if (!name || !zone_id) {
    ctx.body = failBody;
    return;
  }

  const sql = await connectDB();
  const dbInfo = await addStudySet(sql)({ uid: userInfo.uid, name, zone_id: +zone_id, detail, links });
  let info: StudySet | null = dbInfo as any as StudySet;
  if (dbInfo && info) {
    info.zone = (await getZone(sql)({ id: dbInfo.zone_id }))!;
  }

  ctx.body = {
    code: 1,
    data: info,
    message: "创建学库成功",
  };
});

router.get("/info", async (ctx: RouterContext<StudySet | null>) => {
  const { name, id } = ctx.query as PlainQuery;

  const failBody = {
    code: 0,
    data: null,
    message: "获取题库信息失败",
  };

  if (typeof name !== "string" && id == null) {
    ctx.body = failBody;
    return;
  }

  const sql = await connectDB();
  const dbInfo = await getStudySet(sql)({ name, id: id ? +id : undefined });
  let info: StudySet | null = dbInfo as any as StudySet;
  if (dbInfo && info) {
    info.zone = (await getZone(sql)({ id: dbInfo.id }))!;
  }

  ctx.body = {
    code: 1,
    data: info,
    message: "获取题库信息成功",
  };
});

router.get("/list", async (ctx: RouterContext<DBStudySet[]>) => {
  const {
    uid,
    keyword = "",
    zone_id = "-1",
    pageIndex = "0",
    pageNum = "20",
  } = ctx.query as PlainQuery;

  const sql = await connectDB();
  const list = await getStudySetList(sql)({
    uid: uid ? +uid : undefined,
    keyword,
    zone_id: +zone_id,
    startIndex: +pageIndex * +pageNum,
    count: +pageNum,
  });

  ctx.body = {
    code: 1,
    data: list,
    message: "获取题库列表成功",
  };
});

export default router;
