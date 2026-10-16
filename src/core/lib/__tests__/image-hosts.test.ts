import { describe, expect, it } from "vitest";
import { canOptimizeImage } from "@/core/lib/image-hosts";

describe("canOptimizeImage", () => {
  it("accepts the dashboard's own files and the configured hosts", () => {
    expect(canOptimizeImage("/admin-logo.svg")).toBe(true);
    expect(canOptimizeImage("https://res.cloudinary.com/demo/image/upload/sunrise.jpg")).toBe(true);
    expect(canOptimizeImage("https://placehold.co/600x400")).toBe(true);
  });

  it("leaves pictures on any other host to be shown unoptimized", () => {
    expect(canOptimizeImage("https://images.example.org/sunrise.jpg")).toBe(false);
    expect(canOptimizeImage("http://res.cloudinary.com/demo/sunrise.jpg")).toBe(false);
    expect(canOptimizeImage("not a url")).toBe(false);
  });
});
