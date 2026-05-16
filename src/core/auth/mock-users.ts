import type { AuthUser } from "@/core/auth/types";

const seedUsers: AuthUser[] = [
  {
    id: "u_admin_001",
    email: "admin@itestified.app",
    password: "pass123",
    fullName: "Elvis Igiebor",
    role: "admin",
  },
];

const runtimeUsers: AuthUser[] = [];

export function listMockUsers() {
  return [...seedUsers, ...runtimeUsers];
}

export function findUserByEmail(email: string) {
  const normalizedEmail = email.toLowerCase();
  return runtimeUsers.find((u) => u.email.toLowerCase() === normalizedEmail) ?? seedUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
}

export function upsertAdminUser(input: { email: string; password: string; fullName?: string }) {
  const normalizedEmail = input.email.toLowerCase();
  const seedUser = seedUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (seedUser) {
    return seedUser;
  }

  const existing = findUserByEmail(input.email);

  if (existing) {
    existing.password = input.password;
    existing.fullName = input.fullName ?? existing.fullName;
    existing.role = "admin";
    return existing;
  }

  const user: AuthUser = {
    id: `u_admin_${seedUsers.length + runtimeUsers.length + 1}`,
    email: input.email,
    password: input.password,
    fullName: input.fullName ?? "Admin User",
    role: "admin",
  };

  runtimeUsers.push(user);
  return user;
}
