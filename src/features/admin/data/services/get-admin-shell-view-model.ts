import type { AdminNavItem, AdminShellViewModel } from "@/features/admin/domain/entities/shell";

const primaryItems: AdminNavItem[] = [
  { label: "Overview", href: "/overview", icon: "grid" },
  { label: "Home page Management", href: "/home-management", icon: "home" },
  { label: "Home Promos", href: "/home-promos", icon: "home" },
  { label: "Scripture of the day", href: "/scripture-of-the-day", hasCaret: true, icon: "book" },
  { label: "Users", href: "/users", icon: "users" },
  { label: "Testimonies", href: "/testimonies", hasCaret: true, icon: "chat" },
  { label: "Inspirational Pictures", href: "/inspirational-pictures", hasCaret: true, icon: "image" },
  { label: "Donations", href: "/donations", icon: "money" },
  { label: "Subscriptions", href: "/subscriptions", icon: "money" },
  { label: "Live Broadcasts", href: "/live-broadcasts", icon: "broadcast" },
  { label: "Referral Payouts", href: "/referral-payouts", icon: "money" },
  { label: "Creators & Ministries", href: "/creators-ministries", icon: "users" },
  { label: "AI Jobs", href: "/ai-jobs", icon: "settings" },
  { label: "Media exports", href: "/media-exports", icon: "image" },
  { label: "Notifications history", href: "/notifications-history", icon: "bell" },
  { label: "Reviews", href: "/reviews", icon: "star" },
  { label: "Analytics", href: "/analytics", hasCaret: true, icon: "chart" },
];

const settingsItems: AdminNavItem[] = [
  { label: "My profile", href: "/my-profile", icon: "profile" },
  { label: "Notification settings", href: "/notification-settings", icon: "bell" },
  { label: "App version", href: "/app-version", icon: "settings" },
  { label: "Follow links", href: "/social-links", icon: "settings" },
  { label: "About & policies", href: "/profile-content", icon: "settings" },
  { label: "Help FAQ", href: "/help-faqs", icon: "settings" },
  { label: "Admin Management", href: "/admin", icon: "settings" },
];

export function getAdminShellViewModel(input: {
  activeHref: string;
  activeChildHref?: string;
  fullName?: string;
}): AdminShellViewModel {
  return {
    fullName: input.fullName ?? "Elvis Igiebor",
    sidebarItems: primaryItems.map((item) => {
      if (item.href === "/scripture-of-the-day") {
        return {
          ...item,
          active: item.href === input.activeHref,
          expanded: item.href === input.activeHref,
          children: [
            {
              label: "All Scriptures",
              href: "/scripture-of-the-day",
              active: (input.activeChildHref ?? "/scripture-of-the-day") === "/scripture-of-the-day",
            },
            {
              label: "Schedule Scriptures",
              href: "/scripture-of-the-day?edit=new",
              active: input.activeChildHref === "/scripture-of-the-day?edit=new",
            },
          ],
        };
      }

      if (item.href === "/testimonies") {
        return {
          ...item,
          active: item.href === input.activeHref,
          expanded: item.href === input.activeHref,
          children: [
            {
              label: "All Testimonies",
              href: "/testimonies",
              active: (input.activeChildHref ?? "/testimonies") === "/testimonies",
            },
            {
              label: "Upload Testimonies",
              href: "/testimonies?tab=video&screen=upload",
              active: input.activeChildHref === "/testimonies?tab=video&screen=upload",
            },
          ],
        };
      }

      if (item.href === "/inspirational-pictures") {
        return {
          ...item,
          active: item.href === input.activeHref,
          expanded: item.href === input.activeHref,
          children: [
            {
              label: "All Pictures",
              href: "/inspirational-pictures",
              active: (input.activeChildHref ?? "/inspirational-pictures") === "/inspirational-pictures",
            },
            {
              label: "Upload Pictures",
              href: "/inspirational-pictures?screen=upload",
              active: input.activeChildHref === "/inspirational-pictures?screen=upload",
            },
          ],
        };
      }

      if (item.href === "/analytics") {
        return {
          ...item,
          active: item.href === input.activeHref,
          expanded: item.href === input.activeHref,
          children: [
            {
              label: "Users",
              href: "/analytics?area=users",
              active: input.activeChildHref === "/analytics?area=users",
            },
            {
              label: "Testimonies",
              href: "/analytics",
              active: (input.activeChildHref ?? "/analytics") === "/analytics",
            },
            {
              label: "Donations",
              href: "/analytics?area=donations",
              active: input.activeChildHref === "/analytics?area=donations",
            },
          ],
        };
      }

      return {
        ...item,
        active: item.href === input.activeHref,
      };
    }),
    settingsItems,
  };
}
