import { RankItem, Ranking, RankingType } from "./../model/ranking";
import { getPoint, SQL } from "../utils";
import { getUser } from "./user";
import User, { UserRole } from "./../model/user";

export const getRankingList =
  (sql: SQL) =>
  async (
    type: RankingType,
    limit: number = 20,
    uid?: number
  ): Promise<Ranking> => {
    let sqlStr = "SELECT * FROM users WHERE 1=1";
    if (type === "provider") {
      sqlStr += ` AND role="${UserRole.PROVIDER}"`;
    }
    sqlStr += ` ORDER BY uid DESC LIMIT ${limit}`;
    const users = ((await sql(sqlStr))[0] as User[])
      .map((user) => ({
        ...user,
        password: undefined,
      }));

    let rankingList: Ranking["list"] = [];
    for (const user of users) {
      const point = await getPoint(sql)(type, user);
      rankingList.push({
        userInfo: user,
        point,
      });
    }
    rankingList = rankingList.sort((a, b) => b.point - a.point);

    let me: RankItem | undefined = undefined;
    if (typeof uid === "number") {
      const checkedUser = await getUser(sql)({ uid });

      const point = 0;
      if (checkedUser) {
        me = {
          userInfo: checkedUser,
          point,
        };
      }
    }
    return {
      list: rankingList,
      me,
    };
  };
