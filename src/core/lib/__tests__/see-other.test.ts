import { describe, expect, it } from "vitest";
import { seeOther } from "@/core/lib/see-other";

describe("seeOther", () => {
  it("redirects with 303 to a relative location, so the browser keeps the host it is on", () => {
    const response = seeOther("/users?tab=deactivated&success=deactivate");

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/users?tab=deactivated&success=deactivate");
  });

  it.each(["https://evil.example/phish", "//evil.example/phish", "/\\evil.example", "users"])(
    "refuses %s as a destination and falls back",
    (path) => {
      expect(seeOther(path, "/users?state=error").headers.get("location")).toBe("/users?state=error");
    },
  );
});
