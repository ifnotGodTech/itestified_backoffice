import { expect, test } from "@playwright/test";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/overview");
  await expect(page).toHaveURL("/overview", { timeout: 15000 });
}

test("splash redirects into admin signup flow", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL("/signup");
  await expect(page.getByRole("heading", { name: "Admin Access Is Invite Only" })).toBeVisible();
  await expect(page.getByText("Self-service admin signup has been retired.")).toBeVisible();
});

test("existing admin can log in and reach overview", async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Pending Testimonies")).toBeVisible();
  await expect(page.getByText("Elvis Igiebor")).toBeVisible();
});

test("sidebar navigation preserves the dashboard shell", async ({ page }) => {
  await loginAsAdmin(page);
  const header = page.locator("header").first();
  await expect(header).toBeVisible();
  await header.evaluate((element) => {
    (element as HTMLElement & { __shellMarker?: string }).__shellMarker = "persistent-shell";
  });

  await page.getByRole("link", { name: "Users", exact: true }).click();

  await expect(page).toHaveURL("/users");
  await expect(page.getByRole("heading", { name: "Users", exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("header")
        .first()
        .evaluate((element) => (element as HTMLElement & { __shellMarker?: string }).__shellMarker),
    )
    .toBe("persistent-shell");
});

test("bell icon opens notifications panel and can route to notifications history", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("link", { name: "Open notifications" }).click();

  await expect(page).toHaveURL("/notifications-history?panel=1");
  await expect(page.getByRole("link", { name: "View all notifications" })).toBeVisible();

  await page.getByRole("link", { name: "View all notifications" }).click();
  await expect(page).toHaveURL("/notifications-history");
  await expect(page.getByRole("heading", { name: "Notifications" }).first()).toBeVisible();
});

test("overview supports the empty dataset state", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/overview?state=empty");

  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("No Data here Yet").first()).toBeVisible();
  await expect(page.getByText("Pending Donations")).toBeVisible();
});

test("sidebar logout clears the session and returns to login", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Log Out" }).click();

  await expect(page).toHaveURL("/login");
  await page.goto("/overview");
  await expect(page).toHaveURL(/\/login\?redirect=%2Foverview/);
});

test("home page management route renders phase 3 table state", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/home-management");

  await expect(page.getByRole("heading", { name: "Home Page Management" })).toBeVisible();
  await expect(page.getByText("Available Testimonies")).toBeVisible();
  await expect(page.getByText("Display Rule")).toBeVisible();
});

test("home page management supports the remove confirmation state", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/home-management?tab=video&remove=1");

  await expect(page.getByRole("heading", { name: "Remove from Home Page?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Yes, remove" })).toBeVisible();
});

test("home page management supports the row action menu state", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/home-management?tab=video&menu=1");

  await expect(page.getByRole("link", { name: "View", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Remove", exact: true })).toBeVisible();
});

test("home page management supports inspirational picture details", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/home-management?tab=pictures&view=1");

  await expect(page.getByRole("heading", { name: "Picture Details" })).toBeVisible();
  await expect(page.getByText("Number of downloads").first()).toBeVisible();
  await expect(page.getByRole("definition").filter({ hasText: "Instagram.com" })).toBeVisible();
});

test("home page management supports loading, empty, and error states", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/home-management?state=loading");
  await expect(page.getByRole("heading", { name: "Home Page Management" })).toBeVisible();
  await expect(page.getByRole("main").getByText("Available Testimonies").first()).toBeVisible();

  await page.goto("/home-management?state=empty");
  await expect(page.getByRole("heading", { name: "No featured testimonies yet" })).toBeVisible();

  await page.goto("/home-management?state=error");
  await expect(page.getByRole("heading", { name: "Unable to load home page content" })).toBeVisible();
});

