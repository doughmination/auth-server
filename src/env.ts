/* src/env.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Context } from "hono";

export interface Env {
  DB: D1Database;
  /** The built Svelte app (dist/). */
  ASSETS: Fetcher;
  ISSUER: string;
  SITE_NAME: string;
  KEY_ENCRYPTION_KEY: string;
  SETUP_TOKEN?: string;
  REGISTRATION?: string;
  RESEND_API_KEY?: string;
  MAIL_FROM: string;
  /** Shown on /privacy and /terms for data and account requests. */
  CONTACT_EMAIL?: string;
}

export interface SessionInfo {
  idHash: string;
  userId: string;
  csrf: string;
  authTime: number;
  amr: string[];
}

export interface CurrentUser {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  picture: string | null;
  groups: string[];
  isAdmin: boolean;
}

export type AppEnv = {
  Bindings: Env;
  Variables: {
    session: SessionInfo | null;
    user: CurrentUser | null;
  };
};

export type AppContext = Context<AppEnv>;

/** Members of this group can use /admin. */
export const ADMIN_GROUP = "auth-admin";

export const TTL = {
  /** Signed-in sessions end this long after signing in; there is no re-auth prompt. */
  session: 60 * 60 * 24,
  pendingLogin: 60 * 10,
  challenge: 60 * 5,
  authCode: 60,
  accessToken: 60 * 60,
  idToken: 60 * 60,
  refreshToken: 60 * 60 * 24 * 30,
  /** Email verification links. */
  emailVerification: 60 * 60 * 24,
  /** "Forgot password" links. */
  passwordReset: 60 * 60,
  /** A used refresh token is honoured again for this long (racing app instances). */
  refreshReuseGrace: 60,
  /** A browser that hasn't signed in for this long counts as new again. */
  knownDevice: 60 * 60 * 24 * 365,
  /** Sign-out links in security emails. */
  signoutLink: 60 * 60 * 24 * 7,
  /** Retired signing keys stay in the JWKS this long so issued tokens verify. */
  retiredKey: 60 * 60 * 24 * 2,
} as const;

export function issuer(env: Env): string {
  return env.ISSUER.replace(/\/+$/, "");
}

export function issuerOrigin(env: Env): string {
  return new URL(issuer(env)).origin;
}

/** WebAuthn relying party id: the issuer's hostname. */
export function rpId(env: Env): string {
  return new URL(issuer(env)).hostname;
}

export function isSecure(env: Env): boolean {
  return new URL(issuer(env)).protocol === "https:";
}

export function siteName(env: Env): string {
  return env.SITE_NAME || "Sign in";
}

export function now(): number {
  return Math.floor(Date.now() / 1000);
}
