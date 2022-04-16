import { SQL } from "../utils";
import { Notification } from "src/model";
import { ResultSetHeader } from "mysql2";

export const addNotification =
  (sql: SQL) =>
  async ({
    uid,
    type,
    target_id = -1,
    meta: _meta = "{}",
  }: NonNullable<Partial<Notification>>): Promise<Notification | null> => {
    const id = Date.now();

    let meta = _meta;
    if (typeof _meta !== 'string') {
      meta = JSON.stringify(_meta);
    }

    let sqlStr = `
      INSERT INTO notification
      (uid, type, target_id, meta)
      VALUES (${uid}, "${type}", ${target_id}, '${meta}')
    `;

    const result = (await sql(sqlStr))[0] as ResultSetHeader;
    if (result.affectedRows > 0) {
      return await getNotification(sql)(id);
    }
    return null;
  };

export const readNotification =
  (sql: SQL) =>
  async ({
    id,
    uid,
  }: Pick<Notification, 'id' | 'uid'>): Promise<Notification | null> => {
    const result = (await sql(
      `UPDATE notification SET readed=1 WHERE id=${id} AND uid=${uid}`
    ))[0] as ResultSetHeader;
    if (result.affectedRows > 0) {
      return await getNotification(sql)(id);
    }
    return null;
  };

export const getNotification =
  (sql: SQL) =>
  async (id: number): Promise<Notification | null> => {
    const rows = (await sql(
      `SELECT * FROM notification WHERE id=${id}`
    ))[0] as Notification[];
    return rows[0] ?? null;
  };

export const getNotificationList =
  (sql: SQL) =>
  async (uid: number): Promise<Notification[]> => {
    const rows = (await sql(
      `SELECT * FROM notification WHERE uid=${uid}`
    ))[0] as Notification[];
    return rows;
  };
