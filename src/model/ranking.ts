import { SavedUserResult } from "./user";

export type RankingType = "hot" | "provider";

export interface RankItem {
  userInfo: SavedUserResult;
  point: number;
}

export interface Ranking {
  list: RankItem[];
  me?: RankItem;
}

export default Ranking;
