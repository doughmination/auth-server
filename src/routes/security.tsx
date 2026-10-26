/* src/routes/security.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { Hono } from "hono";
import { Login, Logout } from "pixelarticons/react";
import type { AppContext, AppEnv } from "../env";
import { audit } from "../lib/audit";
import { clientIp, form } from "../lib/http";
import { attempt } from "../lib/ratelimit";
import { peekSignoutLink, signOutDevice, signOutEverywhere } from "../data/notices";
import { render } from "../views/layout";

/** The "wasn't me" links in security emails. They work without signing in. */
export const security = new Hono<AppEnv>();

function unusable(c: AppContext) {
  return render(
    c,
    { title: "Link expired", narrow: true, status: 410 },
    <div class="card">
      <h1>This link has expired</h1>
      <p class="muted">
        Sign in to see and sign out your sessions. If you can't sign in, ask an admin to sign you out everywhere.
      </p>
      <p>
        <a class="btn primary" href="/login">
          <Login class="icon" aria-hidden="true" />
          Sign in
        </a>
      </p>
    </div>,
  );
}

// Mail scanners follow GETs, so signing out takes a deliberate POST.
security.get("/security/:token", async (c) => {
  const target = await peekSignoutLink(c.env, c.req.param("token"));
  if (!target) return unusable(c);
  const action = `/security/${c.req.param("token")}`;
  return render(
    c,
    { title: "Secure your account", narrow: true },
    <div class="card stack">
      <h1>Wasn't you?</h1>
      <p class="muted">
        Sign the device out of <strong>@{target.username}</strong>. Then sign in yourself and change your password.
      </p>
      {target.session_live ? (
        <form method="post" action={action}>
          <input type="hidden" name="scope" value="device" />
          <button type="submit" class="primary wide">
            <Logout class="icon" aria-hidden="true" />
            Sign out that device
          </button>
        </form>
      ) : (
        <p class="notice">That device's session has already ended.</p>
      )}
      <form method="post" action={action} data-confirm="Sign out every browser and app, including this one?">
        <input type="hidden" name="scope" value="all" />
        <button type="submit" class="danger wide">
          <Logout class="icon" aria-hidden="true" />
          Sign out everywhere
        </button>
      </form>
      <p class="muted small">"Everywhere" also signs out the apps you use with this account.</p>
    </div>,
  );
});

security.post("/security/:token", async (c) => {
  if (!(await attempt(c.env, `signout-ip:${clientIp(c)}`, 30, 15 * 60))) {
    return c.text("Too many attempts. Wait a few minutes and try again.", 429);
  }
  const target = await peekSignoutLink(c.env, c.req.param("token"));
  if (!target) return unusable(c);

  const everywhere = (await form(c)).scope === "all";
  if (everywhere) {
    await signOutEverywhere(c.env, target.user_id);
  } else if (target.session_hash) {
    await signOutDevice(c.env, target.user_id, target.session_hash);
  }
  await audit(c, everywhere ? "security.signed_out_everywhere" : "security.signed_out_device", {
    actor: null,
    target: target.user_id,
  });

  return render(
    c,
    { title: "Signed out", narrow: true },
    <div class="card">
      <h1>{everywhere ? "Signed out everywhere" : "That device is signed out"}</h1>
      <p class="muted">
        Now sign in, change your password, and check your passkeys and two-factor settings for anything you didn't
        add.
      </p>
      <p>
        <a class="btn primary" href="/login?return=%2Faccount">
          <Login class="icon" aria-hidden="true" />
          Sign in
        </a>
      </p>
    </div>,
  );
});
