import { expect, test } from "@playwright/test";

// Phase 35 Slice 6: a real admin creates a reaction, gives a category its own
// set with it, sees the preview, then puts things back (default set, reaction
// retired). Needs the backend running and a real admin's credentials.
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const nextPassword = process.env.E2E_ADMIN_NEW_PASSWORD;

test("admin creates a reaction, offers it on a category, then retires it", async ({ page }) => {
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

  const label = `E2E ${Date.now() % 100000}`;
  await page.goto("/testimonies/reactions");
  await expect(page.getByRole("heading", { name: "Reactions", level: 1 })).toBeVisible();
  await expect(page.getByRole("main").getByText("Default set:")).toBeVisible();

  await page.getByRole("button", { name: "+ New reaction" }).click();
  const form = page.getByRole("dialog", { name: "New reaction" });
  await form.getByLabel("What the button says").fill(label);
  await form.getByRole("radio", { name: "dove" }).click();
  await form.getByRole("button", { name: "Create reaction" }).click();
  await expect(page.getByRole("status")).toContainText(`“${label}” created`);
  await expect(page.getByRole("table", { name: "Reactions in use" })).toContainText(label);

  await page.getByRole("link", { name: "Category sets" }).click();
  await expect(page).toHaveURL(/view=sets/);
  const firstCategory = page.getByRole("region", { name: "Sets" }).getByRole("button").nth(1);
  const categoryName = (await firstCategory.locator("span").first().innerText()).replace(/hidden$/, "").trim();
  await firstCategory.click();
  await expect(page).toHaveURL(/set=\d+/);
  const editor = page.getByRole("region", { name: `${categoryName} reactions` });
  const before = await editor.getByRole("listitem").count();
  await editor.getByRole("combobox").selectOption({ label: `🕊️ ${label}` });
  await expect(editor.getByText("Unsaved changes")).toBeVisible();
  await expect(page.getByRole("region", { name: "Preview" })).toContainText(label);
  await editor.getByRole("button", { name: new RegExp(`^Save ${categoryName}`) }).click();
  await expect(page.getByRole("status")).toContainText("saved");

  // Put the category back as it was.
  if (before === 0) {
    await editor.getByRole("button", { name: "Go back to the default set" }).click();
  } else {
    await editor.getByRole("button", { name: `Remove ${label} from this set` }).click();
  }
  await editor.getByRole("button", { name: new RegExp(`^Save ${categoryName}`) }).click();
  await expect(page.getByRole("status")).toContainText(categoryName);

  await page.getByRole("link", { name: "Catalogue" }).click();
  await page.getByRole("button", { name: `Retire ${label}` }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Retire reaction" }).click();
  await expect(page.getByRole("table", { name: "Retired reactions" })).toContainText(label);
});
