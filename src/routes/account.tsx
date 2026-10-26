/* src/routes/account.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { Hono } from "hono";
import { Key, Save, Shield } from "pixelarticons/react";
import { renderSVG } from "uqr";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { ADMIN_GROUP, siteName, type AppContext, type AppEnv } from "../env";
import { audit } from "../lib/audit";
import { decrypt, encrypt } from "../lib/crypto";
import { form, readJson } from "../lib/http";
import { requireCsrf, requireUser } from "../lib/guards";
import { hashPassword, passwordProblem, PASSWORD_MIN, verifyPassword } from "../lib/password";
import { generateTotpSecret, otpauthUri, verifyTotp } from "../lib/totp";
import { cleanText, emailProblem, pictureProblem } from "../lib/validate";
import {
  countPasskeys,
  deletePasskey,
  finishRegistration,
  listPasskeys,
  registrationOptions,
  renamePasskey,
} from "../data/passkeys";
import { notify, notifyAccountDeleted, signOutDevice } from "../data/notices";
import { endSession, listSessions, revokeOtherSessions } from "../data/sessions";
import {
  claimTotpStep,
  deleteUser,
  disableTotp,
  enableTotp,
  getUser,
  setPasswordHash,
  setTotpPending,
  updateProfile,
  type UserRow,
} from "../data/users";
import { sendVerificationEmail } from "../data/verifications";
import { render } from "../views/layout";
import { Csrf, ErrorNote, Field, Flash, Section, amrLabel, date, describeAgent, relative } from "../views/ui";

export const account = new Hono<AppEnv>();

account.use("/account", requireUser);
account.use("/account/*", requireUser, requireCsrf);

async function me(c: AppContext): Promise<UserRow> {
  const user = await getUser(c.env, c.get("user")!.id);
  if (!user) throw new Error("session user vanished");
  return user;
}

async function accountPage(c: AppContext, opts: { error?: string; status?: 400 } = {}) {
  const user = await me(c);
  const session = c.get("session")!;
  const [passkeys, sessions] = await Promise.all([listPasskeys(c.env, user.id), listSessions(c.env, user.id)]);
  const csrf = session.csrf;

  return render(
    c,
    { title: "Your account", page: "account", status: opts.status },
    <>
      <h1>Hi, {user.name ?? user.username}</h1>
      <Flash code={c.req.query("m")} />
      <ErrorNote error={opts.error} />
      <p class="notice error hidden" id="passkey-error" role="alert"></p>

      <Section title="Profile" description="Shared with the apps you sign in to.">
        <form method="post" action="/account/profile" class="stack">
          <Csrf token={csrf} />
          <label class="field">
            <span>Username</span>
            <input type="text" value={user.username} disabled />
            <small class="muted">Only an admin can change this.</small>
          </label>
          <Field label="Display name" name="name" value={user.name} autocomplete="name" maxlength={100} />
          <Field
            label="Email"
            name="email"
            type="email"
            value={user.email}
            autocomplete="email"
            maxlength={254}
            hint={user.email ? (user.email_verified ? "Verified." : "Not verified.") : undefined}
          />
          <Field label="Picture URL" name="picture" type="url" value={user.picture} maxlength={2048} placeholder="https://…" />
          <div>
            <button type="submit">
              <Save class="icon" aria-hidden="true" />
              Save profile
            </button>
          </div>
        </form>
        {user.email && !user.email_verified && (
          <form method="post" action="/account/email/verify" class="inline-edit">
            <Csrf token={csrf} />
            <small class="muted">{user.email} isn't verified yet.</small>
            <button type="submit" class="small">Resend verification email</button>
          </form>
        )}
      </Section>

      <Section title="Passkeys" description="The quickest and safest way to sign in: your device unlocks with a fingerprint, face or PIN.">
        {passkeys.length === 0 ? (
          <p class="muted">No passkeys yet.</p>
        ) : (
          <ul class="rows">
            {passkeys.map((p) => (
              <li>
                <div class="grow">
                  <form method="post" action={`/account/passkeys/${encodeURIComponent(p.id)}/rename`} class="inline-edit">
                    <Csrf token={csrf} />
                    <input type="text" name="name" value={p.name} maxlength={60} aria-label="Passkey name" required />
                    <button type="submit" class="small">Rename</button>
                  </form>
                  <small class="muted">
                    {p.device_type === "multiDevice" ? "Synced" : "This device only"} · added {date(p.created_at)} · last used{" "}
                    {relative(p.last_used_at)}
                  </small>
                </div>
                <form
                  method="post"
                  action={`/account/passkeys/${encodeURIComponent(p.id)}/delete`}
                  data-confirm={`Remove the passkey "${p.name}"?`}
                >
                  <Csrf token={csrf} />
                  <button type="submit" class="danger small">Remove</button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <form id="passkey-add" class="inline-edit">
          <input type="text" name="name" placeholder="Name, e.g. Phone" maxlength={60} aria-label="New passkey name" />
          <button type="submit" class="primary">
            <Key class="icon" aria-hidden="true" />
            Add a passkey
          </button>
        </form>
      </Section>

      <Section title="Password">
        <p class="muted">
          {user.password_hash
            ? "You can sign in with a password."
            : "No password set. Add one as a fallback for devices without your passkeys."}
        </p>
        <form method="post" action="/account/password" class="stack">
          <Csrf token={csrf} />
          <input type="text" name="username" value={user.username} autocomplete="username" hidden />
          <Field
            label={user.password_hash ? "New password" : "Password"}
            name="password"
            type="password"
            required
            autocomplete="new-password"
            maxlength={512}
            hint={`At least ${PASSWORD_MIN} characters. A long phrase beats a short tricky one.`}
          />
          <Field label="Confirm password" name="confirm" type="password" required autocomplete="new-password" maxlength={512} />
          <div>
            <button type="submit">{user.password_hash ? "Change password" : "Set password"}</button>
          </div>
        </form>
        {user.password_hash && (
          <form method="post" action="/account/password/remove" data-confirm="Remove your password? You'll only be able to sign in with a passkey.">
            <Csrf token={csrf} />
            <button type="submit" class="danger small" disabled={passkeys.length === 0}>
              Remove password
            </button>
            {passkeys.length === 0 && <small class="muted"> Add a passkey first.</small>}
          </form>
        )}
      </Section>

      <Section
        title="Two-factor codes"
        description="Asks for a code from an authenticator app after your password. Once you have a passkey or codes, a password alone can't sign in: it always needs one of them too. Passkey sign-ins need nothing else."
      >
        {!user.password_hash ? (
          <p class="muted">Set a password first.</p>
        ) : user.totp_secret ? (
          <form method="post" action="/account/totp/disable" class="inline-edit">
            <Csrf token={csrf} />
            <span class="badge ok">On</span>
            <input
              type="text"
              name="code"
              placeholder="Current code"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength={7}
              required
              aria-label="Current code"
            />
            <button type="submit" class="danger">Turn off</button>
          </form>
        ) : (
          <form method="post" action="/account/totp/start">
            <Csrf token={csrf} />
            <button type="submit">Set up an authenticator app</button>
          </form>
        )}
      </Section>

      <Section title="Sessions" description="Browsers signed in to this server. Apps you've signed in to keep their own sessions.">
        <ul class="rows">
          {sessions.map((s) => (
            <li>
              <div class="grow">
                <strong>{describeAgent(s.user_agent)}</strong>
                {s.id_hash === session.idHash && <span class="badge">This browser</span>}
                <br />
                <small class="muted">
                  {s.ip ?? "unknown IP"} · via {amrLabel(JSON.parse(s.amr) as string[])} · signed in {date(s.created_at)} · active {relative(s.last_seen_at)}
                </small>
              </div>
              <form method="post" action={`/account/sessions/${s.id_hash}/revoke`}>
                <Csrf token={csrf} />
                <button type="submit" class="small">Sign out</button>
              </form>
            </li>
          ))}
        </ul>
        {sessions.length > 1 && (
          <form method="post" action="/account/sessions/revoke-others">
            <Csrf token={csrf} />
            <button type="submit" class="danger small">Sign out everywhere else</button>
          </form>
        )}
      </Section>

      <Section
        title="Delete account"
        description="Permanently deletes your account, passkeys, sessions and app sign-ins. Apps you've used may keep their own copy of your details; ask them separately. This can't be undone."
      >
        <form
          method="post"
          action="/account/delete"
          class="stack"
          data-confirm="Delete your account for good? This can't be undone."
        >
          <Csrf token={csrf} />
          <Field label={`Type your username (${user.username}) to confirm`} name="confirm" required autocomplete="off" maxlength={64} />
          {user.password_hash && (
            <Field label="Password" name="password" type="password" required autocomplete="current-password" maxlength={512} />
          )}
          <div>
            <button type="submit" class="danger">Delete my account</button>
          </div>
        </form>
      </Section>
    </>,
  );
}

account.get("/account", (c) => accountPage(c));

account.post("/account/profile", async (c) => {
  const body = await form(c);
  const update = {
    name: cleanText(body.name, 100),
    email: cleanText(body.email, 254),
    picture: cleanText(body.picture, 2048),
  };
  const problem = emailProblem(update.email) ?? pictureProblem(update.picture);
  if (problem) return accountPage(c, { error: problem, status: 400 });

  const user = await me(c);
  await updateProfile(c.env, user, update);
  await audit(c, "account.profile");

  const emailChanged = update.email !== user.email;
  if (emailChanged && user.email && user.email_verified) {
    // The old address hears about it: the new one isn't verified yet.
    notify(c, user.id, {
      subject: "Your email address was changed",
      summary: update.email
        ? `The email address on your account was changed from ${user.email} to ${update.email}.`
        : `The email address ${user.email} was removed from your account.`,
      by: "self",
      to: user.email,
    });
  } else if (!emailChanged && (update.name !== user.name || update.picture !== user.picture)) {
    notify(c, user.id, { subject: "Your profile was updated", summary: "Your name or picture was changed.", by: "self" });
  }

  if (update.email && update.email !== user.email) {
    const sent = await sendVerificationEmail(c.env, user.id, update.email);
    return c.redirect(`/account?m=${sent === "sent" ? "verify-sent" : "verify-failed"}`);
  }
  return c.redirect("/account?m=profile-saved");
});

account.post("/account/email/verify", async (c) => {
  const user = await me(c);
  if (!user.email || user.email_verified) return c.redirect("/account");
  const sent = await sendVerificationEmail(c.env, user.id, user.email);
  return c.redirect(`/account?m=${sent === "sent" ? "verify-sent" : "verify-failed"}`);
});

// --- passkeys --------------------------------------------------------------------

account.post("/account/passkeys/options", async (c) => {
  return c.json(await registrationOptions(c.env, await me(c)));
});

account.post("/account/passkeys/verify", async (c) => {
  const body = await readJson<{ id?: string; response?: RegistrationResponseJSON; name?: string }>(c);
  if (!body?.id || !body.response) return c.json({ error: "Malformed request." }, 400);

  const name = cleanText(body.name, 60) ?? "Passkey";
  const result = await finishRegistration(c.env, await me(c), body.id, body.response, name);
  if (!result.ok) return c.json({ error: result.error }, 400);

  await audit(c, "account.passkey_added", { detail: name });
  notify(c, c.get("user")!.id, {
    subject: "A passkey was added",
    summary: `A passkey named "${name}" was added to your account. It can sign in without a password.`,
    by: "self",
  });
  return c.json({ redirect: "/account?m=passkey-added" });
});

account.post("/account/passkeys/:id/rename", async (c) => {
  const body = await form(c);
  const name = cleanText(body.name, 60);
  if (!name) return accountPage(c, { error: "Passkeys need a name.", status: 400 });
  await renamePasskey(c.env, c.get("user")!.id, c.req.param("id"), name);
  return c.redirect("/account?m=passkey-renamed");
});

account.post("/account/passkeys/:id/delete", async (c) => {
  const user = await me(c);
  if (!user.password_hash && (await countPasskeys(c.env, user.id)) <= 1) {
    return accountPage(c, {
      error: "That's your only way to sign in. Add another passkey or a password before removing it.",
      status: 400,
    });
  }
  const name = await deletePasskey(c.env, user.id, c.req.param("id"));
  await audit(c, "account.passkey_removed");
  if (name) {
    notify(c, user.id, {
      subject: "A passkey was removed",
      summary: `The passkey "${name}" was removed from your account.`,
      by: "self",
    });
  }
  return c.redirect("/account?m=passkey-removed");
});

// --- password ------------------------------------------------------------------

account.post("/account/password", async (c) => {
  const user = await me(c);
  const body = await form(c);
  const password = body.password ?? "";
  const problem =
    passwordProblem(password, user.username) ??
    (password !== body.confirm ? "The two passwords don't match." : null);
  if (problem) return accountPage(c, { error: problem, status: 400 });

  await setPasswordHash(c.env, user.id, await hashPassword(password));
  await revokeOtherSessions(c.env, user.id, c.get("session")!.idHash);
  await audit(c, "account.password_set");
  notify(c, user.id, {
    subject: user.password_hash ? "Your password was changed" : "A password was added",
    summary: user.password_hash
      ? "Your password was changed, and your other sessions were signed out."
      : "A password was added to your account.",
    by: "self",
  });
  return c.redirect("/account?m=password-set");
});

account.post("/account/password/remove", async (c) => {
  const user = await me(c);
  if ((await countPasskeys(c.env, user.id)) === 0) {
    return accountPage(c, { error: "Add a passkey before removing your password.", status: 400 });
  }
  await setPasswordHash(c.env, user.id, null);
  await audit(c, "account.password_removed");
  notify(c, user.id, {
    subject: "Your password was removed",
    summary: "The password (and any two-factor codes) was removed from your account. It now signs in with passkeys only.",
    by: "self",
  });
  return c.redirect("/account?m=password-removed");
});

// --- TOTP ----------------------------------------------------------------------

account.post("/account/totp/start", async (c) => {
  const user = await me(c);
  if (!user.password_hash) return c.redirect("/account");
  if (user.totp_secret) return c.redirect("/account");
  await setTotpPending(c.env, user.id, await encrypt(c.env.KEY_ENCRYPTION_KEY, generateTotpSecret()));
  return c.redirect("/account/totp");
});

async function totpSetupPage(c: AppContext, error?: string) {
  const user = await me(c);
  if (!user.totp_pending || user.totp_secret) return c.redirect("/account");

  const secret = await decrypt(c.env.KEY_ENCRYPTION_KEY, user.totp_pending);
  const uri = otpauthUri(secret, siteName(c.env), user.username);
  const svg = renderSVG(uri, { border: 2 });
  const qr = `data:image/svg+xml,${encodeURIComponent(svg)}`;

  return render(
    c,
    { title: "Set up two-factor codes", narrow: true, status: error ? 400 : 200 },
    <div class="card">
      <h1>Scan this code</h1>
      <p class="muted">Use any authenticator app (1Password, Aegis, Google Authenticator…), then enter the code it shows.</p>
      <ErrorNote error={error} />
      <img class="qr" src={qr} alt="QR code for your authenticator app" width="220" height="220" />
      <details>
        <summary>Can't scan it?</summary>
        <p>Enter this key instead:</p>
        <p class="secret">
          <code>{secret.match(/.{1,4}/g)?.join(" ")}</code>
        </p>
      </details>
      <form method="post" action="/account/totp/confirm" class="stack">
        <Csrf token={c.get("session")!.csrf} />
        <Field label="Code" name="code" required inputmode="numeric" autocomplete="one-time-code" maxlength={7} autofocus />
        <button type="submit" class="primary wide">
          <Shield class="icon" aria-hidden="true" />
          Turn on
        </button>
      </form>
      <p class="small">
        <a class="btn wide" href="/account">Cancel</a>
      </p>
    </div>,
  );
}

account.get("/account/totp", (c) => totpSetupPage(c));

account.post("/account/totp/confirm", async (c) => {
  const user = await me(c);
  if (!user.totp_pending) return c.redirect("/account");

  const secret = await decrypt(c.env.KEY_ENCRYPTION_KEY, user.totp_pending);
  const step = await verifyTotp(secret, (await form(c)).code ?? "", 0);
  if (step === null) return totpSetupPage(c, "That code didn't match. Check your device's clock and try the next one.");

  await enableTotp(c.env, user.id, user.totp_pending, step);
  await audit(c, "account.totp_enabled");
  notify(c, user.id, {
    subject: "Two-factor codes turned on",
    summary: "Two-factor codes were turned on. Password sign-ins now also need a code or a passkey.",
    by: "self",
  });
  return c.redirect("/account?m=totp-enabled");
});

account.post("/account/totp/disable", async (c) => {
  const user = await me(c);
  if (!user.totp_secret) return c.redirect("/account");

  const secret = await decrypt(c.env.KEY_ENCRYPTION_KEY, user.totp_secret);
  const step = await verifyTotp(secret, (await form(c)).code ?? "", user.totp_last_step);
  if (step === null || !(await claimTotpStep(c.env, user.id, step))) {
    return accountPage(c, { error: "That code didn't work, so two-factor codes are still on.", status: 400 });
  }
  await disableTotp(c.env, user.id);
  await audit(c, "account.totp_disabled");
  notify(c, user.id, {
    subject: "Two-factor codes turned off",
    summary: "Two-factor codes were turned off for your account.",
    by: "self",
  });
  return c.redirect("/account?m=totp-disabled");
});

// --- sessions ------------------------------------------------------------------

account.post("/account/sessions/revoke-others", async (c) => {
  await revokeOtherSessions(c.env, c.get("user")!.id, c.get("session")!.idHash);
  await audit(c, "account.sessions_revoked");
  return c.redirect("/account?m=sessions-revoked");
});

account.post("/account/sessions/:id/revoke", async (c) => {
  const id = c.req.param("id");
  if (id === c.get("session")!.idHash) {
    await endSession(c);
    return c.redirect("/login?m=signed-out");
  }
  await signOutDevice(c.env, c.get("user")!.id, id);
  return c.redirect("/account?m=session-revoked");
});

// --- deletion --------------------------------------------------------------------

account.post("/account/delete", async (c) => {
  const user = await me(c);
  const body = await form(c);

  if ((body.confirm ?? "").trim().toLowerCase() !== user.username.toLowerCase()) {
    return accountPage(c, { error: "Type your username exactly to delete your account.", status: 400 });
  }
  if (user.password_hash && !(await verifyPassword((body.password ?? "").slice(0, 512), user.password_hash))) {
    return accountPage(c, { error: "That password isn't right, so your account wasn't deleted.", status: 400 });
  }
  if (c.get("user")!.isAdmin) {
    const admins = await c.env.DB.prepare(
      `SELECT COUNT(*) AS n FROM user_groups g JOIN users u ON u.id = g.user_id
       WHERE g.group_name = ? AND u.disabled = 0`,
    )
      .bind(ADMIN_GROUP)
      .first<{ n: number }>();
    if ((admins?.n ?? 0) <= 1) {
      return accountPage(c, {
        error: `You're the only admin. Add another member to ${ADMIN_GROUP} before deleting your account.`,
        status: 400,
      });
    }
  }

  // Everything else (passkeys, sessions, tokens, devices, links) goes with the
  // user row. The security log keeps only the id, until it expires.
  notifyAccountDeleted(c, user);
  await deleteUser(c.env, user.id);
  await audit(c, "account.deleted", { actor: null, target: user.id });
  await endSession(c);
  return c.redirect("/login?m=account-deleted");
});
