/* web/src/lib/messages.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * Messages that arrive in a URL travel as fixed codes, never as free text, so
 * a crafted link can't put words in this site's mouth.
 */

/** Success notes, from `?m=` or an API answer's `message`. */
export const MESSAGES: Record<string, string> = {
  "signed-out": "You're signed out.",
  "account-deleted": "Your account has been deleted.",
  "setup-done": "Your admin account is ready. Add a passkey or password below so you can sign in again.",
  "link-welcome": "You're signed in. Add a passkey (or a password) now so you can sign in next time.",
  "welcome-verify": "Welcome! We've emailed you a link to verify your address. Add a passkey below while you wait.",
  "verify-sent": "Verification email sent. Check your inbox (and spam).",
  "verify-failed": "We couldn't send a verification email right now. Try again later.",
  "email-verified": "Email verified.",
  "profile-saved": "Profile saved.",
  "passkey-added": "Passkey added.",
  "passkey-renamed": "Passkey renamed.",
  "passkey-removed": "Passkey removed.",
  "password-set": "Password saved. Your other sessions were signed out.",
  "password-reset": "Password changed, and every device was signed out. Sign in with your new password.",
  "password-removed": "Password removed. Sign in with a passkey from now on.",
  "totp-enabled": "Two-factor codes are on for password sign-ins.",
  "totp-disabled": "Two-factor codes are off.",
  "session-revoked": "Session signed out.",
  "sessions-revoked": "All other sessions are signed out.",
  "user-created": "User created.",
  "user-saved": "User saved.",
  "user-deleted": "User deleted.",
  "groups-saved": "Groups saved.",
  "group-created": "Group created.",
  "group-saved": "Group saved.",
  "group-deleted": "Group deleted.",
  "client-saved": "Application saved.",
  "client-deleted": "Application deleted.",
  "client-public": "Secret removed. The application is now a public (PKCE) client.",
  "keys-rotated": "Signing key rotated. The old key stays published for two days.",
  "credential-removed": "Sign-in method removed.",
  "user-disabled": "Account disabled and signed out everywhere.",
  "user-enabled": "Account enabled.",
  "user-signed-out": "Signed out of every session and application.",
  "link-revoked": "Sign-in link revoked.",
  "name-reserved": "Name reserved.",
  "name-released": "Name released.",
};

/** Problems the Worker can't send back to an app, from /error?code=. */
export const ERRORS: Record<string, { title: string; text: string }> = {
  incomplete_request: {
    title: "Incomplete sign-in request",
    text: "The app didn't say who it is or where to send you back to.",
  },
  unknown_client: {
    title: "Unknown application",
    text: "The app that sent you here isn't registered with this server.",
  },
  unregistered_redirect: {
    title: "Unregistered redirect",
    text: "The app asked to send you somewhere it isn't allowed to.",
  },
  logout_unverified: {
    title: "Sign-out failed",
    text: "The app sent a sign-out request this server couldn't verify.",
  },
  logout_mismatch: {
    title: "Sign-out failed",
    text: "The sign-out request doesn't match the app that sent it.",
  },
  logout_bad_redirect: {
    title: "Sign-out failed",
    text: "The app asked to send you somewhere it isn't allowed to after signing out.",
  },
};
