/* src/api/admin.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { Hono } from "hono";
import { ADMIN_GROUP, issuer, type AppContext, type AppEnv } from "../env";
import { audit, recentAudit } from "../lib/audit";
import { requireAdmin, requireCsrf, requireUser } from "../lib/guards";
import { body, fail, lines, str, strings } from "../lib/http";
import {
  cleanText,
  clientIdProblem,
  homeUrlProblem,
  emailProblem,
  groupProblem,
  normaliseUsername,
  pictureProblem,
  redirectUriProblem,
  subjectProblem,
  usernameProblem,
} from "../lib/validate";
import {
  createClient,
  deleteClient,
  getClient,
  listClients,
  makeClientPublic,
  rotateClientSecret,
  updateClient,
  type Client,
  type ClientInput,
} from "../data/clients";
import { createGroup, deleteGroup, listGroups, updateGroup } from "../data/groups";
import { listKeys, rotateKeys } from "../data/keys";
import { createLoginLink, hasOpenLoginLink, revokeLoginLinks } from "../data/links";
import { deletePasskey, listPasskeys } from "../data/passkeys";
import { notify } from "../data/notices";
import { builtinReserved, listReserved, lookalikeOf, reserveUsername, unreserveUsername } from "../data/reserved";
import { listSessions } from "../data/sessions";
import {
  adminUpdateUser,
  createUser,
  deleteUser,
  disableTotp,
  getUser,
  groupsFor,
  listUsers,
  revokeAllStatements,
  setDisabled,
  setPasswordHash,
  setUserGroups,
} from "../data/users";

export const admin = new Hono<AppEnv>();

admin.use("/api/admin/*", requireUser, requireAdmin, requireCsrf);

/** Admins may hand out reserved names, but not ones that pass for another account. */
async function lookalikeProblem(c: AppContext, username: string, exceptId: string | null = null): Promise<string | null> {
  const other = await lookalikeOf(c.env, username, exceptId);
  if (!other) return null;
  return other === username ? "That username is already taken." : `That username looks too much like @${other}.`;
}

const notFound = (c: AppContext, what: string) => fail(c, `That ${what} doesn't exist.`, 404);
const ok = (c: AppContext, message: string) => c.json({ message });

// --- users -----------------------------------------------------------------------

admin.get("/api/admin/users", async (c) => {
  const users = await listUsers(c.env);
  return c.json(
    users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      disabled: Boolean(u.disabled),
      groups: u.groups,
      passkeys: u.passkey_count,
      hasPassword: Boolean(u.password_hash),
      totp: Boolean(u.totp_secret),
      lastLoginAt: u.last_login_at,
    })),
  );
});

admin.post("/api/admin/users", async (c) => {
  const b = await body(c);
  const username = normaliseUsername(str(b.username));
  const email = cleanText(str(b.email), 254);
  const subject = cleanText(str(b.subject), 64);
  const problem =
    usernameProblem(username) ??
    emailProblem(email) ??
    (subject ? subjectProblem(subject) : null) ??
    (await lookalikeProblem(c, username));
  if (problem) return fail(c, problem);

  const result = await createUser(c.env, {
    id: subject ?? undefined,
    username,
    name: cleanText(str(b.name), 100),
    email,
    emailVerified: b.emailVerified === true,
  });
  if (!result.ok) return fail(c, result.error, 409);

  const groups = strings(b.groups);
  await setUserGroups(c.env, result.id, groups);
  await audit(c, "admin.user_created", { target: username, detail: groups.join(",") });
  return c.json({ id: result.id, message: "user-created" });
});

admin.get("/api/admin/users/:id", async (c) => {
  const id = c.req.param("id");
  const user = await getUser(c.env, id);
  if (!user) return notFound(c, "user");
  const [groups, passkeys, sessions, openLink] = await Promise.all([
    groupsFor(c.env, id),
    listPasskeys(c.env, id),
    listSessions(c.env, id),
    hasOpenLoginLink(c.env, id),
  ]);
  return c.json({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    emailVerified: Boolean(user.email_verified),
    picture: user.picture,
    disabled: Boolean(user.disabled),
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at,
    hasPassword: Boolean(user.password_hash),
    totp: Boolean(user.totp_secret),
    groups,
    passkeys: passkeys.map((p) => ({ id: p.id, name: p.name, createdAt: p.created_at, lastUsedAt: p.last_used_at })),
    sessionCount: sessions.length,
    openLinkExpiresAt: openLink,
    self: c.get("user")!.id === id,
  });
});