test("scripture of the day supports overview, action menu, details, and edit states", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/scripture-of-the-day");
  await expect(page.getByRole("heading", { name: "Scripture of the day" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Upload New Scripture/ })).toBeVisible();

  await page.goto("/scripture-of-the-day?menu=1");
  await expect(page.getByRole("link", { name: "View", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Edit", exact: true })).toBeVisible();

  await page.goto("/scripture-of-the-day?view=2");
  await expect(page.getByRole("heading", { name: "Scripture Details" })).toBeVisible();
  await expect(page.locator("dl").first().getByText("Scheduled Date", { exact: true })).toBeVisible();
  await expect(page.locator("dl").first().getByText("Scheduled", { exact: true })).toBeVisible();

  await page.goto("/scripture-of-the-day?edit=1");
  await expect(page.getByRole("heading", { name: "Edit Scripture" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save Changes" })).toBeVisible();
});

test("scripture of the day supports upload new and delete flows", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/scripture-of-the-day?edit=new");
  await expect(page.getByRole("heading", { name: "Schedule Scriptures", level: 1 }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Schedule Settings" })).toBeVisible();
  await expect(page.getByRole("link", { name: "+ Add New" })).toBeVisible();

  await page.goto("/scripture-of-the-day?remove=1");
  await expect(page.getByRole("heading", { name: "Delete Scripture?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Yes, delete" })).toBeVisible();
});

test("scripture of the day supports filter modal", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/scripture-of-the-day?filter=1");
  const filterModal = page.locator("form[action='/scripture-of-the-day']").filter({ has: page.getByText("Date Range") }).first();
  await expect(filterModal).toBeVisible();
  await expect(filterModal.getByText("Filter", { exact: true })).toBeVisible();
  await expect(filterModal.getByText("Date Range", { exact: true })).toBeVisible();
  await expect(filterModal.getByText("Status", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply" })).toBeVisible();
});

test("users route supports registered, details, and deactivate flows", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/users");
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(page.getByText("User Management").first()).toBeVisible();
  await expect(page.getByText("Emmanuel Oreoluwa").first()).toBeVisible();

  await page.goto("/users?view=2");
  await expect(page.getByText("User ID").first()).toBeVisible();
  await expect(page.getByText("Registered").first()).toBeVisible();

  await page.goto("/users?deactivate=1");
  await expect(page.getByRole("heading", { name: "Deactivate Account" })).toBeVisible();
  await expect(page.getByText("Confirm Deactivation").first()).toBeVisible();
});

test("users route supports deleted, deactivated, and empty states", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/users?tab=deleted");
  await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
  await expect(page.getByText("Felix Stone").first()).toBeVisible();

  await page.goto("/users?tab=deactivated&view=1");
  await expect(page.getByRole("heading", { name: "Account Timeline" })).toBeVisible();
  await expect(page.getByText("Deactivation Reason").first()).toBeVisible();

  await page.goto("/users?state=empty");
  await expect(page.getByRole("main").getByText("No Data here Yet")).toBeVisible();
});

test("users route supports reactivation flow", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/users?tab=deactivated&reactivate=1");
  await expect(page.getByRole("heading", { name: "Reactivate Account?" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Select/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Reactivate", exact: true })).toBeVisible();

  await page.goto("/users?tab=registered&success=reactivate");
  await expect(page.getByText("Account Reactivated Successfully!").first()).toBeVisible();
});

test("forgot-password completion redirects to login with success state", async ({ page }) => {
  await page.route("**/api/auth/forgot-password", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Reset code sent." }),
    });
  });
  await page.route("**/api/auth/forgot-password/verify", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Code verified." }),
    });
  });
  await page.route("**/api/auth/forgot-password/complete", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Password reset completed." }),
    });
  });

  await page.goto("/forgot-password");
  await page.getByRole("button", { name: "Send Reset Code" }).click();
  await page.getByLabel("Reset Code").fill("123456");
  await page.getByRole("button", { name: "Verify Code" }).click();
  await page.getByLabel("New Password", { exact: true }).fill("NewStrongPass!2");
  await page.getByLabel("Confirm New Password", { exact: true }).fill("NewStrongPass!2");
  await page.getByRole("button", { name: "Set New Password" }).click();

  await expect(page).toHaveURL("/login?passwordReset=success");
  await expect(page.getByText("Password updated successfully. Please log in.")).toBeVisible();
});

