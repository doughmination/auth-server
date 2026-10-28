/* src/api/emailed.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * The links we email: verify an address, "wasn't me" sign-outs, and password
 * resets. They work without signing in. Mail scanners follow GETs, so a GET
 * only looks a link up; using it always takes a POST from the page.
 */

import { Hono } from "hono";
import type { AppEnv } from "../env";
import { audit } from "../lib/audit";
import { body, clientIp, fail, str } from "../lib/http";
import { hashPassword, passwordProblem } from "../lib/password";
import { attempt } from "../lib/ratelimit";
import { notify, peekSignoutLink, signOutDevice, signOutEverywhere } from "../data/notices";
import { consumePasswordReset, peekPasswordReset, resetCandidates, sendPasswordReset } from "../data/resets";
import { endSession } from "../data/sessions";
import { consumeEmailVerification, peekEmailVerification } from "../data/verifications";

export const emailed = new Hono<AppEnv>();

const TOO_MANY = "Too many attempts. Wait a few minutes and try again.";

// --- email verification ------------------------------------------------------------

emailed.get("/api/verify-email/:token", async (c) => {
  const email = await peekEmailVerification(c.env, c.req.param("token"));
  if (!email) return fail(c, "This link has expired, was already used, or a newer one was sent.", 410);
  return c.json({ email });
});

emailed.post("/api/verify-email/:token", async (c) => {
  if (!(await attempt(c.env, `verify-ip:${clientIp(c)}`, 30, 15 * 60))) return fail(c, TOO_MANY, 429);
  const userId = await consumeEmailVerification(c.env, c.req.param("token"));
  if (!userId) return fail(c, "This link has expired, was already used, or a newer one was sent.", 410);

  await audit(c, "account.email_verified", { actor: userId, target: userId });
  return c.json({ signedIn: c.get("user")?.id === userId });
});

// --- "wasn't me" sign-out links ------------------------------------------------------

const SIGNOUT_EXPIRED =
  "This link has expired. Sign in to see and sign out your sessions. If you can't sign in, ask an admin to sign you out everywhere.";

emailed.get("/api/security/:token", async (c) => {
  const target = await peekSignoutLink(c.env, c.req.param("token"));
  if (!target) return fail(c, SIGNOUT_EXPIRED, 410);
  return c.json({ username: target.username, sessionLive: Boolean(target.session_live) });
});

emailed.post("/api/security/:token", async (c) => {
  if (!(await attempt(c.env, `signout-ip:${clientIp(c)}`, 30, 15 * 60))) return fail(c, TOO_MANY, 429);
  const target = await peekSignoutLink(c.env, c.req.param("token"));
  if (!target) return fail(c, SIGNOUT_EXPIRED, 410);

  const everywhere = str((await body(c)).scope) === "all";
  if (everywhere) {
    await signOutEverywhere(c.env, target.user_id);
  } else if (target.session_hash) {
    await signOutDevice(c.env, target.user_id, target.session_hash);
  }
  await audit(c, everywhere ? "security.signed_out_everywhere" : "security.signed_out_device", {
    actor: null,
    target: target.user_id,
  });
  return c.json({ everywhere });
});

// --- forgot password ---------------------------------------------------------------

emailed.post("/api/forgot", async (c) => {
  if (!(await attempt(c.env, `forgot-ip:${clientIp(c)}`, 10, 60 * 60))) {
    return fail(c, "Too many requests from here. Try again later.", 429);
  }
  const input = str((await body(c)).account).slice(0, 254);

  // Looked up and sent in the background, so the response is the same, and
  // takes the same time, whether or not the account exists.
  const task = (async () => {
    for (const user of await resetCandidates(c.env, input)) {
      await sendPasswordReset(c.env, user);
      await audit(c, "account.reset_requested", { actor: null, target: user.id });
    }
  })().catch((err) => console.error("[reset] couldn't send", err));
  try {
    c.executionCtx.waitUntil(task);
  } catch {
    // No execution context (local tools): the promise still runs.
  }
  return c.json({ sent: true });
});

const RESET_EXPIRED = "This link has expired, was already used, or a newer one was sent.";

emailed.get("/api/reset/:token", async (c) => {
  const target = await peekPasswordReset(c.env, c.req.param("token"));
  if (!target) return fail(c, RESET_EXPIRED, 410);
  return c.json({ username: target.username });
});

emailed.post("/api/reset/:token", async (c) => {
  if (!(await attempt(c.env, `reset-ip:${clientIp(c)}`, 30, 15 * 60))) return fail(c, TOO_MANY, 429);
  const token = c.req.param("token");
  const target = await peekPasswordReset(c.env, token);
  if (!target) return fail(c, RESET_EXPIRED, 410);

  const b = await body(c);
  const password = str(b.password);
  const problem =
    passwordProblem(password, target.username) ?? (password !== str(b.confirm) ? "The two passwords don't match." : null);
  if (problem) return fail(c, problem);

  const userId = await consumePasswordReset(c.env, token, await hashPassword(password));
  if (!userId) return fail(c, RESET_EXPIRED, 410);

  // This browser may be signed in as someone else; start clean either way.
  await endSession(c);
  await audit(c, "account.password_reset", { actor: userId, target: userId });
  notify(c, userId, {
    subject: "Your password was reset",
    summary: "Your password was reset with a link sent to this address, and every browser and app was signed out.",
    by: "self",
    sessionHash: null,
  });
  return c.json({ redirect: "/login?m=password-reset" });
});