admin.post("/api/admin/users/:id/profile", async (c) => {
  const id = c.req.param("id");
  const b = await body(c);
  const update = {
    username: normaliseUsername(str(b.username)),
    name: cleanText(str(b.name), 100),
    email: cleanText(str(b.email), 254),
    picture: cleanText(str(b.picture), 2048),
    emailVerified: b.emailVerified === true,
  };
  const problem =
    usernameProblem(update.username) ??
    emailProblem(update.email) ??
    pictureProblem(update.picture) ??
    (await lookalikeProblem(c, update.username, id));
  if (problem) return fail(c, problem);

  const before = await getUser(c.env, id);
  if (!before) return notFound(c, "user");
  const error = await adminUpdateUser(c.env, id, update);
  if (error) return fail(c, error, 409);
  await audit(c, "admin.user_updated", { target: id });

  const changed = [
    before.username !== update.username && `username to @${update.username}`,
    before.email !== update.email && (update.email ? `email address to ${update.email}` : "email address (removed)"),
    (before.name !== update.name || before.picture !== update.picture) && "name or picture",
  ].filter((x): x is string => Boolean(x));
  if (changed.length > 0) {
    // A changed address: tell the old one, which the owner can still read.
    const oldAddress = before.email !== update.email && before.email_verified ? before.email : undefined;
    notify(c, id, {
      subject: "An admin updated your account",
      summary: `An administrator changed your ${changed.join(", ")}.`,
      by: "admin",
      ...(oldAddress ? { to: oldAddress } : {}),
    });
  }
  return ok(c, "user-saved");
});

admin.post("/api/admin/users/:id/groups", async (c) => {
  const id = c.req.param("id");
  const groups = strings((await body(c)).groups);
  if (id === c.get("user")!.id && !groups.includes(ADMIN_GROUP)) {
    return fail(c, `You can't remove yourself from ${ADMIN_GROUP}. Ask another admin.`);
  }
  await setUserGroups(c.env, id, groups);
  await audit(c, "admin.user_groups", { target: id, detail: groups.join(",") });
  return ok(c, "groups-saved");
});

const LINK_TTLS = new Set([900, 3600, 86400, 604800]);

/** Returns the link itself: shown once, never stored in plaintext. */
admin.post("/api/admin/users/:id/link", async (c) => {
  const id = c.req.param("id");
  const user = await getUser(c.env, id);
  if (!user) return notFound(c, "user");
  if (user.disabled) return fail(c, "Enable the account before sending a sign-in link.");

  const asked = Number((await body(c)).ttl);
  const ttl = LINK_TTLS.has(asked) ? asked : 3600;
  const link = await createLoginLink(c.env, id, c.get("user")!.id, ttl);
  await audit(c, "admin.link_created", { target: id, detail: `ttl=${ttl}` });
  notify(c, id, {
    subject: "A sign-in link was created for you",
    summary: "An administrator created a one-time link that signs in to your account without a password or passkey.",
    by: "admin",
  });
  return c.json(link);
});

admin.post("/api/admin/users/:id/link/revoke", async (c) => {
  const id = c.req.param("id");
  await revokeLoginLinks(c.env, id);
  await audit(c, "admin.link_revoked", { target: id });
  return ok(c, "link-revoked");
});

admin.post("/api/admin/users/:id/passkeys/:pid/delete", async (c) => {
  const id = c.req.param("id");
  const name = await deletePasskey(c.env, id, c.req.param("pid"));
  if (name) {
    await audit(c, "admin.passkey_removed", { target: id, detail: name });
    notify(c, id, { subject: "A passkey was removed", summary: `An administrator removed your passkey "${name}".`, by: "admin" });
  }
  return ok(c, "credential-removed");
});

admin.post("/api/admin/users/:id/password/remove", async (c) => {
  const id = c.req.param("id");
  await setPasswordHash(c.env, id, null);
  await audit(c, "admin.password_removed", { target: id });
  notify(c, id, {
    subject: "Your password was removed",
    summary: "An administrator removed your password (and any two-factor codes).",
    by: "admin",
  });
  return ok(c, "credential-removed");
});

admin.post("/api/admin/users/:id/totp/reset", async (c) => {
  const id = c.req.param("id");
  await disableTotp(c.env, id);
  await audit(c, "admin.totp_reset", { target: id });
  notify(c, id, {
    subject: "Two-factor codes turned off",
    summary: "An administrator turned off two-factor codes for your account.",
    by: "admin",
  });
  return ok(c, "credential-removed");
});