test("testimonies route supports list, detail, moderation, and filter flows", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/testimonies");
  await expect(page.getByRole("heading", { name: "Testimonies", exact: true })).toBeVisible();
  await expect(page.getByText("Testimony").first()).toBeVisible();
  await expect(page.getByText("Emmanuel Oreoluwa").first()).toBeVisible();

  await page.goto("/testimonies?view=1");
  await expect(page.getByText("Miraculous Healing After Prayer").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Approve Testimony" })).toBeVisible();

  await page.goto("/testimonies?view=2");
  await expect(page.getByText("Engagement Analytics").first()).toBeVisible();
  await expect(page.getByText("Approved By").first()).toBeVisible();

  await page.goto("/testimonies?reject=1");
  await expect(page.getByRole("heading", { name: "Reject Testimony" })).toBeVisible();
  await expect(page.getByPlaceholder("Type here...").first()).toBeVisible();

  await page.goto("/testimonies?success=approve");
  await expect(page.getByText("Testimony Approved Successfully!").first()).toBeVisible();

  await page.goto("/testimonies?filter=1");
  await expect(page.getByText("Status").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply" })).toBeVisible();
});

test("testimonies route supports video list, details, edit, and upload states", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/testimonies?tab=video");
  await expect(page.getByText("Scheduled").first()).toBeVisible();
  await expect(page.getByText("Drafts").first()).toBeVisible();

  await page.goto("/testimonies?tab=video&screen=upload");
  await expect(page.getByRole("heading", { name: "Upload Video Testimonies" })).toBeVisible();
  await expect(page.getByText("Upload Status").first()).toBeVisible();

  await page.goto("/testimonies?tab=video&settings=1");
  await expect(page.getByRole("heading", { name: "Testimony Settings" })).toBeVisible();

  await page.goto("/testimonies?tab=video&screen=activity");
  await expect(page.getByRole("heading", { name: "Activity Log for Text Testimonies" })).toBeVisible();
  await expect(page.getByText("Export as CSV File").first()).toBeVisible();

  await page.goto("/testimonies?tab=video&view=1");
  await expect(page.getByRole("heading", { name: "Video Details" })).toBeVisible();
  await expect(page.getByText("Upload Date").first()).toBeVisible();

  await page.goto("/testimonies?tab=video&edit=2");
  await expect(page.getByRole("heading", { name: "Edit Video testimony" })).toBeVisible();
  await expect(page.getByText("Scheduled date").first()).toBeVisible();

  await page.goto("/testimonies?tab=video&success=upload");
  await expect(page.getByText("Video Uploaded Successfully!").first()).toBeVisible();
});

test("inspirational pictures route supports list, preview, delete, and upload states", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/inspirational-pictures");
  await expect(page.getByRole("main").getByRole("heading", { name: "Inspirational Pictures", level: 1 })).toBeVisible();
  await expect(page.getByText("Thumbnail").first()).toBeVisible();
  await expect(page.getByText("Status").first()).toBeVisible();

  await page.goto("/inspirational-pictures?menu=3");
  await expect(page.getByText("View").first()).toBeVisible();
  await expect(page.getByText("Edit").first()).toBeVisible();
  await expect(page.getByText("Delete").first()).toBeVisible();

  await page.goto("/inspirational-pictures?view=1");
  await expect(page.getByRole("heading", { name: "Picture Details" })).toBeVisible();
  await expect(page.getByText("Uploaded By").first()).toBeVisible();

  await page.goto("/inspirational-pictures?remove=1");
  await expect(page.getByRole("heading", { name: "Delete This Picture?" })).toBeVisible();

  await page.goto("/inspirational-pictures?screen=upload");
  await expect(page.getByRole("heading", { name: "Upload Picture" })).toBeVisible();
  await expect(page.getByText("Upload Status").first()).toBeVisible();

  await page.goto("/inspirational-pictures?success=upload");
  await expect(page.getByText("Uploaded Successfully!").first()).toBeVisible();
});

