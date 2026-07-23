import { expect, test, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/overview");
  await expect(page).toHaveURL("/overview", { timeout: 15000 });
}

test("admin tabs fetch inactive data only after first tab click", async ({ page }) => {
  await loginAsAdmin(page);

  const surfaces = [
    {
      route: "/testimonies",
      apiPath: "/api/admin/testimonies/list",
      tabName: "Video",
      url: /tab=video/,
      activeName: "Video",
    },
    {
      route: "/users",
      apiPath: "/api/admin/users/list",
      tabName: "Deactivated accounts",
      url: /tab=deactivated/,
      activeName: "Deactivated accounts",
    },
    {
      route: "/donations",
      apiPath: "/api/admin/donations/list",
      tabName: "Pending",
      url: /tab=pending/,
      activeName: "Pending",
    },
  ];

  for (const surface of surfaces) {
    let listRequests = 0;
    const countRequest = (request: { url: () => string }) => {
      if (new URL(request.url()).pathname === surface.apiPath) {
        listRequests += 1;
      }
    };
    page.on("request", countRequest);

    await page.goto(surface.route);
    await expect(page.getByRole("main")).toBeVisible();
    await page.waitForTimeout(250);
    expect(listRequests).toBe(0);

    const tabStart = Date.now();
    await page.getByRole("button", { name: surface.tabName, exact: true }).click();
    await expect(page).toHaveURL(surface.url);
    await expect(page.getByRole("button", { name: surface.activeName, exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(Date.now() - tabStart).toBeLessThan(2500);
    expect(listRequests).toBe(1);

    page.off("request", countRequest);
  }
});

test("route-opened testimony modal closes locally without network work", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/testimonies?reject=1");
  await expect(page.getByRole("heading", { name: "Reject Testimony" })).toBeVisible();

  let requestsAfterClose = 0;
  const countRequest = () => {
    requestsAfterClose += 1;
  };
  page.on("request", countRequest);

  const closeStart = Date.now();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("heading", { name: "Reject Testimony" })).toHaveCount(0);
  await expect(page).toHaveURL("/testimonies");
  await page.waitForTimeout(100);

  expect(Date.now() - closeStart).toBeLessThan(1000);
  expect(requestsAfterClose).toBe(0);
  page.off("request", countRequest);
});

test("testimony approval posts once and relies on one route transition", async ({ page }) => {
  await loginAsAdmin(page);

  let approvePosts = 0;
  let clientListRequests = 0;

  await page.route("**/api/admin/testimonies/*/approve", async (route) => {
    approvePosts += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Approved" }),
    });
  });

  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/admin/testimonies/list") {
      clientListRequests += 1;
    }
  });

  await page.goto("/testimonies?view=1");
  await expect(page.getByRole("button", { name: "Approve Testimony" })).toBeVisible();

  const approveStart = Date.now();
  await page.getByRole("button", { name: "Approve Testimony" }).click();
  await expect(page).toHaveURL(/success=approve/);
  await expect(page.getByText("Testimony Approved Successfully!").first()).toBeVisible();

  expect(Date.now() - approveStart).toBeLessThan(3000);
  expect(approvePosts).toBe(1);
  expect(clientListRequests).toBe(0);
});
