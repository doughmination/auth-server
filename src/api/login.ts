/* src/api/login.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { Hono } from "hono";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import type { AppContext, AppEnv } from "../env";
import { audit } from "../lib/audit";
import { decrypt } from "../lib/crypto";
import { csrfOk, staleCsrf } from "../lib/guards";
import { body, clientIp, fail, readJson, safeReturn, str } from "../lib/http";
import { burnPasswordCheck, hashPassword, needsRehash, verifyPassword } from "../lib/password";
import { attempt, clearAttempts } from "../lib/ratelimit";
import { verifyTotp } from "../lib/totp";
import { normaliseUsername } from "../lib/validate";
import { authenticationOptions, countPasskeys, finishAuthentication } from "../data/passkeys";
import { consumeLoginLink, peekLoginLink } from "../data/links";
import {
  endSession,
  finishPendingLogin,
  peekPendingLogin,
  type PendingLogin,
  spendPendingAttempt,
  startPendingLogin,
  startSession,
} from "../data/sessions";
import { claimTotpStep, getUser, getUserByUsername, setPasswordHash, type UserRow } from "../data/users";

const WINDOW = 15 * 60;
const USER_LIMIT = 10;
const IP_LIMIT = 50;
const TOTP_ATTEMPTS = 5;
/** Code guesses per account per window, across every pending login. */
export const TOTP_USER_LIMIT = 10;
const GENERIC_FAILURE = "That username and password don't match.";
const TOO_MANY = "Too many sign-in attempts. Wait a few minutes and try again.";
const EXPIRED = "This sign-in expired. Start over.";

export const login = new Hono<AppEnv>();

login.post("/api/login/password", async (c) => {
  const b = await body(c);
  const returnTo = safeReturn(b.return);
  const username = normaliseUsername(str(b.username)).slice(0, 64);
  const password = str(b.password).slice(0, 512);

  const ipOk = await attempt(c.env, `login-ip:${clientIp(c)}`, IP_LIMIT, WINDOW);
  const userOk = await attempt(c.env, `login-user:${username}`, USER_LIMIT, WINDOW);
  if (!ipOk || !userOk) {
    await audit(c, "login.rate_limited", { actor: null, target: username });
    return fail(c, TOO_MANY, 429);
  }

  const user = username ? await getUserByUsername(c.env, username) : null;
  if (!user || !user.password_hash || user.disabled) {
    await burnPasswordCheck(password);
    await audit(c, "login.failed", { actor: null, target: username, detail: "password" });
    return fail(c, GENERIC_FAILURE, 401);
  }

  if (!(await verifyPassword(password, user.password_hash))) {
    await audit(c, "login.failed", { actor: user.id, target: user.username, detail: "password" });
    return fail(c, GENERIC_FAILURE, 401);
  }

  await clearAttempts(c.env, `login-user:${username}`);
  if (needsRehash(user.password_hash)) {
    await setPasswordHash(c.env, user.id, await hashPassword(password));
  }

  // Accounts with a passkey or two-factor codes need one of them as well.
  const step = await secondStepFor(c, user);
  if (step) {
    await startPendingLogin(c, user.id, returnTo);
    return c.json({ mfa: step });
  }

  await startSession(c, user.id, ["pwd"]);
  await audit(c, "login.password", { actor: user.id, target: user.username });
  return c.json({ redirect: returnTo });
});

interface SecondStep {
  totp: boolean;
  passkey: boolean;
}

/** What a password sign-in still needs: a code, a passkey, or (neither set up) nothing. */
async function secondStepFor(c: AppContext, user: UserRow): Promise<SecondStep | null> {
  const step = { totp: Boolean(user.totp_secret), passkey: (await countPasskeys(c.env, user.id)) > 0 };
  return step.totp || step.passkey ? step : null;
}

/** The account half-way through a password sign-in, if it can still finish. */
async function pendingUser(c: AppContext): Promise<{ pending: PendingLogin; user: UserRow; step: SecondStep } | null> {
  const pending = await peekPendingLogin(c);
  if (!pending) return null;
  const user = await getUser(c.env, pending.user_id);
  const step = user && !user.disabled ? await secondStepFor(c, user) : null;
  if (!user || !step) {
    await finishPendingLogin(c, pending.id_hash);
    return null;
  }
  return { pending, user, step };
}

/** What the second-step page should offer. */
login.get("/api/login/mfa", async (c) => {
  const found = await pendingUser(c);
  if (!found) return fail(c, EXPIRED, 401, { restart: true });
  return c.json(found.step);
});