test("donations route supports list, filter, and action flows", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/donations");
  await expect(page.getByRole("main").getByRole("heading", { name: "Donations history", level: 1 })).toBeVisible();
  await expect(page.getByText("All Donations").first()).toBeVisible();
  await expect(page.getByText("KY23FN5325").first()).toBeVisible();
  await expect(page.getByPlaceholder("Search by Email, Transaction ID or Amount....")).toBeVisible();
  await expect(page.getByText("Export").first()).toBeVisible();

  await page.goto("/donations?filter=1");
  const donationsFilter = page.locator("form[action='/donations']").first();
  await expect(donationsFilter.getByRole("heading", { name: "Filter" })).toBeVisible();
  await expect(donationsFilter.getByText("Amount", { exact: true })).toBeVisible();
  await expect(donationsFilter.getByText("Currency", { exact: true })).toBeVisible();
  await expect(donationsFilter.getByText("Status", { exact: true })).toBeVisible();
  await expect(donationsFilter.getByText("Date Range", { exact: true })).toBeVisible();
  await expect(donationsFilter.getByRole("button", { name: "Apply" })).toBeVisible();

  await page.goto("/donations?menu=1");
  await expect(page.getByText("Reverse donation").first()).toBeVisible();

  await page.goto("/donations?refund=1");
  await expect(page.getByText("Refund Successful").first()).toBeVisible();

  await page.goto("/donations?reverse=2");
  await expect(page.getByRole("heading", { name: "Reverse Donation" })).toBeVisible();

  await page.goto("/donations?reason=2");
  await expect(page.getByRole("heading", { name: "Reverse Donation" })).toBeVisible();
  await expect(page.getByText("Reason for Reversal").first()).toBeVisible();

  await page.goto("/donations?remove=1");
  await expect(page.getByRole("heading", { name: "Delete Donation?" })).toBeVisible();

  await page.goto("/donations?success=refund");
  await expect(page.getByText("Refund Successful").first()).toBeVisible();
});

