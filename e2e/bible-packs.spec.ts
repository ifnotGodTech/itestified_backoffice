import { expect, test } from "@playwright/test";

// Phase 34 Slice 8: a real admin controls which Bibles readers can download.
// Needs the backend running with the BSB (default), KJV and word-study packs
// registered, and a real admin's credentials. Leaves the KJV as it found it
// (available).
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const nextPassword = process.env.E2E_ADMIN_NEW_PASSWORD;

test("admin hides a Bible after confirming, sees why the default can't be hidden, and restores it", async ({
  page,
}) => {
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

  await page.getByRole("link", { name: "Bible downloads" }).first().click();
  await expect(page).toHaveURL(/\/bible-packs/);
  await expect(page.getByRole("heading", { name: "Bible downloads", level: 1 })).toBeVisible();

  // The default can't be hidden, and the page says why before anyone tries.
  const bsb = page.getByRole("article", { name: "Berean Standard Bible" });
  await expect(bsb.getByText("Default for new readers")).toBeVisible();
  await expect(bsb.getByText(/Make another version the default before hiding it/)).toBeVisible();

  // Start from a known state: a run that stopped halfway may have left the
  // KJV hidden.
  const kjv = page.getByRole("article", { name: "King James Version" });
  const makeAvailable = kjv.getByRole("button", { name: "Make available" });
  if (await makeAvailable.isVisible()) {
    await makeAvailable.click();
    await expect(kjv.getByText("Available to readers")).toBeVisible();
  }

  // Hiding asks first.
  await kjv.getByRole("link", { name: "Hide from readers" }).click();
  const dialog = page.getByRole("dialog", { name: "Hide King James Version?" });
  await expect(dialog.getByText(/already downloaded it keep it/)).toBeVisible();
  await dialog.getByRole("button", { name: "Hide KJV" }).click();

  await expect(page.getByRole("status")).toHaveText(/King James Version is hidden from readers/);
  await expect(kjv.getByText("Hidden", { exact: true })).toBeVisible();
  await expect(page.getByRole("list").getByText(/hid King James Version/).first()).toBeVisible();

  // Readers no longer see it in the app's download list.
  const manifest = await page.request.get(`${process.env.E2E_BACKEND_URL ?? "http://127.0.0.1:8000/api/v1"}/bible/packs/`);
  const codes = ((await manifest.json()) as { results: { code: string }[] }).results.map((pack) => pack.code);
  expect(codes).not.toContain("kjv");

  // And it comes back.
  await kjv.getByRole("button", { name: "Make available" }).click();
  await expect(page.getByRole("status")).toHaveText(/King James Version is now available/);
  await expect(kjv.getByText("Available to readers")).toBeVisible();
});
