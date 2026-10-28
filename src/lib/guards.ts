/* src/lib/guards.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { createMiddleware } from "hono/factory";
import { now, type AppContext, type AppEnv } from "../env";
import { timingSafeEqualStr } from "./crypto";
import { fail } from "./http";

// The page reacts to these flags: `signin` and `reauth` send it to /login,
// `stale` asks for a reload to pick up a fresh CSRF token.

export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  if (!c.get("user")) return fail(c, "Your session ended. Sign in again.", 401, { signin: true });
  await next();
});

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  if (!c.get("user")?.isAdmin) return fail(c, "Your account isn't in the admin group for this server.", 403);
  await next();
});

/** How long after signing in a session may change how the account signs in. */
export const RECENT_AUTH = 15 * 60;

export function isRecentAuth(authTime: number): boolean {
  return now() - authTime <= RECENT_AUTH;
}

/**
 * Changes that could lock the owner out (password, passkeys, two-factor,
 * email, deletion) need a recent sign-in, so a stolen session cookie alone
 * can't take the account over. Older sessions are sent to confirm it's them.
 */
export const requireRecentAuth = createMiddleware<AppEnv>(async (c, next) => {
  const session = c.get("session");
  if (!session || !isRecentAuth(session.authTime)) {
    return fail(c, "For your security, confirm it's you first.", 401, { reauth: true });
  }
  await next();
});

/** True when the request carries this session's CSRF token in `x-csrf-token`. */
export function csrfOk(c: AppContext): boolean {
  const session = c.get("session");
  const sent = c.req.header("x-csrf-token");
  return Boolean(session && sent && timingSafeEqualStr(sent, session.csrf));
}

export function staleCsrf(c: AppContext) {
  return fail(c, "This page is out of date. Reload and try again.", 403, { stale: true });
}

/** Every state-changing request from a signed-in page carries the session's CSRF token. */
export const requireCsrf = createMiddleware<AppEnv>(async (c, next) => {
  if (c.req.method !== "GET" && c.req.method !== "HEAD" && !csrfOk(c)) return staleCsrf(c);
  await next();
});
