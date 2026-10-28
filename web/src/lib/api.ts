/* web/src/lib/api.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { here, reload } from "./router.svelte";
import { session } from "./session.svelte";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data: Record<string, unknown>,
  ) {
    super(message);
  }
}

const FALLBACK = "Something went wrong. Please try again.";

/**
 * Calls the Worker's JSON API. Sends the session's CSRF token, and handles the
 * answers every page would handle the same way: a lost session or a needed
 * re-sign-in goes to /login and comes back here afterwards.
 */
export async function api<T = Record<string, unknown>>(path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (session.csrf) headers["X-CSRF-Token"] = session.csrf;

  let res: Response;
  try {
    res = await fetch(path, {
      method: body === undefined ? "GET" : "POST",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError("Couldn't reach the server. Check your connection and try again.", 0, {});
  }

  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    // not JSON (a proxy error page, say)
  }

  if (!res.ok) {
    if (data.signin) reload(`/login?${new URLSearchParams({ return: here() })}`);
    else if (data.reauth) reload(`/login?${new URLSearchParams({ return: here(), reauth: "1" })}`);
    throw new ApiError(typeof data.error === "string" ? data.error : FALLBACK, res.status, data);
  }
  return data as T;
}

/** The message to show for anything thrown by api() or WebAuthn. */
export function errorText(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return FALLBACK;
}

/** Shorthand for a confirmation prompt before something destructive. */
export function confirmed(message: string): boolean {
  return window.confirm(message);
}
