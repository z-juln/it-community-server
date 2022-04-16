import type { DBStudySet } from ".";

export interface DBStudyItem {
  id: number;
  uid: number;
  set_id: number;
  title: string;
  content: string;
  problems: string;
  praise_count: number;
  tread_count: number;
}

export interface StudyItem {
  id: number;
  set: DBStudySet;
  title: string;
  content: string;
  problems: string;
  praise_count: number;
  tread_count: number;
}

export default StudyItem;
