import { SavedUserResult, Apply } from "../model";
import { SQL } from "../utils";
import { getUser } from "./user";
import { ResultSetHeader } from "mysql2";
import { applyStudyItem } from "./studyItem";

export const getApplyProviderList =
  (sql: SQL) =>
  async ({
    uid,
    status,
  }: Partial<Apply>): Promise<Apply[]> => {
    let sqlStr = `SELECT * FROM apply WHERE target="provider"`;
    if (uid) {
      sqlStr += ` AND uid=${uid}`;
    }
    if (status) {
      sqlStr += ` AND status="${status}"`;
    }
    const list = (await sql(sqlStr))[0] as Apply[];
    
    return list;
  }

export const applyProvider =
  (sql: SQL) =>
  async (uid: number): Promise<SavedUserResult | null> => {
    const checkedUser = await getUser(sql)({ uid });
    if (!checkedUser) return null;

    const applyInfo = (await getApplyProviderList(sql)({ uid }))[0] || null;
    if (applyInfo) {
      return null;
    }

    const result = (
      await sql(`INSERT INTO apply (uid, target, status, \`condition\`) VALUES (${uid}, "provider", "waitting", "{}")`)
    )[0] as ResultSetHeader;
    if (result.affectedRows > 0) {
      const userInfo = await getUser(sql)({ uid });
      return userInfo;
    }
    return null;
  }

export const passApplyProvider =
  (sql: SQL) =>
  async (uid: number): Promise<SavedUserResult | null> => {
    const checkedUser = await getUser(sql)({ uid });
    if (!checkedUser) return null;

    const applyInfo = (await getApplyProviderList(sql)({ uid }))[0] || null;
    if (applyInfo.status !== 'waitting') {
      return null;
    }

    const result1 = (
      await sql(`UPDATE apply SET status="pass" WHERE target="provider" uid=${uid}`)
    )[0] as ResultSetHeader;
    if (result1.affectedRows === 0) return null;

    const result2 = (
      await sql(`UPDATE users SET role="provider" WHERE uid=${uid}`)
    )[0] as ResultSetHeader;
    if (result2.affectedRows > 0) {
      const userInfo = await getUser(sql)({ uid });
      return userInfo;
    }
    return null;
  };

export const postArticle =
  (sql: SQL) =>
  async ({
    uid,
    title,
    detail,
    content,
    setId,
    articleId = -1,
  }: {
    uid: number;
    title: string;
    detail: string;
    content: string;
    setId: number;
    articleId?: number;
  }): Promise<number | null> => {
    const checkedUser = await getUser(sql)({ uid });
    if (!checkedUser) return null;

    console.log({content})
    if (articleId == -1) {
      const newArticleId = Date.now();
      const result = (
        await sql(
          `INSERT INTO study_item
          (id, uid, set_id, title, detail, content)
          VALUES (${newArticleId}, ${uid}, ${setId}, "${title}", "${detail}", '${content}')`
        )
      )[0] as ResultSetHeader;
      if (result.affectedRows) {
        await applyStudyItem(sql)(uid, newArticleId);
        return newArticleId;
      }
      return null;
    } else {
      const result = (
        await sql(
          `UPDATE study_item
            SET set_id=${setId}, title="${title}", detail="${detail}", content='${content}'
            WHERE id=${articleId} AND uid=${uid}`
        )
      )[0] as ResultSetHeader;
      if (result.affectedRows > 0) {
        return articleId;
      }
      return null;
    }
  };
