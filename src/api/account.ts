/* src/api/account.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { Hono } from "hono";
import { renderSVG } from "uqr";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { ADMIN_GROUP, siteName, type AppContext, type AppEnv } from "../env";
import { audit } from "../lib/audit";
import { decrypt, encrypt } from "../lib/crypto";
import { amrLabel, describeAgent } from "../lib/format";
import { isRecentAuth, requireCsrf, requireRecentAuth, requireUser } from "../lib/guards";
import { body, fail, readJson, str } from "../lib/http";
import { hashPassword, passwordProblem, verifyPassword } from "../lib/password";
import { attempt } from "../lib/ratelimit";
import { generateTotpSecret, otpauthUri, verifyTotp } from "../lib/totp";
import { cleanText, emailProblem, pictureProblem } from "../lib/validate";
import {
  countPasskeys,
  deletePasskey,
  finishRegistration,
  listPasskeys,
  registrationOptions,
  renamePasskey,
} from "../data/passkeys";
import { notify, notifyAccountDeleted, signOutDevice } from "../data/notices";
import { endSession, listSessions, revokeOtherSessions } from "../data/sessions";
import {
  claimTotpStep,
  deleteUser,
  disableTotp,
  enableTotp,
  getUser,
  setPasswordHash,
  setTotpPending,
  updateProfile,
  type UserRow,
} from "../data/users";
import { sendVerificationEmail } from "../data/verifications";
import { TOTP_USER_LIMIT } from "./login";

export const account = new Hono<AppEnv>();

account.use("/api/account", requireUser);
account.use("/api/account/*", requireUser, requireCsrf);
// Anything that changes how the account signs in, or deletes it.
for (const path of [
  "/api/account/passkeys/options",
  "/api/account/passkeys/verify",
  "/api/account/passkeys/:id/delete",
  "/api/account/password",
  "/api/account/password/remove",
  "/api/account/totp/*",
  "/api/account/delete",
]) {
  account.post(path, requireRecentAuth);
}

async function me(c: AppContext): Promise<UserRow> {
  const user = await getUser(c.env, c.get("user")!.id);
  if (!user) throw new Error("session user vanished");
  return user;
}

/** Everything the account page shows. Secrets never leave: only whether they're set. */
account.get("/api/account", async (c) => {
  const user = await me(c);
  const session = c.get("session")!;
  const [passkeys, sessions] = await Promise.all([listPasskeys(c.env, user.id), listSessions(c.env, user.id)]);
  return c.json({
    username: user.username,
    name: user.name,
    email: user.email,
    emailVerified: Boolean(user.email_verified),
    picture: user.picture,
    hasPassword: Boolean(user.password_hash),
    totp: Boolean(user.totp_secret),
    recentAuth: isRecentAuth(session.authTime),
    passkeys: passkeys.map((p) => ({
      id: p.id,
      name: p.name,
      synced: p.device_type === "multiDevice",
      createdAt: p.created_at,
      lastUsedAt: p.last_used_at,
    })),
    sessions: sessions.map((s) => ({
      id: s.id_hash,
      current: s.id_hash === session.idHash,
      device: describeAgent(s.user_agent),
      ip: s.ip,
      method: amrLabel(JSON.parse(s.amr) as string[]),
      createdAt: s.created_at,
      lastSeenAt: s.last_seen_at,
    })),
  });
});

account.post("/api/account/profile", async (c) => {
  const b = await body(c);
  const update = {
    name: cleanText(str(b.name), 100),
    email: cleanText(str(b.email), 254),
    picture: cleanText(str(b.picture), 2048),
  };
  const problem = emailProblem(update.email) ?? pictureProblem(update.picture);
  if (problem) return fail(c, problem);

  const user = await me(c);
  const emailChanged = update.email !== user.email;
  // The email address receives security notices, so swapping it is as
  // sensitive as changing the password.
  if (emailChanged && !isRecentAuth(c.get("session")!.authTime)) {
    return fail(c, "For your security, confirm it's you before changing your email address.", 401, { reauth: true });
  }
  await updateProfile(c.env, user, update);
  await audit(c, "account.profile");

  if (emailChanged && user.email && user.email_verified) {
    // The old address hears about it: the new one isn't verified yet.
    notify(c, user.id, {
      subject: "Your email address was changed",
      summary: update.email
        ? `The email address on your account was changed from ${user.email} to ${update.email}.`
        : `The email address ${user.email} was removed from your account.`,
      by: "self",
      to: user.email,
    });
  } else if (!emailChanged && (update.name !== user.name || update.picture !== user.picture)) {
    notify(c, user.id, { subject: "Your profile was updated", summary: "Your name or picture was changed.", by: "self" });
  }

  if (update.email && emailChanged) {
    const sent = await sendVerificationEmail(c.env, user.id, update.email);
    return c.json({ message: sent === "sent" ? "verify-sent" : "verify-failed" });
  }
  return c.json({ message: "profile-saved" });
});

