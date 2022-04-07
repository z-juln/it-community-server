import { SQL } from "../utils";
import { ResultSetHeader } from "mysql2";
import type { Zone } from "../model";

export const getZone =
  (sql: SQL) =>
  async ({
    id,
    name,
  }: Partial<Pick<Zone, "id" | "name">>): Promise<Zone | null> => {
    let sqlStr = `SELECT * FROM zone WHERE 1=1`;
    if (id) {
      sqlStr += ` AND id=${id}`;
    }
    if (name) {
      sqlStr += ` AND name="${name}"`;
    }
    sqlStr += " LIMIT 0, 1";
    const zoneList = (await sql(sqlStr))[0] as Zone[];
    return zoneList[0] ?? null;
  };

export const getZoneList = (sql: SQL) => async ({
  id,
  name,
}: Partial<Zone>): Promise<Zone[]> => {
  let sqlStr = `SELECT * FROM zone WHERE 1=1`;
  if (id) {
    sqlStr += ` AND id=${id}`;
  }
  if (name) {
    sqlStr += ` AND name="${name}"`;
  }
  const zoneList = (await sql(sqlStr))[0] as Zone[];
  return zoneList;
};

export const addZone =
  (sql: SQL) =>
  async (name: string): Promise<Zone | null> => {
    const hasZone = (await getZoneList(sql)({ name }))[0];
    if (hasZone) {
      return null;
    }

    const result = (
      await sql(`INSERT INTO zone (name) VALUES ("${name}")`)
    )[0] as ResultSetHeader;
    if (result.affectedRows > 0) {
      return (await getZoneList(sql)({ name }))[0];
    }
    return null;
  };
