import { SQL } from "../utils";
import type { DBStudyRoute } from "../model";
import { ResultSetHeader } from "mysql2";

export const addStudyRoute =
  (sql: SQL) =>
  async ({
    uid,
    name,
    zone_id,
    nodes = "[]",
    detail = "",
    links = "[]",
    cover,
  }: {
    uid: number;
    name: string;
    zone_id: number;
    nodes: string;
    detail?: string;
    links?: string;
    cover?: string;
  }): Promise<DBStudyRoute | null> => {
    const id = Date.now();
    let keys: (string | number)[] = ['id', 'uid', 'primary_contributor', 'name', 'zone_id', 'nodes', 'detail', 'links'];
    let values: (string | number)[] = [id, uid, uid, `"${name}"`, zone_id, `"${nodes.replace(/"/g, "\\\"")}"`, `"${detail}"`, `"${links}"`];
    if (cover) {
      keys.push('cover');
      values.push(cover);
    }
    const res = (
      await sql(`INSERT INTO study_route (${keys.join(',')}) VALUES (${values.join(',')})`)
    )[0] as ResultSetHeader;
    if (res.affectedRows > 0) {
      const data = await getStudyRoute(sql)({ id });
      return data;
    }
    return null;
  };
// (async () => {
//   const sql = await connectDB();
//   const info = await addStudySet(sql)({ uid: 1, zone_id: 1, name: 'test...' });
// })();

export const getStudyRoute =
  (sql: SQL) =>
  async ({
    name,
    id,
  }: Partial<
    Pick<DBStudyRoute, "name" | "id">
  >): Promise<DBStudyRoute | null> => {
    let sqlStr = "SELECT * FROM study_route WHERE 1=1";
    if (name) {
      sqlStr += ` AND name="${name}"`;
    }
    if (id !== undefined) {
      sqlStr += ` AND id="${id}"`;
    }
    const rows = (await sql(sqlStr))[0] as DBStudyRoute[];
    return rows[0] ?? null;
  };

export const getStudyRouteList =
  (sql: SQL) =>
  async ({
    keyword = "",
    zone_id = -1,
    startIndex = 0,
    count = 20,
    ownId = -1,
  }): Promise<DBStudyRoute[]> => {
    let sqlStr = `SELECT * FROM study_route WHERE 1=1`;
    if (keyword) {
      sqlStr += ` AND name LIKE "%${keyword}%"`;
    }
    if (zone_id !== -1) {
      sqlStr += ` AND zone_id="${zone_id}"`;
    }
    if (ownId !== -1) {
      sqlStr += ` AND uid="${ownId}"`;
    }
    sqlStr += ` ORDER BY praise_count * 2 - tread_count DESC LIMIT ${
      startIndex * count
    }, ${count}`;
    const list = (await sql(sqlStr))[0] as DBStudyRoute[];
    return list;
  };