account.post("/api/account/email/verify", async (c) => {
  const user = await me(c);
  if (!user.email || user.email_verified) return c.json({ message: null });
  const sent = await sendVerificationEmail(c.env, user.id, user.email);
  return c.json({ message: sent === "sent" ? "verify-sent" : "verify-failed" });
});

// --- passkeys --------------------------------------------------------------------

account.post("/api/account/passkeys/options", async (c) => {
  return c.json(await registrationOptions(c.env, await me(c)));
});

account.post("/api/account/passkeys/verify", async (c) => {
  const b = await readJson<{ id?: string; response?: RegistrationResponseJSON; name?: string }>(c);
  if (!b?.id || !b.response) return fail(c, "Malformed request.");

  const name = cleanText(str(b.name), 60) ?? "Passkey";
  const result = await finishRegistration(c.env, await me(c), b.id, b.response, name);
  if (!result.ok) return fail(c, result.error);

  await audit(c, "account.passkey_added", { detail: name });
  notify(c, c.get("user")!.id, {
    subject: "A passkey was added",
    summary: `A passkey named "${name}" was added to your account. It can sign in without a password.`,
    by: "self",
  });
  return c.json({ message: "passkey-added" });
});

account.post("/api/account/passkeys/:id/rename", async (c) => {
  const name = cleanText(str((await body(c)).name), 60);
  if (!name) return fail(c, "Passkeys need a name.");
  await renamePasskey(c.env, c.get("user")!.id, c.req.param("id"), name);
  return c.json({ message: "passkey-renamed" });
});

account.post("/api/account/passkeys/:id/delete", async (c) => {
  const user = await me(c);
  if (!user.password_hash && (await countPasskeys(c.env, user.id)) <= 1) {
    return fail(c, "That's your only way to sign in. Add another passkey or a password before removing it.");
  }
  const name = await deletePasskey(c.env, user.id, c.req.param("id"));
  if (name) {
    await audit(c, "account.passkey_removed", { detail: name });
    notify(c, user.id, {
      subject: "A passkey was removed",
      summary: `The passkey "${name}" was removed from your account.`,
      by: "self",
    });
  }
  return c.json({ message: "passkey-removed" });
});

// --- password ------------------------------------------------------------------

account.post("/api/account/password", async (c) => {
  const user = await me(c);
  const b = await body(c);
  const password = str(b.password);
  const problem =
    passwordProblem(password, user.username) ?? (password !== str(b.confirm) ? "The two passwords don't match." : null);
  if (problem) return fail(c, problem);

  await setPasswordHash(c.env, user.id, await hashPassword(password));
  await revokeOtherSessions(c.env, user.id, c.get("session")!.idHash);
  await audit(c, "account.password_set");
  notify(c, user.id, {
    subject: user.password_hash ? "Your password was changed" : "A password was added",
    summary: user.password_hash
      ? "Your password was changed, and your other sessions were signed out."
      : "A password was added to your account.",
    by: "self",
  });
  return c.json({ message: "password-set" });
});

account.post("/api/account/password/remove", async (c) => {
  const user = await me(c);
  if ((await countPasskeys(c.env, user.id)) === 0) return fail(c, "Add a passkey before removing your password.");
  await setPasswordHash(c.env, user.id, null);
  await audit(c, "account.password_removed");
  notify(c, user.id, {
    subject: "Your password was removed",
    summary: "The password (and any two-factor codes) was removed from your account. It now signs in with passkeys only.",
    by: "self",
  });
  return c.json({ message: "password-removed" });
});

// --- TOTP ----------------------------------------------------------------------

