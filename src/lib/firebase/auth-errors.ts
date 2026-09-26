/**
 * Maps Firebase Auth error codes to clear, professional, user-facing messages.
 * Never surface a raw FirebaseError.message (e.g. "Firebase: Error
 * (auth/invalid-credential).") to an end user - the code/message text is
 * only useful in logs. Client components should log the real error
 * themselves (console.error) and display only this mapped string.
 */
export function mapFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "The email or password is incorrect.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "We couldn't reach the server. Please check your connection and try again.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid":
    case "auth/app-not-authorized":
    case "auth/project-not-found":
    case "auth/configuration-not-found":
      return "This site's login configuration is invalid. Please contact support.";
    case "auth/invalid-action-code":
    case "auth/expired-action-code":
      return "This password reset link is invalid or has expired.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    case "auth/requires-recent-login":
      return "For security, please sign in again before changing your password.";
    default:
      return "Something went wrong. Please try again.";
  }
}
