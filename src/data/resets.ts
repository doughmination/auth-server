/* src/data/resets.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { TTL, issuer, now, siteName, type Env } from "../env";
import { randomToken, sha256Hex } from "../lib/crypto";
import { sendMail } from "../lib/mail";
import { attempt } from "../lib/ratelimit";
import { revokeAllStatements, type UserRow } from "./users";

/**
 * The accounts a "forgot password" request could be about: one username, or
 * every account with that verified address (addresses aren't unique).
 */
export async function resetCandidates(env: Env, input: string): Promise<UserRow[]> {
  const value = input.trim();
  if (!value) return [];
  const { results } = await env.DB.prepare(
    value.includes("@")
      ? "SELECT * FROM users WHERE email = ? COLLATE NOCASE AND email_verified = 1 AND disabled = 0 LIMIT 10"
      : "SELECT * FROM users WHERE username = ? AND email IS NOT NULL AND email_verified = 1 AND disabled = 0",
  )
    .bind(value.toLowerCase())
    .all<UserRow>();
  return results;
}

/** Emails a reset link to the account's verified address. Rate limited per account. */
export async function sendPasswordReset(env: Env, user: UserRow): Promise<void> {
  if (!user.email || !user.email_verified || user.disabled) return;
  if (!(await attempt(env, `reset-mail:${user.id}`, 3, 60 * 60))) return;

  const token = randomToken(32);
  const ts = now();
  await env.DB.batch([
    // Only the newest link for an account stays valid.
    env.DB.prepare("DELETE FROM password_resets WHERE user_id = ?").bind(user.id),
    env.DB.prepare(
      "INSERT INTO password_resets (token_hash, user_id, email, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
    ).bind(await sha256Hex(token), user.id, user.email, ts, ts + TTL.passwordReset),
  ]);

  // The username is limited to [a-z0-9._-] and the rest is our own config, so
  // nothing here needs HTML escaping.
  const url = `${issuer(env)}/reset/${token}`;
  const site = siteName(env);
  await sendMail(env, {
    to: user.email,
    subject: `Reset your password for ${site}`,
    text:
      `Someone asked to reset the password for @${user.username} on ${site}.\n\n` +
      `Open this link to choose a new one:\n\n${url}\n\n` +
      `It works for one hour. If you didn't ask for this, ignore this email: your password hasn't changed.`,
    html:
      `<p>Someone asked to reset the password for <strong>@${user.username}</strong> on ${site}.</p>` +
      `<p><a href="${url}">Choose a new password</a></p>` +
      `<p>It works for one hour. If you didn't ask for this, ignore this email: your password hasn't changed.</p>`,
  });
}

export interface ResetTarget {
  user_id: string;
  username: string;
}

/** The account a link would reset, without using it (the form page). */
export async function peekPasswordReset(env: Env, token: string): Promise<ResetTarget | null> {
  return env.DB.prepare(
    `SELECT r.user_id, u.username FROM password_resets r JOIN users u ON u.id = r.user_id
     WHERE r.token_hash = ? AND r.expires_at > ? AND u.disabled = 0
       AND u.email = r.email AND u.email_verified = 1`,
  )
    .bind(await sha256Hex(token), now())
    .first<ResetTarget>();
}

/**
 * Uses a link up: sets the new password and signs the account out of every
 * browser and app, since whoever had the old password may still be signed in.
 * Two-factor codes and passkeys stay, so a password sign-in still needs them.
 */
export async function consumePasswordReset(env: Env, token: string, passwordHash: string): Promise<string | null> {
  const row = await env.DB.prepare(
    "DELETE FROM password_resets WHERE token_hash = ? RETURNING user_id, email, expires_at",
  )
    .bind(await sha256Hex(token))
    .first<{ user_id: string; email: string; expires_at: number }>();
  if (!row || row.expires_at <= now()) return null;

  // Only if the account still has the address the link went to.
  const updated = await env.DB.prepare(
    `UPDATE users SET password_hash = ?, updated_at = ?
     WHERE id = ? AND email = ? AND email_verified = 1 AND disabled = 0
     RETURNING username`,
  )
    .bind(passwordHash, now(), row.user_id, row.email)
    .first<{ username: string }>();
  if (!updated) return null;

  await env.DB.batch([
    ...revokeAllStatements(env, row.user_id),
    env.DB.prepare("DELETE FROM rate_limits WHERE key = ?").bind(`login-user:${updated.username}`),
  ]);
  return row.user_id;
}