admin.post("/api/admin/users/:id/signout", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.batch(revokeAllStatements(c.env, id));
  await audit(c, "admin.user_signed_out", { target: id });
  notify(c, id, {
    subject: "You were signed out everywhere",
    summary: "An administrator signed your account out of every browser and app.",
    by: "admin",
  });
  if (id === c.get("user")!.id) return c.json({ redirect: "/login?m=signed-out" });
  return ok(c, "user-signed-out");
});

admin.post("/api/admin/users/:id/disable", async (c) => {
  const id = c.req.param("id");
  if (id === c.get("user")!.id) return fail(c, "You can't disable your own account.");
  await setDisabled(c.env, id, true);
  await revokeLoginLinks(c.env, id);
  await audit(c, "admin.user_disabled", { target: id });
  notify(c, id, { subject: "Your account was disabled", summary: "An administrator disabled your account.", by: "admin" });
  return ok(c, "user-disabled");
});

admin.post("/api/admin/users/:id/enable", async (c) => {
  const id = c.req.param("id");
  await setDisabled(c.env, id, false);
  await audit(c, "admin.user_enabled", { target: id });
  notify(c, id, { subject: "Your account was enabled", summary: "An administrator enabled your account again.", by: "admin" });
  return ok(c, "user-enabled");
});

admin.post("/api/admin/users/:id/delete", async (c) => {
  const id = c.req.param("id");
  const user = await getUser(c.env, id);
  if (!user) return notFound(c, "user");
  if (id === c.get("user")!.id) return fail(c, "You can't delete your own account.");
  if (normaliseUsername(str((await body(c)).confirm)) !== user.username) {
    return fail(c, "Type the username exactly to delete the account.");
  }
  await deleteUser(c.env, id);
  await audit(c, "admin.user_deleted", { target: `${user.username} (${id})` });
  return ok(c, "user-deleted");
});

// --- groups ----------------------------------------------------------------------

admin.get("/api/admin/groups", async (c) => {
  const groups = await listGroups(c.env);
  return c.json(groups.map((g) => ({ name: g.name, description: g.description, members: g.member_count })));
});

admin.post("/api/admin/groups", async (c) => {
  const b = await body(c);
  const name = str(b.name).trim().toLowerCase();
  const problem = groupProblem(name);
  if (problem) return fail(c, problem);
  if (!(await createGroup(c.env, name, cleanText(str(b.description), 200) ?? ""))) {
    return fail(c, "A group with that name already exists.", 409);
  }
  await audit(c, "admin.group_created", { target: name });
  return ok(c, "group-created");
});

admin.post("/api/admin/groups/:name", async (c) => {
  const name = c.req.param("name");
  await updateGroup(c.env, name, cleanText(str((await body(c)).description), 200) ?? "");
  await audit(c, "admin.group_updated", { target: name });
  return ok(c, "group-saved");
});

admin.post("/api/admin/groups/:name/delete", async (c) => {
  const name = c.req.param("name");
  if (name === ADMIN_GROUP) return fail(c, `${ADMIN_GROUP} can't be deleted.`);
  await deleteGroup(c.env, name);
  await audit(c, "admin.group_deleted", { target: name });
  return ok(c, "group-deleted");
});

// --- reserved usernames ------------------------------------------------------------

admin.get("/api/admin/reserved", async (c) => {
  const reserved = await listReserved(c.env);
  return c.json({
    reserved: reserved.map((r) => ({ username: r.username, note: r.note, createdAt: r.created_at })),
    builtin: builtinReserved(),
  });
});

admin.post("/api/admin/reserved", async (c) => {
  const b = await body(c);
  const username = normaliseUsername(str(b.username));
  const problem = usernameProblem(username);
  if (problem) return fail(c, problem);
  if (!(await reserveUsername(c.env, username, cleanText(str(b.note), 200) ?? ""))) {
    return fail(c, "That name is already reserved.", 409);
  }
  await audit(c, "admin.username_reserved", { target: username });
  return ok(c, "name-reserved");
});

admin.post("/api/admin/reserved/:name/delete", async (c) => {
  const name = c.req.param("name");
  await unreserveUsername(c.env, name);
  await audit(c, "admin.username_released", { target: name });
  return ok(c, "name-released");
});

// --- clients -----------------------------------------------------------------------

