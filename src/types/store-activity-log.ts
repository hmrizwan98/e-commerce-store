export type StoreActivityAction =
  | "created"
  | "updated"
  | "suspended"
  | "activated"
  | "archived"
  | "restored"
  | "ownership_changed"
  | "theme_changed"
  | "password_reset"
  | "welcome_email_resent"
  | "cloned"
  | "impersonated"
  | "domain_removed"
  | "domain_reverified"
  | "primary_domain_changed"
  | "deployment_status_changed"
  | "deleted";

export interface StoreActivityLog {
  id: string;
  storeId: string;
  action: StoreActivityAction;
  actorUid: string;
  meta?: Record<string, string>;
  createdAt?: number;
}
