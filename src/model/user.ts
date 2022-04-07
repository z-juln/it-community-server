export enum UserRole {
  COMMON = "common",
  PROVIDER = "provider",
  ADMIN = "admin",
}

export interface User {
  uid: number;
  name: string;
  password: string;
  avatar?: string;
  role: UserRole;
  type: UserRole;
  /** JSON存储的github用户信息 */
  github: string;
}

export type SavedUserResult = Omit<User, "password">;

export default User;