test("notifications history route supports list, filter, selection, and notification detail flow", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/notifications-history");
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  await expect(page.getByText("New Gift Received").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "New Text Testimony Submitted" })).toBeVisible();

  await page.goto("/notifications-history?filter=1");
  await expect(page.getByRole("heading", { name: "Filter" })).toBeVisible();
  await expect(page.getByText("Date Range").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply" })).toBeVisible();

  await page.goto("/notifications-history?panel=1");
  await expect(page.getByRole("link", { name: "View all notifications" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mark All as Read" }).first()).toBeVisible();

  await page.goto("/notifications-history?selected=1,2&deleteAll=1");
  await expect(page.getByRole("heading", { name: "Delete Notification" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Delete", exact: true }).last()).toBeVisible();

  await page.goto("/notifications-history?success=delete");
  await expect(page.getByText("Notifications deleted successfully!").first()).toBeVisible();

  await page.goto("/testimonies?view=1&origin=notification");
  await expect(page.getByText("Opened from notifications history.").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to notifications" })).toHaveAttribute("href", "/notifications-history");
});

test("reviews route supports list, filter, menu, detail, and delete flows", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/reviews");
  await expect(page.getByRole("heading", { name: "Reviews" })).toBeVisible();
  await expect(page.getByText("RE-001", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("John Stone", { exact: true }).first()).toBeVisible();

  await page.goto("/reviews?menu=1");
  await expect(page.getByRole("link", { name: "View details", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Delete", exact: true }).first()).toBeVisible();

  await page.goto("/reviews?filter=1");
  const reviewsFilter = page.locator("form[action='/reviews']").first();
  await expect(reviewsFilter.getByRole("heading", { name: "Filter" })).toBeVisible();
  await expect(reviewsFilter.getByText("Rating", { exact: true })).toBeVisible();
  await expect(reviewsFilter.getByText("Date Range", { exact: true })).toBeVisible();

  await page.goto("/reviews?view=1");
  await expect(page.getByRole("heading", { name: "Review", exact: true })).toBeVisible();
  await expect(page.locator("dt").filter({ hasText: "Email Address" }).first()).toBeVisible();

  await page.goto("/reviews?remove=1");
  await expect(page.getByRole("heading", { name: "Delete review?" })).toBeVisible();

  await page.goto("/reviews?selected=1,2,3&deleteAll=1");
  await expect(page.getByRole("heading", { name: "Delete all reviews?" })).toBeVisible();
});

test("analytics route supports testimonies, users, and donations states", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/analytics");
  await expect(page.getByRole("heading", { name: "Testimony Analytics" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Performance Trends" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Engagement by Category" })).toBeVisible();

  await page.goto("/analytics?mode=video");
  await expect(page.getByRole("heading", { name: "Video Distribution by Category" })).toBeVisible();

  await page.goto("/analytics?area=users");
  await expect(page.getByRole("heading", { name: "User Analytics" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "User Growth Overview" })).toBeVisible();

  await page.goto("/analytics?area=donations");
  await expect(page.getByRole("heading", { name: "Donation Analytics" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Donation Channels" })).toBeVisible();
});

test("my profile and notification settings routes support key settings flows", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/my-profile");
  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Personal Information" })).toBeVisible();

  await page.goto("/my-profile?screen=contact");
  await expect(page.getByRole("textbox", { name: "New Email Address" })).toBeVisible();

  await page.goto("/my-profile?screen=otp");
  await expect(page.getByText("OTP").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Verify" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Resend OTP" })).toBeVisible();

  await page.goto("/my-profile?password=1");
  await expect(page.getByRole("heading", { name: "Change Password" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Current Password" })).toBeVisible();

  await page.goto("/notification-settings");
  await expect(page.getByRole("heading", { name: "Notification settings" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Allow Email Notifications" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "New Donation Received" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Save Changes" })).toBeVisible();

  await page.goto("/notification-settings?success=1");
  await expect(page.getByText("Notification settings saved successfully.").first()).toBeVisible();
});

test("admin management route supports list and role-management flows", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/admin");
  await expect(page.getByText("All Admin Users").first()).toBeVisible();
  await expect(page.getByText("Elvis Igiebor").first()).toBeVisible();
  await expect(page.getByText("Content Admin").first()).toBeVisible();
  await expect(page.getByText("Invite New User").first()).toBeVisible();

  await page.goto("/admin?menu=1");
  await expect(page.getByText("Change Member Roles").first()).toBeVisible();
  await expect(page.getByText("Rename Role").first()).toBeVisible();

  await page.goto("/admin?createRole=1");
  await expect(page.getByRole("heading", { name: "Create Role" })).toBeVisible();
  await expect(page.getByText("Select Role").first()).toBeVisible();

  await page.goto("/admin?invite=1");
  await expect(page.getByRole("heading", { name: "Invite New User" })).toBeVisible();
  await expect(page.getByText("Invite a new Super Admin").first()).toBeVisible();

  await page.goto("/admin?manageRole=2");
  await expect(page.getByText("Change Member Roles").first()).toBeVisible();
  await expect(page.getByText("Content Admin").first()).toBeVisible();

  await page.goto("/admin?permission=1");
  await expect(page.getByText("Permission Page").first()).toBeVisible();

  await page.goto("/admin?managePermissions=1");
  await expect(page.getByText("Manage Permissions").first()).toBeVisible();
  await expect(page.getByText("Overview").first()).toBeVisible();

  await page.goto("/admin?assignRole=3");
  await expect(page.getByRole("heading", { name: "Select Role" })).toBeVisible();
  await expect(page.getByText("Admin Users").first()).toBeVisible();

  await page.goto("/admin?remove=1");
  await expect(page.getByRole("heading", { name: "Delete Admin User?" })).toBeVisible();

  await page.goto("/admin?success=1");
  await expect(page.getByText("Role Created Successfully!").first()).toBeVisible();

  await page.goto("/admin?success=1&successType=admin-assigned");
  await expect(page.getByText("Admin User Assigned Successfully!").first()).toBeVisible();
});

test("signup page shows invite-only messaging", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Admin Access Is Invite Only" })).toBeVisible();
  await expect(page.getByText("Self-service admin signup has been retired.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Log In" })).toBeVisible();
});

test("create-password page shows deprecation messaging", async ({ page }) => {
  await page.goto("/create-password");
  await expect(page.getByRole("heading", { name: "Invitation Setup Coming Next" })).toBeVisible();
  await expect(page.getByText("This page is no longer used for entry-code setup.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Log In" })).toBeVisible();
});
