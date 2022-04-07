import { SQL } from "../utils";
import type { DBStudyItem } from "../model";

export { postArticle as addStudyItem } from './provider';

export const getStudyItem =
  (sql: SQL) =>
  async (id: DBStudyItem["id"]): Promise<DBStudyItem | null> => {
    const rows = (
      await sql(`SELECT * FROM study_item WHERE id=${id}`)
    )[0] as DBStudyItem[];
    return rows[0] ?? null;
  };

export const getStudyItemList =
  (sql: SQL) =>
  async (set_id = -1, startIndex = 0, pageNum = 20): Promise<DBStudyItem[]> => {
    let sqlStr = `SELECT * FROM study_item WHERE 1=1`;
    if (set_id !== -1) {
      sqlStr += ` AND set_id=${set_id}`;
    }
    sqlStr += ` LIMIT ${startIndex * pageNum}, ${pageNum}`;
    const list = (await sql(sqlStr))[0] as DBStudyItem[];
    console.log({ list });
    return list;
  };
