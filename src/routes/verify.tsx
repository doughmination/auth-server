/* src/routes/verify.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { Hono } from "hono";
import { Check, Login } from "pixelarticons/react";
import type { AppContext, AppEnv } from "../env";
import { audit } from "../lib/audit";
import { clientIp } from "../lib/http";
import { attempt } from "../lib/ratelimit";
import { consumeEmailVerification, peekEmailVerification } from "../data/verifications";
import { render } from "../views/layout";

export const verify = new Hono<AppEnv>();

function unusable(c: AppContext) {
  return render(
    c,
    { title: "Link expired", narrow: true, status: 410 },
    <div class="card">
      <h1>This link can't be used</h1>
      <p class="muted">
        It has expired, was already used, or a newer one was sent. You can send a new one from your account page.
      </p>
      <p>
        <a class="btn primary" href="/account">
          Your account
        </a>
      </p>
    </div>,
  );
}

// Mail scanners follow GETs, so verifying takes a deliberate POST.
verify.get("/verify-email/:token", async (c) => {
  const email = await peekEmailVerification(c.env, c.req.param("token"));
  if (!email) return unusable(c);
  return render(
    c,
    { title: "Verify your email", narrow: true },
    <div class="card">
      <h1>Verify your email</h1>
      <p class="muted">
        Confirm that <strong>{email}</strong> is yours.
      </p>
      <form method="post" action={`/verify-email/${c.req.param("token")}`}>
        <button type="submit" class="primary wide">
          <Check class="icon" aria-hidden="true" />
          Verify
        </button>
      </form>
    </div>,
  );
});

verify.post("/verify-email/:token", async (c) => {
  if (!(await attempt(c.env, `verify-ip:${clientIp(c)}`, 30, 15 * 60))) {
    return c.text("Too many attempts. Wait a few minutes and try again.", 429);
  }
  const userId = await consumeEmailVerification(c.env, c.req.param("token"));
  if (!userId) return unusable(c);

  await audit(c, "account.email_verified", { actor: userId, target: userId });
  if (c.get("user")?.id === userId) return c.redirect("/account?m=email-verified");
  return render(
    c,
    { title: "Email verified", narrow: true },
    <div class="card">
      <h1>Email verified</h1>
      <p class="muted">Thanks! You can close this tab, or sign in.</p>
      <p>
        <a class="btn primary" href="/login">
          <Login class="icon" aria-hidden="true" />
          Sign in
        </a>
      </p>
    </div>,
  );
});
