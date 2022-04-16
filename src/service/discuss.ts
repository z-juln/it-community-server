import { getStudyItem } from './studyItem';
import { Discuss, DiscussWithChildren } from "./../model/discuss";
import { SQL } from "../utils";
import { getUser } from "./user";
import { ResultSetHeader } from "mysql2";
import { addNotification } from "./notification";

export const addDiscuss =
  (sql: SQL) =>
  async ({
    topId = -1,
    user_id,
    content,
    type = "super",
    super_id = -1,
    super_type = "item",
  }: Partial<Discuss> & { topId: number }): Promise<Discuss | null> => {
    const checkedUser = await getUser(sql)({ uid: user_id });
    if (!checkedUser) return null;

    const id = Date.now();

    const result = (
      await sql(
        `INSERT INTO discuss (id, user_id, content, type, super_id, super_type)
          VALUES (${id}, ${user_id}, "${content}", "${type}", "${super_id}", "${super_type}")`
      )
    )[0] as ResultSetHeader;

    if (result.affectedRows > 0) {
      if (topId !== -1) {
        const topDiscuss = await getDiscussInfo(sql)({ id: topId });
        const topDiscussChildren =
          JSON.parse(topDiscuss?.children ?? "[]") || [];
        topDiscussChildren.push(id);
        await sql(
          `UPDATE discuss SET children="${JSON.stringify(
            topDiscussChildren
          )}" WHERE id=${topId}`
        );
      }

      const userInfo = await getUser(sql)({ uid: user_id });
      if (!userInfo) {
        throw new Error(`userInfo不存在(uid: ${user_id})`);
      }

      // 评论通知
      if (super_id !== -1) {
        const studyItem = await getStudyItem(sql)(super_id);
        if (!studyItem) {
          throw new Error(`studyItem不存在(id: ${id})`);
        }
        await addNotification(sql)({
          uid: studyItem.uid,
          type: 'top-discuss',
          target_id: studyItem.id,
          meta: JSON.stringify({
            title: studyItem.title,
            target_name: userInfo.name,
          }),
        });
      } else {
        const studyItem = await getStudyItem(sql)(super_id);
        if (!studyItem) {
          throw new Error(`studyItem不存在(super_id: ${super_id})`);
        }
        const targetUserInfo = await getUser(sql)({ uid: studyItem.uid });
        if (!targetUserInfo) {
          throw new Error(`targetUserInfo不存在(uid: ${user_id})`);
        }
        await addNotification(sql)({
          uid: targetUserInfo.uid,
          type: 'reply-discuss',
          target_id: super_id,
          meta: JSON.stringify({
            target_name: userInfo.name,
            content,
          }),
        });
      }

      const discussInfo = await getDiscussInfo(sql)({ id });
      return discussInfo;
    }

    return null;
  };

export type GetDiscussInfoProps = Omit<Partial<Discuss>, "children">;
export const getDiscussInfo =
  (sql: SQL) =>
  async (params: GetDiscussInfoProps): Promise<Discuss | null> => {
    let sqlStr = "SELECT * FROM discuss WHERE 1=1";
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key as keyof GetDiscussInfoProps];
        if (typeof value === "number") {
          sqlStr += ` AND ${key}=${value}`;
        } else {
          sqlStr += ` AND ${key}="${value}"`;
        }
      }
    }
    const rows = (await sql(sqlStr))[0] as Discuss[];
    const userInfo = rows[0] ?? null;
    return userInfo;
  };

export const getDiscussList =
  (sql: SQL) =>
  async (props: {
    super_id?: number;
    super_type?: Discuss["super_type"];
    user_id?: Discuss['user_id'];
    content?: Discuss['content'];
    type?: Discuss['type'];
    create_time?: Discuss['create_time'];
  }): Promise<DiscussWithChildren[]> => {
    let sqlStr = `SELECT * FROM discuss WHERE 1=1`;
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const value = (props as any)[key];
        if (key === 'content' && value) {
          sqlStr += ` AND ${key} LIKE "%${value}%"`;
        } else if (typeof value === 'number') {
          sqlStr += ` AND ${key}=${value}`;
        } else if (typeof value === 'string') {
          sqlStr += ` AND ${key}="${value}"`;
        }
      }
    }
    const rootDiscussList = (await sql(sqlStr))[0] as Discuss[];
    const res: DiscussWithChildren[] = [];
    for (const rootDiscuss of rootDiscussList) {
      const resRootDiscuss = await fetchChildren(rootDiscuss);
      res.push(resRootDiscuss);
    }
    return res;

    async function fetchChildren(
      parent: Discuss
    ): Promise<DiscussWithChildren> {
      const parentDiscuss: DiscussWithChildren = {
        ...parent,
        childrenIds: parent.children,
        children: [],
        create_time: new Date(parent.create_time).toLocaleString(),
        userInfo: (await getUser(sql)({ uid: parent.user_id }))!,
      };
      const childrenIds: number[] = JSON.parse(parentDiscuss.childrenIds);
      for (const childId of childrenIds) {
        const child = await getDiscussInfo(sql)({ id: childId });
        if (child) {
          const childWithChildren = await fetchChildren(child);
          parentDiscuss.children.push(childWithChildren);
        }
      }
      return parentDiscuss;
    }
  };

export const deleteDiscuss =
  (sql: SQL) =>
  async (id: number): Promise<boolean> => {
    const res = (await sql(`DELETE FROM discuss WHERE id=${id}`))[0] as ResultSetHeader;
    return res.affectedRows > 0;
  };