/** Starts (or restarts) setup and returns what the authenticator app needs. */
account.post("/api/account/totp/start", async (c) => {
  const user = await me(c);
  if (!user.password_hash) return fail(c, "Set a password first.");
  if (user.totp_secret) return fail(c, "Two-factor codes are already on.", 409);

  const secret = generateTotpSecret();
  await setTotpPending(c.env, user.id, await encrypt(c.env.KEY_ENCRYPTION_KEY, secret));
  const uri = otpauthUri(secret, siteName(c.env), user.username);
  return c.json({
    qr: `data:image/svg+xml,${encodeURIComponent(renderSVG(uri, { border: 2 }))}`,
    secret: secret.match(/.{1,4}/g)?.join(" ") ?? secret,
  });
});

account.post("/api/account/totp/confirm", async (c) => {
  const user = await me(c);
  if (!user.totp_pending) return fail(c, "Setup expired. Start again.", 409);

  const secret = await decrypt(c.env.KEY_ENCRYPTION_KEY, user.totp_pending);
  const step = await verifyTotp(secret, str((await body(c)).code), 0);
  if (step === null) return fail(c, "That code didn't match. Check your device's clock and try the next one.");

  await enableTotp(c.env, user.id, user.totp_pending, step);
  await audit(c, "account.totp_enabled");
  notify(c, user.id, {
    subject: "Two-factor codes turned on",
    summary: "Two-factor codes were turned on. Password sign-ins now also need a code or a passkey.",
    by: "self",
  });
  return c.json({ message: "totp-enabled" });
});

account.post("/api/account/totp/disable", async (c) => {
  const user = await me(c);
  if (!user.totp_secret) return c.json({ message: "totp-disabled" });

  if (!(await attempt(c.env, `totp-user:${user.id}`, TOTP_USER_LIMIT, 15 * 60))) {
    return fail(c, "Too many codes tried. Wait a few minutes and try again.", 429);
  }
  const secret = await decrypt(c.env.KEY_ENCRYPTION_KEY, user.totp_secret);
  const step = await verifyTotp(secret, str((await body(c)).code), user.totp_last_step);
  if (step === null || !(await claimTotpStep(c.env, user.id, step))) {
    return fail(c, "That code didn't work, so two-factor codes are still on.");
  }
  await disableTotp(c.env, user.id);
  await audit(c, "account.totp_disabled");
  notify(c, user.id, {
    subject: "Two-factor codes turned off",
    summary: "Two-factor codes were turned off for your account.",
    by: "self",
  });
  return c.json({ message: "totp-disabled" });
});

// --- sessions ------------------------------------------------------------------

account.post("/api/account/sessions/revoke-others", async (c) => {
  await revokeOtherSessions(c.env, c.get("user")!.id, c.get("session")!.idHash);
  await audit(c, "account.sessions_revoked");
  return c.json({ message: "sessions-revoked" });
});

account.post("/api/account/sessions/:id/revoke", async (c) => {
  const id = c.req.param("id");
  if (id === c.get("session")!.idHash) {
    await endSession(c);
    return c.json({ redirect: "/login?m=signed-out" });
  }
  await signOutDevice(c.env, c.get("user")!.id, id);
  await audit(c, "account.session_revoked");
  return c.json({ message: "session-revoked" });
});

// --- deletion --------------------------------------------------------------------

account.post("/api/account/delete", async (c) => {
  const user = await me(c);
  const b = await body(c);

  if (str(b.confirm).trim().toLowerCase() !== user.username.toLowerCase()) {
    return fail(c, "Type your username exactly to delete your account.");
  }
  if (user.password_hash && !(await verifyPassword(str(b.password).slice(0, 512), user.password_hash))) {
    return fail(c, "That password isn't right, so your account wasn't deleted.");
  }
  if (c.get("user")!.isAdmin) {
    const admins = await c.env.DB.prepare(
      `SELECT COUNT(*) AS n FROM user_groups g JOIN users u ON u.id = g.user_id
       WHERE g.group_name = ? AND u.disabled = 0`,
    )
      .bind(ADMIN_GROUP)
      .first<{ n: number }>();
    if ((admins?.n ?? 0) <= 1) {
      return fail(c, `You're the only admin. Add another member to ${ADMIN_GROUP} before deleting your account.`);
    }
  }

  // Everything else (passkeys, sessions, tokens, devices, links) goes with the
  // user row. The security log keeps only the id, until it expires.
  notifyAccountDeleted(c, user);
  await deleteUser(c.env, user.id);
  await audit(c, "account.deleted", { actor: null, target: user.id });
  await endSession(c);
  return c.json({ redirect: "/login?m=account-deleted" });
});
