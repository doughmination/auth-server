/* src/api/apps.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { Hono } from "hono";
import type { AppEnv } from "../env";
import { requireUser } from "../lib/guards";
import { clientAllows, listClients } from "../data/clients";

export const apps = new Hono<AppEnv>();

/**
 * The apps this account may sign in to, for the "Your apps" page: the same
 * group check /authorize makes, limited to apps that have a website to open.
 */
apps.get("/api/apps", requireUser, async (c) => {
  const groups = c.get("user")!.groups;
  const clients = await listClients(c.env);
  return c.json(
    clients
      .filter((cl) => cl.homeUrl && clientAllows(cl, groups))
      .map((cl) => ({ id: cl.id, name: cl.name, url: cl.homeUrl, iconUrl: cl.iconUrl })),
  );
});
