type Hooks = {
  tableName: string;
  create: string;
  initRow?: string | string[];
  hidden?: boolean;
};

export const users: Hooks = ((tableName: string) => ({
  tableName,
  create: `CREATE TABLE ${tableName} (
    uid bigint PRIMARY KEY AUTO_INCREMENT,
    name varchar(100) NOT NULL,
    password varchar(100) NOT NULL,
    avatar varchar(100) DEFAULT "/assets/images/default-avatar.png",
    role varchar(100) DEFAULT "common" COMMENT "common | provider | admin",
    github varchar(100) DEFAULT "null" COMMENT "github用户信息, 值为JSON",
    integral bigint DEFAULT 0 COMMENT "积分, 用于兑换奖品",
    level bigint DEFAULT 0,
    hot bigint DEFAULT 0 COMMENT "社区活跃度",
    pr_hot bigint DEFAULT 0 COMMENT "贡献活跃度, 只有当role='provider'时才生效"
  )`,
  initRow: [
    `INSERT INTO ${tableName}
      (uid, name, password, role)
      VALUES (1, "juln", "juln123", "provider")
    `,
    `INSERT INTO ${tableName}
      (uid, name, password)
      VALUES (2, "社会你庄哥", "juln123")
    `,
    `INSERT INTO ${tableName}
      (uid, name, password, role)
      VALUES (3, "admin", "admin", "admin")
    `,
  ],
}))("users");

export const zone: Hooks = ((tableName: string) => ({
  tableName,
  create: `CREATE TABLE ${tableName} (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    name varchar(100) NOT NULL
  )`,
  initRow: [
    `INSERT INTO ${tableName} (id, name) VALUES (1, "前端")`,
    `INSERT INTO ${tableName} (id, name) VALUES (2, "后端")`,
  ],
}))("zone");

export const study_route: Hooks = ((tableName: string) => ({
  tableName,
  create: `CREATE TABLE ${tableName} (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    uid bigint NOT NULL,
    zone_id bigint NOT NULL,
    name varchar(100) NOT NULL,
    detail varchar(100) DEFAULT "",
    primary_contributor bigint NOT NULL COMMENT "主要贡献者的uid",
    nodes varchar(100) DEFAULT "[]" COMMENT "路线节点(study_set)的列表, 值为JSON, set_id[]",
    links varchar(100) DEFAULT "[]" COMMENT "相关学习链接",
    cover varchar(100) DEFAULT "/assets/images/default-cover.png",
    praise_count bigint DEFAULT 0,
    tread_count bigint DEFAULT 0,
    FOREIGN KEY (primary_contributor) REFERENCES users(uid),
    FOREIGN KEY (zone_id) REFERENCES zone(id)
  )`,
  initRow: [
    `INSERT INTO ${tableName}
      (id, uid, name, detail, primary_contributor, nodes, zone_id)
      VALUES (1, 1, "前端脚手架", "一套能让你成为脚手架专家的学习路线", 1, "[1, 2]", 1)
    `,
    `INSERT INTO ${tableName}
      (id, uid, name, primary_contributor, zone_id)
      VALUES (2, 1, "前端组件库", 1, 1)
    `,
  ],
}))("study_route");

// export const contribute: Hooks = ((tableName: string) => ({
//   hidden: true,
//   tableName,
//   create: `CREATE TABLE ${tableName} (
//     id int PRIMARY KEY AUTO_INCREMENT,
//     contributor int NOT NULL COMMENT "贡献者uid",
//     route_id int NO NULL,
//     start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (route_id) REFERENCES study_route(id),
//     FOREIGN KEY (contributor) REFERENCES users(uid)
//   )`,
//   initRow: [],
// }))("contribute");

