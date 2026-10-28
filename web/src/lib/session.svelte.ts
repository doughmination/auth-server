/* web/src/lib/session.svelte.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

export interface SessionUser {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  picture: string | null;
  isAdmin: boolean;
}

interface SessionState {
  ready: boolean;
  site: string;
  registration: boolean;
  contact: string | null;
  needsSetup: boolean;
  user: SessionUser | null;
  csrf: string | null;
  recentAuth: boolean;
}

/**
 * Who's signed in and how the server is set up, from /api/session. Loaded once
 * per page load: anything that signs in or out does a full navigation, so
 * this never goes stale.
 */
export const session = $state<SessionState>({
  ready: false,
  site: "Sign in",
  registration: false,
  contact: null,
  needsSetup: false,
  user: null,
  csrf: null,
  recentAuth: false,
});

export async function loadSession(): Promise<void> {
  const res = await fetch("/api/session", { credentials: "same-origin" });
  if (!res.ok) throw new Error(`session ${res.status}`);
  Object.assign(session, await res.json(), { ready: true });
}
