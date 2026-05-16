import { describe, expect, test } from "vitest";
import { defaultLandingForRole, resolveAccess } from "@/core/auth/access";

describe("auth access resolution", () => {
  test("redirects unauthenticated user to login for protected routes", () => {
    const decision = resolveAccess("/overview", null);
    expect(decision.action).toBe("redirect");
    if (decision.action === "redirect") {
      expect(decision.destination).toContain("/login?redirect=%2Foverview");
    }
  });

  test("redirects authenticated users away from auth pages", () => {
    const decision = resolveAccess("/login", {
      userId: "u_admin_001",
      email: "admin@itestified.app",
      role: "admin",
      mustChangePassword: false,
    });
    expect(decision).toEqual({ action: "redirect", destination: "/overview" });
  });

  test("allows authenticated admin access to admin routes", () => {
    const decision = resolveAccess("/admin", {
      userId: "u_admin_001",
      email: "admin@itestified.app",
      role: "admin",
      mustChangePassword: false,
    });
    expect(decision).toEqual({ action: "allow" });
  });

  test("allows authenticated access to overview", () => {
    const decision = resolveAccess("/overview", {
      userId: "u_admin_001",
      email: "admin@itestified.app",
      role: "admin",
      mustChangePassword: false,
    });
    expect(decision).toEqual({ action: "allow" });
  });

  test("forces temporary-password reset before protected routes", () => {
    const decision = resolveAccess("/overview", {
      userId: "u_admin_001",
      email: "admin@itestified.app",
      role: "admin",
      mustChangePassword: true,
    });
    expect(decision).toEqual({ action: "redirect", destination: "/reset-temporary-password" });
  });

  test("maps landing routes by role", () => {
    expect(defaultLandingForRole()).toBe("/overview");
  });
});
