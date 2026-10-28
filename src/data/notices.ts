/* src/data/notices.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { TTL, issuer, now, siteName, type AppContext, type Env } from "../env";
import { randomToken, sha256Hex } from "../lib/crypto";
import { clientIp, userAgent } from "../lib/http";
import { sendMail } from "../lib/mail";
import { date, describeAgent } from "../lib/format";
import { getUser, revokeAllStatements, type UserRow } from "./users";

export interface Notice {
  subject: string;
  /** What happened, in one or two sentences. May hold user input; escaped for HTML here. */
  summary: string;
  /**
   * "self": done from a signed-in browser, so the email names that browser and
   * offers to sign it out. "admin": done by an administrator.
   */
  by: "self" | "admin";
  /** The session to offer to sign out. Defaults to the request's own. */
  sessionHash?: string | null;
  /** Send here instead of the account's verified address (the old address after a change). */
  to?: string;
}

interface Origin {
  when: number;
  ip: string;
  device: string;
  place: string | null;
}

/**
 * Emails the account owner about a sign-in or a change, in the background so
 * the response isn't held up by the mail API. Only verified addresses get
 * notices: an unverified one might not be theirs.
 */
export function notify(c: AppContext, userId: string, notice: Notice): void {
  const cf = (c.req.raw as { cf?: { city?: string; country?: string } }).cf;
  const origin: Origin = {
    when: now(),
    ip: clientIp(c),
    device: describeAgent(userAgent(c)),
    place: [cf?.city, cf?.country].filter(Boolean).join(", ") || null,
  };
  const sessionHash = notice.sessionHash === undefined ? (c.get("session")?.idHash ?? null) : notice.sessionHash;

  const task = sendNotice(c.env, userId, { ...notice, sessionHash }, origin).catch((err) =>
    console.error("[notice] couldn't send", err),
  );
  try {
    c.executionCtx.waitUntil(task);
  } catch {
    // No execution context (local tools): the promise still runs.
  }
}

async function sendNotice(env: Env, userId: string, notice: Notice, origin: Origin): Promise<void> {
  const user = await getUser(env, userId);
  if (!user) return;
  const to = notice.to ?? (user.email_verified ? user.email : null);
  if (!to) return;

  const site = siteName(env);
  const accountUrl = `${issuer(env)}/settings`;
  const link = notice.by === "self" ? await createSignoutLink(env, userId, notice.sessionHash ?? null) : null;

  const details: [string, string][] =
    notice.by === "self"
      ? [
          ["When", date(origin.when)],
          ["Device", origin.device],
          ["IP address", origin.place ? `${origin.ip} (${origin.place})` : origin.ip],
        ]
      : [["When", date(origin.when)]];

  const text = [
    `Hi ${user.name ?? user.username},`,
    "",
    notice.summary,
    "",
    ...details.map(([k, v]) => `${k}: ${v}`),
    "",
    ...(link
      ? [
          "If this was you, there's nothing to do.",
          "If it wasn't, sign that device out right away, then change your password:",
          link,
        ]
      : [`This was done by an administrator of ${site}. If you weren't expecting it, contact them.`]),
    "",
    `Your account: ${accountUrl}`,
  ].join("\n");

  const html =
    `<p>Hi ${escapeHtml(user.name ?? user.username)},</p>` +
    `<p>${escapeHtml(notice.summary)}</p>` +
    `<table>${details
      .map(([k, v]) => `<tr><td style="padding-right:1em;color:#666">${k}</td><td>${escapeHtml(v)}</td></tr>`)
      .join("")}</table>` +
    (link
      ? `<p>If this was you, there's nothing to do.</p>` +
        `<p>If it wasn't, <a href="${link}">sign that device out right away</a>, then change your password.</p>`
      : `<p>This was done by an administrator of ${escapeHtml(site)}. If you weren't expecting it, contact them.</p>`) +
    `<p><a href="${accountUrl}">Your account</a></p>`;

  await sendMail(env, { to, subject: `${notice.subject} · ${site}`, text, html });
}

/**
 * The goodbye email. Composed from the row before it's deleted, since the
 * background send would otherwise find no account to write to.
 */
export function notifyAccountDeleted(c: AppContext, user: UserRow): void {
  if (!user.email || !user.email_verified) return;
  const site = siteName(c.env);
  const name = user.name ?? user.username;
  const summary = `Your ${site} account @${user.username} was deleted on ${date(now())}, along with its passkeys, sessions and app sign-ins.`;
  const footer = "If you didn't do this, someone had access to your account. Contact the administrator straight away.";
  const task = sendMail(c.env, {
    to: user.email,
    subject: `Your account was deleted · ${site}`,
    text: `Hi ${name},\n\n${summary}\n\n${footer}`,
    html: `<p>Hi ${escapeHtml(name)},</p><p>${escapeHtml(summary)}</p><p>${footer}</p>`,
  }).catch((err) => console.error("[notice] couldn't send", err));
  try {
    c.executionCtx.waitUntil(task);
  } catch {
    // No execution context (local tools): the promise still runs.
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

// --- sign-out links ----------------------------------------------------------------

async function createSignoutLink(env: Env, userId: string, sessionHash: string | null): Promise<string> {
  const token = randomToken(32);
  const ts = now();
  await env.DB.prepare(
    "INSERT INTO signout_links (token_hash, user_id, session_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(await sha256Hex(token), userId, sessionHash, ts, ts + TTL.signoutLink)
    .run();
  return `${issuer(env)}/security/${token}`;
}

export interface SignoutTarget {
  user_id: string;
  username: string;
  session_hash: string | null;
  /** The named session is still signed in. */
  session_live: number;
}

/** Links keep working until they expire: every action they take is safe to repeat. */
export async function peekSignoutLink(env: Env, token: string): Promise<SignoutTarget | null> {
  return env.DB.prepare(
    `SELECT l.user_id, u.username, l.session_hash,
            EXISTS (SELECT 1 FROM sessions s WHERE s.id_hash = l.session_hash AND s.expires_at > ?) AS session_live
     FROM signout_links l JOIN users u ON u.id = l.user_id
     WHERE l.token_hash = ? AND l.expires_at > ?`,
  )
    .bind(now(), await sha256Hex(token), now())
    .first<SignoutTarget>();
}

/** Ends one session and forgets its browser, so signing in there again sends another notice. */
export async function signOutDevice(env: Env, userId: string, sessionHash: string): Promise<void> {
  await env.DB.batch([
    env.DB.prepare(
      `DELETE FROM known_devices WHERE user_id = ? AND device_hash =
         (SELECT device_hash FROM sessions WHERE id_hash = ? AND user_id = ?)`,
    ).bind(userId, sessionHash, userId),
    env.DB.prepare("DELETE FROM sessions WHERE id_hash = ? AND user_id = ?").bind(sessionHash, userId),
  ]);
}

/** Ends every session and app token, and forgets every browser. */
export async function signOutEverywhere(env: Env, userId: string): Promise<void> {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM known_devices WHERE user_id = ?").bind(userId),
    ...revokeAllStatements(env, userId),
  ]);
}