login.post("/api/login/mfa", async (c) => {
  const b = await body(c);
  const pending = await spendPendingAttempt(c, TOTP_ATTEMPTS);
  if (!pending) return fail(c, EXPIRED, 401, { restart: true });

  const user = await getUser(c.env, pending.user_id);
  const step = user && !user.disabled ? await secondStepFor(c, user) : null;
  if (!user || !step || !user.totp_secret) {
    await finishPendingLogin(c, pending.id_hash);
    return fail(c, EXPIRED, 401, { restart: true });
  }

  // Per account, not per pending login: a correct password starts a fresh
  // pending login (and clears login-user), so without this anyone holding the
  // password could keep guessing codes five at a time.
  if (!(await attempt(c.env, `totp-user:${user.id}`, TOTP_USER_LIMIT, WINDOW))) {
    await audit(c, "login.rate_limited", { actor: user.id, target: user.username, detail: "totp" });
    return fail(c, "Too many codes tried. Wait a few minutes and try again.", 429);
  }

  const secret = await decrypt(c.env.KEY_ENCRYPTION_KEY, user.totp_secret);
  const totpStep = await verifyTotp(secret, str(b.code), user.totp_last_step);
  if (totpStep === null || !(await claimTotpStep(c.env, user.id, totpStep))) {
    await audit(c, "login.failed", { actor: user.id, target: user.username, detail: "totp" });
    const left = TOTP_ATTEMPTS - pending.attempts;
    if (left <= 0) {
      await finishPendingLogin(c, pending.id_hash);
      return fail(c, "That code didn't work, and that was the last try. Start over.", 401, { restart: true });
    }
    return fail(c, `That code didn't work. ${left} ${left === 1 ? "try" : "tries"} left.`, 401);
  }

  await finishPendingLogin(c, pending.id_hash);
  await startSession(c, user.id, ["pwd", "otp", "mfa"]);
  await audit(c, "login.password_totp", { actor: user.id, target: user.username });
  return c.json({ redirect: safeReturn(pending.return_to) });
});

login.post("/api/login/mfa/passkey/options", async (c) => {
  if (!(await attempt(c.env, `passkey-ip:${clientIp(c)}`, 120, WINDOW))) return fail(c, TOO_MANY, 429);
  const found = await pendingUser(c);
  if (!found?.step.passkey) return fail(c, EXPIRED, 401, { restart: true });
  return c.json(await authenticationOptions(c.env, found.user.id));
});

login.post("/api/login/mfa/passkey/verify", async (c) => {
  const b = await readJson<{ id?: string; response?: AuthenticationResponseJSON }>(c);
  if (!b?.id || !b.response) return fail(c, "Malformed request.");
  const found = await pendingUser(c);
  if (!found) return fail(c, EXPIRED, 401, { restart: true });
  const { pending, user } = found;

  const result = await finishAuthentication(c.env, b.id, b.response, user.id);
  if (!result.ok) {
    await audit(c, "login.failed", { actor: user.id, target: user.username, detail: "passkey (second step)" });
    return fail(c, result.error, 401);
  }

  await finishPendingLogin(c, pending.id_hash);
  await startSession(c, user.id, ["pwd", ...result.amr]);
  await audit(c, "login.password_passkey", { actor: user.id, target: user.username });
  return c.json({ redirect: safeReturn(pending.return_to) });
});

login.post("/api/login/passkey/options", async (c) => {
  if (!(await attempt(c.env, `passkey-ip:${clientIp(c)}`, 120, WINDOW))) return fail(c, TOO_MANY, 429);
  return c.json(await authenticationOptions(c.env));
});

login.post("/api/login/passkey/verify", async (c) => {
  const b = await readJson<{ id?: string; response?: AuthenticationResponseJSON; return?: string }>(c);
  if (!b?.id || !b.response) return fail(c, "Malformed request.");

  const result = await finishAuthentication(c.env, b.id, b.response);
  if (!result.ok) {
    await audit(c, "login.failed", { actor: null, detail: "passkey" });
    return fail(c, result.error, 401);
  }

  const user = await getUser(c.env, result.userId);
  if (!user || user.disabled) return fail(c, "This account is disabled.", 403);

  await startSession(c, user.id, result.amr);
  await audit(c, "login.passkey", { actor: user.id, target: user.username });
  return c.json({ redirect: safeReturn(b.return) });
});

// One-time links from an admin. Link scanners follow GETs, so looking one up
// never uses it; the page posts to use it.
login.get("/api/login/link/:token", async (c) => {
  const target = await peekLoginLink(c.env, c.req.param("token"));
  if (!target) return fail(c, "This link has expired, was already used, or was replaced by a newer one.", 410);
  return c.json({ userId: target.user_id, username: target.username, name: target.name });
});

login.post("/api/login/link/:token", async (c) => {
  if (!(await attempt(c.env, `link-ip:${clientIp(c)}`, 30, WINDOW))) {
    return fail(c, "Too many attempts. Wait a few minutes and try again.", 429);
  }
  const userId = await consumeLoginLink(c.env, c.req.param("token"));
  if (!userId) return fail(c, "This link has expired, was already used, or was replaced by a newer one.", 410);

  await startSession(c, userId, ["link"]);
  await audit(c, "login.link", { actor: userId, target: userId });
  return c.json({ redirect: "/settings?m=link-welcome" });
});

login.post("/api/logout", async (c) => {
  // Already signed out (expired, or another tab) is fine: there's nothing to protect.
  if (c.get("session")) {
    if (!csrfOk(c)) return staleCsrf(c);
    await audit(c, "logout");
    await endSession(c);
  }
  return c.json({ redirect: "/login?m=signed-out" });
});