async function readClient(c: AppContext, b: Record<string, unknown>): Promise<ClientInput | string> {
  const known = new Set((await listGroups(c.env)).map((g) => g.name));
  const name = cleanText(str(b.name), 100);
  const homeUrl = cleanText(str(b.homeUrl), 2048);
  const redirectUris = lines(str(b.redirectUris));
  const postLogoutRedirectUris = lines(str(b.postLogoutRedirectUris));

  if (!name) return "Applications need a name.";
  const urlProblem = homeUrlProblem(homeUrl);
  if (urlProblem) return urlProblem;
  if (redirectUris.length === 0) return "Add at least one redirect URI.";
  if (redirectUris.length + postLogoutRedirectUris.length > 40) return "That's too many URIs.";
  for (const uri of [...redirectUris, ...postLogoutRedirectUris]) {
    const problem = redirectUriProblem(uri);
    if (problem) return problem;
  }
  return {
    name,
    homeUrl,
    redirectUris: [...new Set(redirectUris)],
    postLogoutRedirectUris: [...new Set(postLogoutRedirectUris)],
    allowedGroups: strings(b.allowedGroups).filter((g) => known.has(g)),
  };
}

function clientJson(c: AppContext, client: Client) {
  const iss = issuer(c.env);
  return {
    id: client.id,
    name: client.name,
    homeUrl: client.homeUrl,
    isPublic: client.isPublic,
    redirectUris: client.redirectUris,
    postLogoutRedirectUris: client.postLogoutRedirectUris,
    allowedGroups: client.allowedGroups,
    issuer: iss,
    discovery: `${iss}/.well-known/openid-configuration`,
  };
}

admin.get("/api/admin/clients", async (c) => {
  const clients = await listClients(c.env);
  return c.json(clients.map((cl) => clientJson(c, cl)));
});

/** Confidential clients get their secret back here, exactly once. */
admin.post("/api/admin/clients", async (c) => {
  const b = await body(c);
  const input = await readClient(c, b);
  if (typeof input === "string") return fail(c, input);

  const id = cleanText(str(b.clientId), 128) ?? crypto.randomUUID();
  const idProblem = clientIdProblem(id);
  if (idProblem) return fail(c, idProblem);

  const result = await createClient(c.env, id, b.type !== "public", input);
  if (!result.ok) return fail(c, result.error, 409);
  await audit(c, "admin.client_created", { target: id });
  return c.json({ id, secret: result.secret });
});

admin.get("/api/admin/clients/:id", async (c) => {
  const client = await getClient(c.env, c.req.param("id"));
  if (!client) return notFound(c, "application");
  return c.json(clientJson(c, client));
});

admin.post("/api/admin/clients/:id", async (c) => {
  const id = c.req.param("id");
  if (!(await getClient(c.env, id))) return notFound(c, "application");
  const input = await readClient(c, await body(c));
  if (typeof input === "string") return fail(c, input);
  await updateClient(c.env, id, input);
  await audit(c, "admin.client_updated", { target: id });
  return ok(c, "client-saved");
});

admin.post("/api/admin/clients/:id/secret", async (c) => {
  const id = c.req.param("id");
  if (!(await getClient(c.env, id))) return notFound(c, "application");
  const secret = await rotateClientSecret(c.env, id);
  await audit(c, "admin.client_secret_rotated", { target: id });
  return c.json({ secret });
});

admin.post("/api/admin/clients/:id/public", async (c) => {
  const id = c.req.param("id");
  await makeClientPublic(c.env, id);
  await audit(c, "admin.client_made_public", { target: id });
  return ok(c, "client-public");
});

admin.post("/api/admin/clients/:id/delete", async (c) => {
  const id = c.req.param("id");
  await deleteClient(c.env, id);
  await audit(c, "admin.client_deleted", { target: id });
  return ok(c, "client-deleted");
});

// --- keys + audit ------------------------------------------------------------------

admin.get("/api/admin/keys", async (c) => {
  const keys = await listKeys(c.env);
  return c.json(keys.map((k) => ({ kid: k.kid, alg: k.alg, createdAt: k.created_at, retiredAt: k.retired_at })));
});

admin.post("/api/admin/keys/rotate", async (c) => {
  const kid = await rotateKeys(c.env);
  await audit(c, "admin.keys_rotated", { target: kid });
  return ok(c, "keys-rotated");
});

admin.get("/api/admin/audit", async (c) => {
  const entries = await recentAudit(c);
  return c.json(
    entries.map((e) => ({
      id: e.id,
      at: e.at,
      actor: e.actor_username,
      action: e.action,
      target: e.target,
      ip: e.ip,
      detail: e.detail,
    })),
  );
});
