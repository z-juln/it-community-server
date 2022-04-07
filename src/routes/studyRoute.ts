import { getStudySet } from "./../service/studySet";
import Router from "koa-router";
import jwt from "jsonwebtoken";
import { connectDB, secret } from "../utils";
import { validToken } from "./_middleware";
import { addStudyRoute, getStudyRoute, getStudyRouteList, getZone } from "../service";
import {
  RouterContext,
  DBStudyRoute,
  StudyRoute,
  PlainQuery,
  DBStudySet,
  UserRole,
  SavedUserResult,
} from "../model";

const router = new Router();
router.prefix("/study-route");

router.get("/info", async (ctx: RouterContext<StudyRoute | null>) => {
  const { name, id } = ctx.query as PlainQuery;

  const failBody = {
    code: 0,
    data: null,
    message: "获取学习路线信息失败",
  };

  if (typeof name !== "string" && id == null) {
    ctx.body = failBody;
    return;
  }

  const sql = await connectDB();
  const dbInfo = await getStudyRoute(sql)({ name, id: id ? +id : undefined });
  const nodeIds: number[] = dbInfo
    ? JSON.parse(dbInfo.nodes as any as string)
    : [];
  const info: StudyRoute | null = dbInfo as any;
  if (info && dbInfo) {
    const promises = nodeIds.map((nodeId) => getStudySet(sql)({ id: nodeId }));
    const [zone, ...nodes] = await Promise.all([
      getZone(sql)({ id: (info as any).zone_id }),
      ...promises,
    ]);
    console.log({ zone, nodes });
    info.nodes = nodes.filter((item) => item !== null) as DBStudySet[];
    info.zone = zone!;
  }

  ctx.body = {
    code: 1,
    data: info,
    message: "获取学习路线信息成功",
  };
});

router.get("/list", async (ctx: RouterContext<DBStudyRoute[]>) => {
  const {
    keyword = "",
    zone_id = "-1",
    pageIndex = "0",
    pageNum = "20",
    ownId = "-1",
  } = ctx.query as PlainQuery;

  const sql = await connectDB();
  const list = await getStudyRouteList(sql)({
    keyword,
    zone_id: +zone_id,
    startIndex: +pageIndex * +pageNum,
    count: +pageNum,
    ownId: +ownId,
  });

  ctx.body = {
    code: 1,
    data: list,
    message: "获取学习路线列表成功",
  };
});

router.post(
  "/add",
  validToken(UserRole.PROVIDER),
  async (ctx: RouterContext<StudyRoute | null>
) => {
  const { 
    zone_id,
    name,
    nodes = "[]",
    detail = "",
    links = "[]",
    cover,
  } = ctx.request.body as PlainQuery;

  const failBody = {
    code: 0,
    data: null,
    message: "创建学习路线失败",
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
  const dbInfo = await addStudyRoute(sql)({ uid: userInfo.uid, name, zone_id: +zone_id, nodes, detail, links, cover });
  let info: StudyRoute | null = dbInfo as any as StudyRoute;
  if (dbInfo && info) {
    info.zone = (await getZone(sql)({ id: dbInfo.zone_id }))!;
  }

  ctx.body = {
    code: 1,
    data: info,
    message: "创建学习路线成功",
  };
});

export default router;
