import { SavedUserResult } from "./user";

export type ApplyTargetTye = 'provider' | 'admin' | 'zone' | 'study-route' | 'study-set' | 'study-item';

export interface DBApply {
  uid: number;
  target: ApplyTargetTye;
  condition: string;
  status: 'waitting' | 'pass';
}

export interface Apply {
  uid: number;
  target: ApplyTargetTye;
  condition: string;
  status: 'waitting' | 'pass';
  user: SavedUserResult;
}

export default Apply;
