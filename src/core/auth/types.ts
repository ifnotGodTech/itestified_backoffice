export type UserRole = "admin";

export type AuthUser = {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
};

export type SessionData = {
  userId: string;
  email: string;
  role: UserRole;
  roleLabel?: string;
  mustChangePassword: boolean;
  fullName?: string;
};
