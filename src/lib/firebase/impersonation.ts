/** Short-lived cookie stashing the Super Admin's own session cookie value while they're
 * impersonating a store owner, so "Return to Super Admin" can restore it without
 * re-authenticating. Shared constant so the start route, return route, and the admin
 * layout's impersonation-banner check all agree on the same cookie name. */
export const RETURN_SESSION_COOKIE = "superadmin_return_session";
