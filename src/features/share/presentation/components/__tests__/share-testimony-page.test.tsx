import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ShareTestimonyPage, truncate } from "@/features/share/presentation/components/share-testimony-page";
import type { ShareTestimony } from "@/features/share/domain/entities/share-testimony";

afterEach(() => cleanup());

function testimony(overrides: Partial<ShareTestimony> = {}): ShareTestimony {
  return {
    id: 1,
    title: "God healed me",
    testimonyType: "written",
    category: "Healing",
    body: "A long story about how healing came after prayer.",
    pullQuote: "God healed me after prayer.",
    videoUrl: "",
    thumbnailUrl: "https://res.cloudinary.com/itestified/image/upload/thumb.jpg",
    ...overrides,
  };
}

describe("ShareTestimonyPage", () => {
  test("renders the title, category, and pull quote", () => {
    render(<ShareTestimonyPage testimony={testimony()} />);

    expect(screen.getByRole("heading", { name: "God healed me" })).toBeInTheDocument();
    expect(screen.getByText("Healing")).toBeInTheDocument();
    expect(screen.getByText("God healed me after prayer.")).toBeInTheDocument();
  });

  test("attribution always reads iTestified, never a real author name or email", () => {
    render(<ShareTestimonyPage testimony={testimony()} />);

    expect(screen.getByText("Shared via iTestified")).toBeInTheDocument();
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });

  test("falls back to a truncated body excerpt when there is no pull quote", () => {
    render(
      <ShareTestimonyPage
        testimony={testimony({ pullQuote: "", body: "A".repeat(400) })}
      />,
    );

    expect(screen.getByText(`${"A".repeat(320)}…`)).toBeInTheDocument();
  });

  test("prompts to watch for a video testimony and read for a written one", () => {
    const { rerender } = render(<ShareTestimonyPage testimony={testimony({ testimonyType: "video" })} />);
    expect(screen.getByText("Watch the full testimony in the app")).toBeInTheDocument();

    rerender(<ShareTestimonyPage testimony={testimony({ testimonyType: "written" })} />);
    expect(screen.getByText("Read the full testimony in the app")).toBeInTheDocument();
  });

  test("links to both app stores", () => {
    render(<ShareTestimonyPage testimony={testimony()} />);

    expect(screen.getByRole("link", { name: "Get it on Google Play" })).toHaveAttribute(
      "href",
      "https://play.google.com/store/apps/details?id=com.itestified.ifnotgod",
    );
    expect(screen.getByRole("link", { name: "Download on the App Store" })).toHaveAttribute(
      "href",
      "https://apps.apple.com/search?term=iTestified",
    );
  });
});

describe("truncate", () => {
  test("returns the original string when it fits within the limit", () => {
    expect(truncate("short text", 320)).toBe("short text");
  });

  test("truncates and appends an ellipsis when the string is too long", () => {
    expect(truncate("A".repeat(10), 5)).toBe("AAAAA…");
  });
});
