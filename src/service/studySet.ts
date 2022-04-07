import { connectDB, SQL } from "../utils";
import type { DBStudySet } from "../model";
import { ResultSetHeader } from "mysql2";

export const addStudySet =
  (sql: SQL) =>
  async (params: Partial<Omit<DBStudySet, "id" | "praise_count" | "tread_count">>): Promise<DBStudySet | null> => {
    const id = Date.now();
    let keys: (string | number)[] = ['id'];
    let values: (string | number)[] = [id];
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key as keyof typeof params];
        if (typeof value === 'number') {
          keys.push(key);
          values.push(value);
        } else if (typeof value === 'string') {
          keys.push(key);
          values.push(`"${value}"`);
        }
      }
    }
    const res = (
      await sql(`INSERT INTO study_set (${keys.join(',')}) VALUES (${values.join(',')})`)
    )[0] as ResultSetHeader;
    if (res.affectedRows > 0) {
      const data = await getStudySet(sql)({ id });
      return data;
    }
    return null;
  };

export const getStudySet =
  (sql: SQL) =>
  async ({
    name,
    id,
  }: Partial<Pick<DBStudySet, "name" | "id">>): Promise<DBStudySet | null> => {
    let sqlStr = "SELECT * FROM study_set WHERE 1=1";
    if (name) {
      sqlStr += ` AND name="${name}"`;
    }
    if (id !== undefined) {
      sqlStr += ` AND id="${id}"`;
    }
    const rows = (await sql(sqlStr))[0] as DBStudySet[];
    return rows[0] ?? null;
  };

export const getStudySetList =
  (sql: SQL) =>
  async ({
    uid,
    keyword = "",
    zone_id = -1,
    startIndex = 0,
    count = 20
  }: Partial<{
    uid: number;
    keyword: string;
    zone_id: number;
    startIndex: number;
    count: number;
  }>): Promise<DBStudySet[]> => {
    let sqlStr = `SELECT * FROM study_set WHERE 1=1`;
    if (uid) {
      sqlStr += ` AND uid LIKE ${uid}`;
    }
    if (keyword) {
      sqlStr += ` AND name LIKE "%${keyword}%"`;
    }
    if (zone_id !== -1) {
      sqlStr += ` AND zone_id="${zone_id}"`;
    }
    sqlStr += ` ORDER BY praise_count * 2 - tread_count DESC LIMIT ${
      startIndex * count
    }, ${count}`;
    const list = (await sql(sqlStr))[0] as DBStudySet[];
    return list;
  };
