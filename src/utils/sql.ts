import mysql from "mysql2/promise";
import { dbJson, createHooks } from "../sql";

let connection: mysql.Connection;

export const connectDB = async () => {
  if (!connection) {
    connection = await mysql.createConnection(dbJson);

    try {
      await connection.connect();
      console.log("\n\t数据库连接成功");
    } catch (error) {
      console.log("\n\t数据库连接失败: ", error);
    }
  }

  return connection.execute.bind(connection);
};

export type SQL = mysql.Connection["execute"];

export const initDatabase = async (sql: SQL) => {
  console.log("\n\tinit database...");

  const hooks = Object.values(createHooks);
  for (const { hidden, tableName, create, initRow = [] } of hooks) {
    if (hidden) {
      console.log(`\n\thidden table ${tableName}`);
      return;
    }

    try {
      console.log(`\n\tinit table ${tableName}`);
      await sql(create);
      console.log(`\n\tinsert rows of table ${tableName}`);
      console.log(`\n\tinit table ${tableName} over...`);
      const initRows = typeof initRow === "string" ? [initRow] : initRow;
      for (const row of initRows) {
        await sql(row);
      }
    } catch (error: any) {
      if (error.code === "ER_TABLE_EXISTS_ERROR") {
        console.log("\n\terror: ER_TABLE_EXISTS_ERROR");
        return;
      }
      console.log("\n\terror: ", error);
    }
  }
};
