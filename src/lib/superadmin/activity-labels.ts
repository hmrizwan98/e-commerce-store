/** Human-readable labels for StoreActivityAction values, shared by
 * StoreDetailsTabs.tsx's "Recent activity" list and DeploymentPanel.tsx's
 * "Deployment history" list - kept in one place to avoid a circular import
 * between the two client components and to avoid duplicating the map. */
export const ACTIVITY_LABELS: Record<string, string> = {
  created: "Store created",
  updated: "Store details updated",
  suspended: "Store suspended",
  activated: "Store activated",
  archived: "Store archived",
  restored: "Store restored",
  ownership_changed: "Ownership changed",
  theme_changed: "Theme changed",
  password_reset: "Admin password reset",
  welcome_email_resent: "Welcome email resent",
  cloned: "Cloned from another store",
  impersonated: "Super Admin logged in as store owner",
  domain_removed: "Domain removed",
  domain_reverified: "Domain re-verification requested",
  primary_domain_changed: "Primary domain changed",
  deployment_status_changed: "Deployment requested",
};
