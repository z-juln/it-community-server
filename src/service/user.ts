import { SavedUserResult, User } from "../model";
import { SQL } from "../utils";
import { ResultSetHeader } from "mysql2";

export const getUserList =
  (sql: SQL) =>
  async (params: Partial<SavedUserResult>): Promise<SavedUserResult[]> => {
    let sqlStr = `SELECT * FROM users WHERE 1=1`;
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key as keyof SavedUserResult];
        if (['name', 'github'].includes(key) && value) {
          sqlStr += ` AND ${key} LIKE "%${value}%"`;
        } else if (typeof value === 'number') {
          sqlStr += ` AND ${key}=${value}`;
        } else if (typeof value === 'string') {
          sqlStr += ` AND ${key}="${value}"`;
        }
      }
    }
    const rows = (await sql(sqlStr))[0] as User[];
    const userList = rows.map((item) => {
      if (item?.password) {
        delete (item as any).password;
      }
      return item;
    });
    return userList;
  };

export const getUser =
  (sql: SQL) =>
  async ({
    name,
    uid,
  }: Partial<Pick<User, "name" | "uid">>): Promise<SavedUserResult | null> => {
    let sqlStr = "SELECT * FROM users WHERE 1=1";
    if (name) {
      sqlStr += ` AND name="${name}"`;
    }
    if (typeof uid === "number") {
      sqlStr += ` AND uid="${uid}"`;
    }
    const rows = (await sql(sqlStr))[0] as User[];
    const userInfo = rows[0] ?? null;
    return userInfo;
  };

export const login =
  (sql: SQL) =>
  async (name: string, password: string): Promise<SavedUserResult | null> => {
    const rows = (
      await sql(
        `SELECT * FROM users WHERE name = "${name}" AND password = "${password}"`
      )
    )[0] as User[];
    const userInfo = rows?.[0];
    if (userInfo?.password) {
      delete (userInfo as any).password;
    }
    return userInfo;
  };

export const register =
  (sql: SQL) =>
  async (name: string, password: string): Promise<SavedUserResult | null> => {
    const checkedUser = await getUser(sql)({ name });
    if (checkedUser) return null;

    const result = (
      await sql(
        `INSERT INTO users (name, password) VALUES ("${name}", "${password}")`
      )
    )[0] as ResultSetHeader;
    if (result.affectedRows > 0) {
      const userInfo = await getUser(sql)({ name });
      return userInfo;
    }
    return null;
  };

// TODO github-auth
// TODO avatar
