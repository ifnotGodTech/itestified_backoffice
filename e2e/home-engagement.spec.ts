import { expect, test } from "@playwright/test";

// Phase 35 Slice 5: a real admin reads how people use the app's Home feed.
// Needs the backend running and a real admin's credentials; works with or
// without recorded activity (an empty period shows a note, not an error).
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const nextPassword = process.env.E2E_ADMIN_NEW_PASSWORD;

test("admin opens Home engagement from Analytics and switches the period", async ({ page }) => {
  if (!adminEmail || !adminPassword || !nextPassword) {
    throw new Error("Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, and E2E_ADMIN_NEW_PASSWORD.");
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByRole("textbox", { name: "Password" }).fill(adminPassword);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL(/\/(overview|reset-temporary-password)/, { timeout: 15000 });
  if (page.url().includes("/reset-temporary-password")) {
    await page.getByRole("textbox", { name: "Current Temporary Password" }).fill(adminPassword);
    await page.getByRole("textbox", { name: "New Password", exact: true }).fill(nextPassword);
    await page.getByRole("textbox", { name: "Confirm New Password" }).fill(nextPassword);
    await page.getByRole("button", { name: "Update Password" }).click();
  }
  await expect(page).toHaveURL(/\/overview/, { timeout: 15000 });

  await page.goto("/analytics/home");
  await expect(page.getByRole("heading", { name: "Home engagement", level: 1 })).toBeVisible();
  for (const label of ["Time on a testimony", "Swipes per visit", "Searches a day", "Response rate"]) {
    await expect(page.getByRole("article", { name: label })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Last 7 days" })).toHaveAttribute("aria-current", "page");

  await page.getByRole("link", { name: "30 days" }).click();
  await expect(page).toHaveURL(/period=30/);
  await expect(page.getByRole("link", { name: "30 days" })).toHaveAttribute("aria-current", "page");
});
