export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
  badge?: string;
  hasCaret?: boolean;
  expanded?: boolean;
  children?: Array<{
    label: string;
    href: string;
    active?: boolean;
  }>;
};

export type AdminShellViewModel = {
  fullName: string;
  sidebarItems: AdminNavItem[];
  settingsItems: AdminNavItem[];
};
