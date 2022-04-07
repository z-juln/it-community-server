import type { SavedUserResult, Zone, DBStudySet } from ".";

export interface DBStudyRoute {
  id: number;
  uid: number;
  zone_id: number;
  name: string;
  detail?: string;
  primary_contributor: number;
  nodes: number[];
  links: string;
  cover?: string;
  praise_count: number;
  tread_count: number;
}

export interface StudyRoute {
  id: number;
  uid: number;
  zone: Zone;
  name: string;
  detail?: string;
  primary_contributor: SavedUserResult;
  nodes: DBStudySet[];
  links: string[];
  cover?: string;
  praise_count: number;
  tread_count: number;
}

export default StudyRoute;
