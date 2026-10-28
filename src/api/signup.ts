/* src/api/signup.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * Creating accounts without an admin: open registration, and /setup for the
 * very first (admin) account.
 */

import { Hono } from "hono";
import type { AppEnv } from "../env";
import { audit } from "../lib/audit";
import { timingSafeEqualStr } from "../lib/crypto";
import { body, clientIp, fail, safeReturn, str } from "../lib/http";
import { PASSWORD_MAX, hashPassword, passwordProblem } from "../lib/password";
import { attempt } from "../lib/ratelimit";
import { cleanText, emailProblem, normaliseUsername, usernameProblem } from "../lib/validate";
import { isReserved, lookalikeOf } from "../data/reserved";
import { startSession } from "../data/sessions";
import { countUsers, createFirstAdmin, createUser } from "../data/users";
import { sendVerificationEmail } from "../data/verifications";

// Reserved, taken and look-alike names get the same answer, so the form
// can't be used to find out which names are reserved.
const UNAVAILABLE = "That username isn't available.";

export const signup = new Hono<AppEnv>();

signup.post("/api/register", async (c) => {
  if (c.env.REGISTRATION !== "open") return fail(c, "Sign-ups are closed. Accounts on this server are created by an admin.", 403);
  if (c.get("user")) return c.json({ redirect: "/apps" });
  if ((await countUsers(c.env)) === 0) return c.json({ redirect: "/setup" });

  if (!(await attempt(c.env, `register-ip:${clientIp(c)}`, 10, 60 * 60))) {
    await audit(c, "register.rate_limited", { actor: null });
    return fail(c, "Too many sign-ups from here. Try again later.", 429);
  }

  const b = await body(c);
  const returnTo = safeReturn(b.return);
  const username = normaliseUsername(str(b.username));
  const password = str(b.password).slice(0, PASSWORD_MAX);
  const email = cleanText(str(b.email), 254);

  const problem =
    usernameProblem(username) ??
    ((await isReserved(c.env, username)) || (await lookalikeOf(c.env, username)) ? UNAVAILABLE : null) ??
    (email === null ? "Enter your email address." : emailProblem(email)) ??
    passwordProblem(password, username) ??
    (password !== str(b.confirm) ? "The passwords don't match." : null);
  if (problem || email === null) return fail(c, problem ?? "Enter your email address.");

  const result = await createUser(c.env, {
    username,
    name: cleanText(str(b.name), 100),
    email,
    emailVerified: false,
    passwordHash: await hashPassword(password),
  });
  if (!result.ok) return fail(c, UNAVAILABLE);

  const sent = await sendVerificationEmail(c.env, result.id, email);
  await startSession(c, result.id, ["pwd"], { alert: false });
  await audit(c, "register", { actor: result.id, target: username });
  // From an app: back to /authorize, which asks them to verify before continuing.
  if (returnTo !== "/apps") return c.json({ redirect: returnTo });
  return c.json({ redirect: `/settings?m=${sent === "sent" ? "welcome-verify" : "verify-failed"}` });
});

/** "open", "done" (there are accounts), or "unconfigured" (no SETUP_TOKEN secret). */
signup.get("/api/setup", async (c) => {
  if ((await countUsers(c.env)) > 0) return c.json({ state: "done" });
  return c.json({ state: c.env.SETUP_TOKEN ? "open" : "unconfigured" });
});

signup.post("/api/setup", async (c) => {
  const done = () => fail(c, "This server already has accounts.", 409, { done: true });
  if ((await countUsers(c.env)) > 0 || !c.env.SETUP_TOKEN) return done();

  if (!(await attempt(c.env, `setup-ip:${clientIp(c)}`, 10, 60 * 60))) {
    return fail(c, "Too many attempts. Try again later.", 429);
  }

  const b = await body(c);
  if (!timingSafeEqualStr(str(b.token), c.env.SETUP_TOKEN)) {
    await audit(c, "setup.bad_token", { actor: null });
    return fail(c, "That setup token is wrong.", 403);
  }

  const username = normaliseUsername(str(b.username));
  const email = cleanText(str(b.email), 254);
  const problem = usernameProblem(username) ?? emailProblem(email);
  if (problem) return fail(c, problem);

  const id = await createFirstAdmin(c.env, {
    username,
    name: cleanText(str(b.name), 100),
    email,
    emailVerified: false,
  });
  if (!id) return done();

  await startSession(c, id, ["setup"], { alert: false });
  await audit(c, "setup.complete", { actor: id, target: username });
  return c.json({ redirect: "/settings?m=setup-done" });
});
