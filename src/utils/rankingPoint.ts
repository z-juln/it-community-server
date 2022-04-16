import { getStudyItemList } from './../service/studyItem';
import { RankingType, SavedUserResult } from '../model';
import { SQL } from './sql';

export const getPoint =
  (sql: SQL) =>
  async (type: RankingType, user: SavedUserResult): Promise<number> => {
    if (type === 'hot') {
      // 评论量
      const totalCount: number = ((await sql("SELECT count(*) FROM discuss"))[0] as [ { 'count(*)': number } ])[0]['count(*)'];
      const count: number = ((await sql(`SELECT count(*) FROM discuss WHERE user_id=${user.uid}`))[0] as [ { 'count(*)': number } ])[0]['count(*)'];
      return count / totalCount * 100;
    }
    // 贡献学点量
    const totalCount: number = ((await sql("SELECT count(*) FROM study_item"))[0] as [ { 'count(*)': number } ])[0]['count(*)'];
    const count = (await getStudyItemList(sql)({ uid: user.uid })).length;
    return count / totalCount * 100;
  }
