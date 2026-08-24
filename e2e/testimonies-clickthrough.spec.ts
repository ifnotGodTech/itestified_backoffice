import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const nextPassword = process.env.E2E_ADMIN_NEW_PASSWORD;

test("real admin can click through testimony performance surfaces", async ({ page }) => {
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

  const timings: Record<string, number> = {};

  const textStart = Date.now();
  await page.goto("/testimonies");
  await expect(page.getByRole("heading", { name: "Testimonies", exact: true })).toBeVisible();
  await expect(page.getByText("Unable to load testimonies")).toHaveCount(0);
  await expect(page.getByText("QA Author").first()).toBeVisible({ timeout: 15000 });
  timings.textLoadMs = Date.now() - textStart;

  const actionStart = Date.now();
  await page.getByRole("button", { name: /Open actions for testimony/ }).first().click();
  await expect(page.getByRole("button", { name: "View" })).toBeVisible();
  timings.actionMenuMs = Date.now() - actionStart;

  const detailStart = Date.now();
  await page.getByRole("button", { name: "View" }).click();
  await expect(page.getByRole("button", { name: /Dismiss .*testimony detail/ })).toBeVisible();
  timings.detailOpenMs = Date.now() - detailStart;
  await page.getByRole("button", { name: /Dismiss .*testimony detail/ }).click();
  await expect(page.getByText("Approve Testimony")).toHaveCount(0);

  const audioStart = Date.now();
  await page.getByRole("button", { name: "Audio", exact: true }).click();
  await expect(page).toHaveURL(/tab=audio/);
  await expect(page.getByText("Audio testimony: Peace in the waiting")).toBeVisible({ timeout: 15000 });
  timings.audioTabMs = Date.now() - audioStart;

  await page.getByRole("button", { name: /Audio testimony: Peace in the waiting/ }).click();
  await expect(page.getByRole("heading", { name: "Audio testimony: Peace in the waiting" })).toBeVisible();
  await expect(page.getByLabel("Play Audio testimony: Peace in the waiting")).toBeVisible();
  await expect(page.getByText("Transcript ready", { exact: true })).toBeVisible();
  await expect(page.getByText(/God gave me peace before the answer arrived/)).toBeVisible();
  await page.getByRole("button", { name: "Approve Testimony" }).click();
  await expect(page).toHaveURL(/tab=audio.*success=approve/, { timeout: 15000 });
  await expect(page.getByText("Testimony Approved Successfully!")).toBeVisible();
  await page
    .getByRole("button", { name: "Close testimony approved success modal" })
    .click({ position: { x: 8, y: 8 } });

  await page.getByRole("link", { name: "Audio Upload Policy" }).click();
  await expect(page.getByRole("heading", { name: "Audio upload policy" })).toBeVisible();
  await expect(page.getByLabel("Maximum file size in MB")).toHaveValue("50");
  await expect(page.getByLabel("Maximum duration in minutes")).toHaveValue("15");
  await page.getByRole("button", { name: "Review changes" }).click();
  await expect(page.getByRole("heading", { name: "Confirm policy update" })).toBeVisible();
  await page.getByRole("button", { name: "Confirm policy update" }).click();
  await expect(page.getByText("Audio upload policy updated. New uploads will use these limits.")).toBeVisible();
  await page.getByRole("button", { name: "Dismiss audio upload policy" }).click();

  const filterStart = Date.now();
  await page.getByRole("button", { name: "Filter" }).click();
  await expect(page.getByText("Date Range")).toBeVisible();
  timings.filterOpenMs = Date.now() - filterStart;
  await page.getByRole("button", { name: "Dismiss testimony filter" }).click();
  await expect(page.getByText("Date Range")).toHaveCount(0);

  const videoStart = Date.now();
  await page.getByRole("button", { name: "Video", exact: true }).click();
  await expect(page).toHaveURL(/tab=video/);
  await expect(page.getByText("Video testimony: Restoration")).toBeVisible({ timeout: 15000 });
  timings.videoTabMs = Date.now() - videoStart;

  await page.getByRole("button", { name: /Open actions for video testimony/ }).first().click();
  await expect(page.getByRole("button", { name: "View" })).toBeVisible();
  await page.getByRole("button", { name: "View" }).click();
  await expect(page.getByRole("heading", { name: "Video Details" })).toBeVisible();
  await page.getByRole("button", { name: "Close video details", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Video Details" })).toHaveCount(0);

  await page.goto("/donations");
  await expect(page.getByRole("heading", { name: "Donations history" })).toBeVisible();
  const donationTabStart = Date.now();
  await page.getByRole("button", { name: "Pending" }).click();
  await expect(page).toHaveURL(/tab=pending/);
  await expect(page.getByRole("button", { name: "Pending" })).toHaveAttribute("aria-pressed", "true");
  timings.donationsTabMs = Date.now() - donationTabStart;

  await page.goto("/users");
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  const usersTabStart = Date.now();
  await page.getByRole("button", { name: "Deactivated accounts" }).click();
  await expect(page).toHaveURL(/tab=deactivated/);
  await expect(page.getByRole("button", { name: "Deactivated accounts" })).toHaveAttribute("aria-pressed", "true");
  timings.usersTabMs = Date.now() - usersTabStart;

  await page.goto("/home-management");
  await expect(page.getByRole("heading", { name: "Home Page Management" })).toBeVisible();
  const homeTabStart = Date.now();
  await page.getByRole("button", { name: "Inspirational Pictures", exact: true }).click();
  await expect(page).toHaveURL(/tab=pictures/);
  await expect(page.getByRole("button", { name: "Inspirational Pictures", exact: true })).toHaveAttribute("aria-pressed", "true");
  timings.homeManagementTabMs = Date.now() - homeTabStart;

  await page.goto("/scripture-of-the-day");
  await expect(page.getByRole("heading", { name: "Scripture of the day" })).toBeVisible();
  const scriptureTabStart = Date.now();
  await page.getByRole("button", { name: "Scheduled" }).click();
  await expect(page).toHaveURL(/tab=scheduled/);
  await expect(page.getByRole("button", { name: "Scheduled" })).toHaveAttribute("aria-pressed", "true");
  timings.scriptureTabMs = Date.now() - scriptureTabStart;

  await page.goto("/admin");
  await expect(page.getByText("All Admin Users").first()).toBeVisible();
  const adminTabStart = Date.now();
  await page.getByRole("button", { name: "Deactivated" }).click();
  await expect(page).toHaveURL(/tab=deactivated/);
  await expect(page.getByRole("button", { name: "Deactivated" })).toHaveAttribute("aria-pressed", "true");
  timings.adminTabMs = Date.now() - adminTabStart;

  console.log(JSON.stringify({ timings }, null, 2));
});
