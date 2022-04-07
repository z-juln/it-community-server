import { RankItem, Ranking, RankingType } from "./../model/ranking";
import { SQL } from "../utils";
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
    // TODO 排序算法
    sqlStr += ` ORDER BY uid DESC LIMIT ${limit}`;
    const users = (await sql(sqlStr))[0] as User[];
    const rankingList: Ranking["list"] = users
      .map((user) => ({
        ...user,
        password: undefined,
      }))
      .map((user, index) => ({
        userInfo: user,
        // TODO point算法
        point: 100 - (index + 2) * 2,
      }));

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
