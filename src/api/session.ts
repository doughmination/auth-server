/* src/api/session.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { Hono } from "hono";
import { siteName, type AppEnv } from "../env";
import { isRecentAuth } from "../lib/guards";
import { countUsers } from "../data/users";

export const session = new Hono<AppEnv>();

/** Everything the page needs before it can draw anything: who's signed in, and how this server is set up. */
session.get("/api/session", async (c) => {
  const user = c.get("user");
  const current = c.get("session");
  return c.json({
    site: siteName(c.env),
    registration: c.env.REGISTRATION === "open",
    contact: c.env.CONTACT_EMAIL || null,
    needsSetup: user ? false : (await countUsers(c.env)) === 0,
    user: user && {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      picture: user.picture,
      isAdmin: user.isAdmin,
    },
    csrf: current?.csrf ?? null,
    recentAuth: current ? isRecentAuth(current.authTime) : false,
  });
});
