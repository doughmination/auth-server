/* src/lib/format.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * Wording shared by security emails and the session lists the API returns.
 */

export function date(ts: number | null | undefined): string {
  if (!ts) return "never";
  return new Date(ts * 1000).toISOString().slice(0, 16).replace("T", " ") + " UTC";
}

/** How a session signed in, from its RFC 8176 `amr` list. */
export function amrLabel(amr: string[]): string {
  const passkey = amr.includes("swk") || amr.includes("hwk");
  if (passkey && amr.includes("pwd")) return "password + passkey";
  if (passkey) return "passkey";
  if (amr.includes("otp") && amr.includes("pwd")) return "password + code";
  if (amr.includes("pwd")) return "password";
  if (amr.includes("link")) return "sign-in link";
  if (amr.includes("setup")) return "setup";
  return "unknown";
}

/** Short, friendly browser + OS guess for session lists. */
export function describeAgent(ua: string | null): string {
  if (!ua) return "Unknown device";
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Safari\//.test(ua) ? "Safari" :
    "Browser";
  const os =
    /Windows/.test(ua) ? "Windows" :
    /iPhone|iPad/.test(ua) ? "iOS" :
    /Mac OS X/.test(ua) ? "macOS" :
    /Android/.test(ua) ? "Android" :
    /Linux/.test(ua) ? "Linux" :
    "unknown OS";
  return `${browser} on ${os}`;
}
