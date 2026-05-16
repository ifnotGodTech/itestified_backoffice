import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { WebHomeBase } from "@/features/web-home/presentation/components/web-home-base";

describe("WebHomeBase", () => {
  test("renders core phase 1 sections", () => {
    render(<WebHomeBase />);
    expect(screen.getByText("Written")).toBeInTheDocument();
    expect(screen.getByText("Video Testimony")).toBeInTheDocument();
    expect(screen.getByText("Manage settings (testimony)")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });
});
