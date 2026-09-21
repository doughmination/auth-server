/* src/data/verifications.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { TTL, issuer, now, siteName, type Env } from "../env";
import { randomToken, sha256Hex } from "../lib/crypto";
import { sendMail } from "../lib/mail";
import { attempt } from "../lib/ratelimit";

export type SendResult = "sent" | "rate_limited" | "failed";

/**
 * Emails a verification link for `email`. Rate limited per account, so neither
 * sign-ups nor profile edits can be used to flood someone's inbox.
 */
export async function sendVerificationEmail(env: Env, userId: string, email: string): Promise<SendResult> {
  if (!(await attempt(env, `verify-mail:${userId}`, 5, 60 * 60))) return "rate_limited";

  const token = randomToken(32);
  const ts = now();
  await env.DB.batch([
    // Only the newest link for an account stays valid.
    env.DB.prepare("DELETE FROM email_verifications WHERE user_id = ?").bind(userId),
    env.DB.prepare(
      "INSERT INTO email_verifications (token_hash, user_id, email, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
    ).bind(await sha256Hex(token), userId, email, ts, ts + TTL.emailVerification),
  ]);

  // Only our own site name and URL go into the body, never user input, so
  // nothing here needs HTML escaping.
  const url = `${issuer(env)}/verify-email/${token}`;
  const site = siteName(env);
  const sent = await sendMail(env, {
    to: email,
    subject: `Verify your email for ${site}`,
    text:
      `Open this link to verify your email address for ${site}:\n\n${url}\n\n` +
      `It works for 24 hours. If you didn't ask for this, you can ignore this email.`,
    html:
      `<p>Open this link to verify your email address for ${site}:</p>` +
      `<p><a href="${url}">Verify my email</a></p>` +
      `<p>It works for 24 hours. If you didn't ask for this, you can ignore this email.</p>`,
  });
  return sent ? "sent" : "failed";
}

/** The address a link would verify, without using it (the confirmation page). */
export async function peekEmailVerification(env: Env, token: string): Promise<string | null> {
  const row = await env.DB.prepare(
    "SELECT email FROM email_verifications WHERE token_hash = ? AND expires_at > ?",
  )
    .bind(await sha256Hex(token), now())
    .first<{ email: string }>();
  return row?.email ?? null;
}

/**
 * Uses a link up. Only verifies if the account still has the address the link
 * was sent to. Returns the user id on success.
 */
export async function consumeEmailVerification(env: Env, token: string): Promise<string | null> {
  const row = await env.DB.prepare(
    "DELETE FROM email_verifications WHERE token_hash = ? RETURNING user_id, email, expires_at",
  )
    .bind(await sha256Hex(token))
    .first<{ user_id: string; email: string; expires_at: number }>();
  if (!row || row.expires_at <= now()) return null;

  const result = await env.DB.prepare(
    "UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ? AND email = ?",
  )
    .bind(now(), row.user_id, row.email)
    .run();
  return result.meta.changes === 1 ? row.user_id : null;
}
