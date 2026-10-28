/* src/data/reserved.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { now, type Env } from "../env";

// Usernames that read the same count as the same name: separators are dropped
// and look-alike characters folded, so c.love, c_love and cl0ve all match clove, and adm1n matches admin.
// Applied in this order, by both canonicalUsername and canonicalSql.
const FOLDS: [string, string][] = [
  [".", ""],
  ["_", ""],
  ["-", ""],
  ["0", "o"],
  ["1", "l"],
  ["i", "l"],
  ["rn", "m"],
  ["vv", "w"],
];

const BUILTIN = new Set([
  "admin", "administrator", "root", "system", "support", "help", "security",
  "abuse", "postmaster", "hostmaster", "webmaster", "noreply", "mail",
  "auth", "sso", "login", "logout", "register", "setup", "account", "api",
  "www", "null", "undefined", "doughmination", "ctf", "universalcredit",
  "sandrone", "aria",
].map(canonicalUsername));

export function canonicalUsername(username: string): string {
  return FOLDS.reduce((s, [from, to]) => s.replaceAll(from, to), username.toLowerCase());
}

/** canonicalUsername as a SQL expression over `column`. */
function canonicalSql(column: string): string {
  return FOLDS.reduce((expr, [from, to]) => `replace(${expr}, '${from}', '${to}')`, `lower(${column})`);
}

export async function isReserved(env: Env, username: string): Promise<boolean> {
  const key = canonicalUsername(username);
  if (BUILTIN.has(key)) return true;
  // Stored keys are re-folded, so rows saved before a fold was added still match.
  const row = await env.DB.prepare(`SELECT 1 FROM reserved_usernames WHERE ${canonicalSql("username")} = ?`)
    .bind(key)
    .first();
  return row !== null;
}

/**
 * Another account whose username reads the same as this one, if any.
 * `exceptId` skips the account being renamed.
 */
export async function lookalikeOf(env: Env, username: string, exceptId: string | null = null): Promise<string | null> {
  const row = await env.DB.prepare(
    `SELECT username FROM users WHERE ${canonicalSql("username")} = ? AND id IS NOT ? LIMIT 1`,
  )
    .bind(canonicalUsername(username), exceptId)
    .first<{ username: string }>();
  return row?.username ?? null;
}

export interface ReservedRow {
  username: string;
  note: string;
  created_at: number;
}

export async function listReserved(env: Env): Promise<ReservedRow[]> {
  const { results } = await env.DB.prepare("SELECT * FROM reserved_usernames ORDER BY username").all<ReservedRow>();
  return results;
}

/** False if it was already reserved. */
export async function reserveUsername(env: Env, username: string, note: string): Promise<boolean> {
  if (await isReserved(env, username)) return false;
  const result = await env.DB.prepare(
    "INSERT OR IGNORE INTO reserved_usernames (username, note, created_at) VALUES (?, ?, ?)",
  )
    .bind(canonicalUsername(username), note, now())
    .run();
  return result.meta.changes === 1;
}

export async function unreserveUsername(env: Env, username: string): Promise<void> {
  await env.DB.prepare(`DELETE FROM reserved_usernames WHERE ${canonicalSql("username")} = ?`)
    .bind(canonicalUsername(username))
    .run();
}

export function builtinReserved(): string[] {
  return [...BUILTIN].sort();
}