export const study_set: Hooks = ((tableName: string) => ({
  tableName,
  create: `CREATE TABLE ${tableName} (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    uid bigint NOT NULL,
    zone_id bigint NOT NULL,
    name varchar(100) NOT NULL,
    cover varchar(100) DEFAULT "/assets/images/default-cover.png",
    detail varchar(100) DEFAULT "",
    links varchar(100) DEFAULT "[]" COMMENT "相关学习链接, 值为JSON格式的数组",
    praise_count bigint DEFAULT 0,
    tread_count bigint DEFAULT 0,
    FOREIGN KEY (uid) REFERENCES users(uid),
    FOREIGN KEY (zone_id) REFERENCES zone(id)
  )`,
  initRow: [
    `INSERT INTO ${tableName}
      (id, uid, name, zone_id)
      VALUES (1, 1, "前端基础", 1)
    `,
    `INSERT INTO ${tableName}
      (id, uid, name, zone_id)
      VALUES (2, 1, "Node.js", 1)
    `,
  ],
}))("study_set");

export const study_item: Hooks = ((tableName: string) => ({
  tableName,
  create: `CREATE TABLE ${tableName} (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    uid bigint NOT NULL,
    set_id bigint NOT NULL,
    title varchar(100) NOT NULL,
    detail varchar(100) DEFAULT "",
    content varchar(8000) DEFAULT "null" COMMENT "值为JSON格式",
    praise_count bigint DEFAULT 0,
    tread_count bigint DEFAULT 0,
    FOREIGN KEY (uid) REFERENCES users(uid),
    FOREIGN KEY (set_id) REFERENCES study_set(id)
  )`,
  // 题型, choice为选择; confirm为判断; input为问答
  initRow: [
    `INSERT INTO ${tableName}
      (uid, set_id, title, detail, content)
      VALUES (1, 2, "loop event", "detail...", "")
    `,
    `INSERT INTO ${tableName}
      (uid, set_id, title, detail, content)
      VALUES (1, 2, "test", "test...", "")
    `,
    // [{"$$typeof":"HOST","content":"<div>写点什么吧...</div><div><br></div>"},{"key":"1647787448853","$$typeof":"Material","content":{"type":"single-choice","title":"单选题题目xxx","content":{"a":"aaa","b":"bbb","c":"ccc"},"answer":"a"}},{"$$typeof":"HOST","content":"<div><br></div><div>👌</div>"}]
  ],
}))("study_item");

export const discuss: Hooks = ((tableName: string) => ({
  tableName,
  create: `CREATE TABLE ${tableName} (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    user_id bigint NOT NULL,
    content varchar(100) NOT NULL,
    type varchar(100) DEFAULT "super" COMMENT "answer为答题(特殊的顶层评论), super为顶层评论, sub为子层评论",
    children varchar(100) DEFAULT "[]" COMMENT "子评论id的列表, 值为JSON, id[]",
    super_type varchar(100) DEFAULT "item" COMMENT "当前评论为顶层评论时值才有效, zone | set | item",
    super_id bigint DEFAULT -1 COMMENT "当前评论为顶层评论时值才有效, zone_id | set_id | item_id",
    praise_count bigint DEFAULT 0,
    tread_count bigint DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(uid)
  )`,
  initRow: [
    `INSERT INTO ${tableName}
      (id, user_id, content, children, super_id)
      VALUES (1, 1, "666!", "[2, 3]", 1)
    `,
    `INSERT INTO ${tableName}
      (id, user_id, content, type)
      VALUES (2, 2, "6个屁啊", "sub")
    `,
    `INSERT INTO ${tableName}
      (id, user_id, content, type, children)
      VALUES (3, 2, "基操而已", "sub", "[4]")
    `,
    `INSERT INTO ${tableName}
      (id, user_id, content, type)
      VALUES (4, 1, "哦!", "sub")
    `,
  ],
}))("discuss");

export const apply_condition: Hooks = ((tableName: string) => ({
  tableName,
  create: `CREATE TABLE ${tableName} (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    uid bigint NOT NULL,
    target_id bigint,
    target varchar(100) DEFAULT "provider" COMMENT "provider | admin | zone | study-route | study-set | study-item",
    \`condition\` varchar(100) NOT NULL COMMENT "值为JSON格式数组",
    status varchar(100) DEFAULT "waitting" COMMENT "waitting | pass | reject",
    FOREIGN KEY (uid) REFERENCES users(uid)
  )`,
  initRow: [
    // `INSERT INTO ${tableName}
    //   (\`condition\`, uid)
    //   VALUES ("[{type: 'github_min_star', value: 500}]", 2)
    // `,
  ],
}))("apply");
