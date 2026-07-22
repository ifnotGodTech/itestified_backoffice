import { expect, test } from "@playwright/test";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/overview");
  await expect(page).toHaveURL("/overview", { timeout: 15000 });
}

test("admin can click through written and video testimony filters", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/testimonies");
  await expect(page.getByRole("heading", { name: "Testimonies", exact: true })).toBeVisible();
  await expect(page.getByText("Unable to load testimonies")).toHaveCount(0);
  await expect(page.getByText("Emmanuel Oreoluwa").first()).toBeVisible();

  await page.getByRole("button", { name: "Filter", exact: true }).click();
  const writtenFilterUrl = page.url();
  await expect(page.getByText("Date Range")).toBeVisible();
  await page.getByText("Select").click();
  await expect(page).toHaveURL(writtenFilterUrl);
  await page.getByRole("button", { name: "Deliverance" }).click();
  await expect(page).toHaveURL(writtenFilterUrl);
  await page.getByPlaceholder("dd/mm/yyyy").first().fill("01/01/2026");
  await page.getByPlaceholder("dd/mm/yyyy").nth(1).fill("31/12/2026");
  await page.getByRole("radio", { name: "Approved" }).check();
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/statusFilter=Approved/);
  await expect(page).toHaveURL(/from=01%2F01%2F2026/);
  await expect(page).toHaveURL(/to=31%2F12%2F2026/);
  await expect(page.getByText("John Stone").first()).toBeVisible();

  await page.goto("/testimonies?tab=video");
  await expect(page).toHaveURL(/tab=video/);
  await expect(page.getByText("Video testimony: Restoration").first()).toBeVisible();

  await page.getByRole("button", { name: "Filter", exact: true }).click();
  const videoFilterUrl = page.url();
  await page.getByText("Select").last().click();
  await expect(page).toHaveURL(videoFilterUrl);
  await page.getByRole("button", { name: "YouTube" }).click();
  await expect(page).toHaveURL(videoFilterUrl);
  await page.getByPlaceholder("dd/mm/yyyy").first().fill("01/01/2026");
  await page.getByPlaceholder("dd/mm/yyyy").nth(1).fill("31/12/2026");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/source=YouTube/);
  await expect(page).toHaveURL(/from=01%2F01%2F2026/);
  await expect(page).toHaveURL(/to=31%2F12%2F2026/);
  await expect(page.getByText("Video testimony: Restoration").first()).toBeVisible();
  await expect(page.getByText("YouTube").first()).toBeVisible();
});
