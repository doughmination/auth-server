import { now, type Env } from "../env";

const BUILTIN = new Set([
    "admin", "administrator", "root", "system", "support", "help", "security",
    "abuse", "postmaster", "hostmaster", "webmaster", "noreply", "mail",
    "auth", "sso", "login", "logout", "register", "setup", "account", "api",
    "www", "null", "undefined", "doughmination", "ctf", "universalcredit",
    "sandrone", "aria",
])

export function canonicalUsername(username: string): string {
    return username.replace(/[._-]/g, "");
}

export async function isReserved(env: Env, username: string): Promise<boolean> {
    const key = canonicalUsername(username);
    if (BUILTIN.has(key)) return true;
    const row = await env.DB.prepare("SELECT 1 FROM reserved_usernames WHERE username = ?").bind(key).first();
    return row !== null
}

export interface ReservedRow {
    username: string;
    note: string;
    created_at: number;
}

export async function listReserved(env: Env): Promise<ReservedRow[]> {
    const { results } = await env.DB.prepare(
        "SELECT * FROM reserved_usernames ORDER BY username",
    ).all<ReservedRow>();
    return results;
}

/** False if it was already reserved. */
export async function reserveUsername(env: Env, username: string, note: string): Promise<boolean> {
    const result = await env.DB.prepare(
        "INSERT OR IGNORE INTO reserved_usernames (username, note, created_at) VALUES (?, ?, ?)",
    )
        .bind(canonicalUsername(username), note, now())
        .run();
    return result.meta.changes === 1;
}

export async function unreserveUsername(env: Env, username: string): Promise<void> {
    await env.DB.prepare("DELETE FROM reserved_usernames WHERE username = ?")
        .bind(canonicalUsername(username))
        .run();
}

export function builtinReserved(): string[] {
    return [...BUILTIN].sort();
}