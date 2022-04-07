import { SavedUserResult } from "./user";

export type DiscussType = "answer" | "super" | "sub";

export interface Discuss {
  id: number;
  user_id: number;
  content: string;
  type: DiscussType;
  children: string;
  super_type: "zone" | "set" | "item";
  super_id: number;
  praise_count: number;
  tread_count: number;
  create_time: string;
}

export type DiscussWithChildren = Omit<Discuss, "children"> & {
  userInfo: SavedUserResult;
  childrenIds: Discuss["children"];
  children: DiscussWithChildren[];
};

export default Discuss;
