import { StudyItem } from './../model/studyItem';
import { Apply } from './../model/apply';
import { SQL } from "../utils";
import type { DBStudyItem } from "../model";
import { getUser } from './user';
import { ResultSetHeader } from 'mysql2';
import { addNotification } from './notification';

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
  async ({
    id,
    uid,
    set_id = -1,
    startIndex = 0,
    pageNum = 20,
    title = "",
  }: {
    id?: number;
    uid?: number;
    set_id?: number;
    startIndex?: number;
    pageNum?: number;
    title?: string;
  }): Promise<DBStudyItem[]> => {
    let sqlStr = `SELECT * FROM study_item WHERE 1=1`;
    if (id) {
      sqlStr += ` AND id=${id}`;
    }
    if (uid) {
      sqlStr += ` AND uid=${uid}`;
    }
    if (set_id !== -1) {
      sqlStr += ` AND set_id=${set_id}`;
    }
    if (title) {
      sqlStr += ` AND title LIKE "%${title}%"`;
    }
    if (startIndex !== -1) {
      sqlStr += ` LIMIT ${startIndex * pageNum}, ${pageNum}`;
    }
    const list = (await sql(sqlStr))[0] as DBStudyItem[];
    // console.log({ list });
    return list;
  };

export const getApplyStudyItemList =
  (sql: SQL) =>
  async ({
    uid,
    status,
    target_id,
    title,
  }: Partial<Pick<Apply, 'uid' | 'status' | 'target_id'> & { title: string }>): Promise<Apply[]> => {
    const listByStudyItemList = await getStudyItemList(sql)({ title, id: target_id, startIndex: -1 });
    const idsByStudyItemList = listByStudyItemList.map(item => item.id);

    let sqlStr = `SELECT * FROM apply WHERE target="study-item"`;
    if (uid) {
      sqlStr += ` AND uid=${uid}`;
    }
    if (status) {
      sqlStr += ` AND status="${status}"`;
    }
    if (target_id) {
      sqlStr += ` AND target_id=${target_id}`;
    }
    const applyList = (await sql(sqlStr))[0] as Apply[];
    
    const list = applyList.filter(applyInfo => idsByStudyItemList.includes(applyInfo.target_id!));

    return list;
  }

export const applyStudyItem =
  (sql: SQL) =>
  async (uid: number, id: number): Promise<Apply | null> => {
    const checkedUser = await getUser(sql)({ uid });
    if (!checkedUser) return null;

    const applyInfo = (await getApplyStudyItemList(sql)({ uid, target_id: id }))[0] || null;
    if (applyInfo) {
      return null;
    }

    const result = (
      await sql(`INSERT INTO apply (uid, target, target_id, status, \`condition\`) VALUES (${uid}, "study-item", ${id}, "waitting", "{}")`)
    )[0] as ResultSetHeader;
    if (result.affectedRows > 0) {
      const applyInfo = (await getApplyStudyItemList(sql)({ uid, target_id: id }))[0] || null;
      return applyInfo;
    }
    return null;
  }

export const passApplyStudyItem =
  (sql: SQL) =>
  async (id: number): Promise<StudyItem | null> => {
    const applyInfo = (await getApplyStudyItemList(sql)({ target_id: id }))[0] || null;
    if (applyInfo.status !== 'waitting') {
      return null;
    }

    const res = (
      await sql(`UPDATE apply SET status="pass" WHERE target="study-item" AND target_id=${id}`)
    )[0] as ResultSetHeader;
    if (res.affectedRows > 0) {
      const studyItem = await getStudyItem(sql)(id);
      if (!studyItem) {
        throw new Error(`studyItem不存在(id: ${id})`)
      }
      await addNotification(sql)({
        uid: studyItem.uid,
        type: 'study_item_apply',
        target_id: id,
        meta: JSON.stringify({
          target_name: studyItem.title
        }),
      });
      return studyItem as any;
    }
    return null;
  };
