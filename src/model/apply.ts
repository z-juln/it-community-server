import { SavedUserResult } from "./user";

export type ApplyTargetTye = 'provider' | 'admin' | 'zone' | 'study-route' | 'study-set' | 'study-item';

export type ApplyStatus = 'waitting' | 'pass' | 'rejected';

export interface DBApply {
  uid: number;
  target_id?: number;
  target: ApplyTargetTye;
  condition: string;
  status: ApplyStatus;
}

export interface Apply {
  uid: number;
  target_id?: number;
  target: ApplyTargetTye;
  condition: string;
  status: ApplyStatus;
  user: SavedUserResult;
}

export default Apply;
