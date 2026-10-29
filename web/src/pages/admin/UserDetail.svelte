<script lang="ts">
  import Link from "../../lib/icons/Link.svelte";
  import Save from "../../lib/icons/Save.svelte";
  import { api, confirmed } from "../../lib/api";
  import { Action } from "../../lib/action.svelte";
  import { date, plural, relative } from "../../lib/format";
  import { navigate, reload } from "../../lib/router.svelte";
  import AdminTabs from "../../components/AdminTabs.svelte";
  import CopyRow from "../../components/CopyRow.svelte";
  import Field from "../../components/Field.svelte";
  import Flash from "../../components/Flash.svelte";
  import GroupChecks, { type GroupOption } from "../../components/GroupChecks.svelte";
  import Notes from "../../components/Notes.svelte";
  import Section from "../../components/Section.svelte";
  import Title from "../../components/Title.svelte";

  interface UserData {
    id: string;
    username: string;
    name: string | null;
    email: string | null;
    emailVerified: boolean;
    picture: string | null;
    disabled: boolean;
    createdAt: number;
    lastLoginAt: number | null;
    hasPassword: boolean;
    totp: boolean;
    groups: string[];
    passkeys: { id: string; name: string; createdAt: number; lastUsedAt: number | null }[];
    sessionCount: number;
    openLinkExpiresAt: number | null;
    self: boolean;
  }

  let { params }: { params: Record<string, string> } = $props();
  const base = $derived(`/api/admin/users/${encodeURIComponent(params.id ?? "")}`);

  let user = $state<UserData | null>(null);
  let allGroups = $state<GroupOption[]>([]);
  const profile = $state({ username: "", name: "", email: "", picture: "", emailVerified: false });
  let groups = $state<string[]>([]);
  let ttl = $state("3600");
  let link = $state<{ url: string; expiresAt: number } | null>(null);
  let deleteConfirm = $state("");

  const load = new Action();
  const profileAction = new Action();
  const groupsAction = new Action();
  const linkAction = new Action();
  const methodsAction = new Action();
  const accessAction = new Action();
  const deleteAction = new Action();

  async function refresh() {
    const [u, g] = await Promise.all([api<UserData>(base), api<GroupOption[]>("/api/admin/groups")]);
    user = u;
    allGroups = g;
    Object.assign(profile, {
      username: u.username,
      name: u.name ?? "",
      email: u.email ?? "",
      picture: u.picture ?? "",
      emailVerified: u.emailVerified,
    });
    groups = [...u.groups];
  }
  load.run(refresh);

  /** Posts to `base + path`; on success shows the message and reloads this user. */
  async function act(section: Action, path: string, body: object = {}) {
    await section.run(async () => {
      const res = await api<{ message?: string; redirect?: string }>(base + path, body);
      if (res.redirect) return reload(res.redirect);
      await refresh();
      return res;
    });
  }

  function saveProfile(ev: SubmitEvent) {
    ev.preventDefault();
    act(profileAction, "/profile", profile);
  }

  function saveGroups(ev: SubmitEvent) {
    ev.preventDefault();
    act(groupsAction, "/groups", { groups });
  }

  async function createLink(ev: SubmitEvent) {
    ev.preventDefault();
    await linkAction.run(async () => {
      link = await api(base + "/link", { ttl: Number(ttl) });
      await refresh();
    });
  }

  function confirmThen(message: string, section: Action, path: string) {
    if (confirmed(message)) act(section, path);
  }

  async function remove(ev: SubmitEvent) {
    ev.preventDefault();
    const done = await deleteAction.run(() => api(base + "/delete", { confirm: deleteConfirm }));
    if (done) navigate("/admin/users?m=user-deleted");
  }
</script>

<Title text={user ? `@${user.username}` : "User"} />
<AdminTabs />
<p><a class="btn small" href="/admin/users">← All users</a></p>
<Flash />
<Notes error={load.error} />

{#if user}
  <h1>
    {user.name ?? user.username} <small class="muted">@{user.username}</small>
    {#if user.disabled}<span class="badge danger">disabled</span>{/if}
  </h1>
  <p class="muted">
    Subject <code>{user.id}</code> · created {date(user.createdAt)} · last sign-in {relative(user.lastLoginAt)}
  </p>

  <Section title="Profile">
    <Notes ok={profileAction.message} error={profileAction.error} />
    <form class="stack" onsubmit={saveProfile}>
      <div class="grid2">
        <Field label="Username" name="username" bind:value={profile.username} required maxlength={32} autocomplete="off" hint="Apps may use this as a mailbox or URL; changing it can break things there." />
        <Field label="Display name" name="name" bind:value={profile.name} maxlength={100} autocomplete="off" />
        <Field label="Email" name="email" type="email" bind:value={profile.email} maxlength={254} autocomplete="off" />
        <Field label="Picture URL" name="picture" type="url" bind:value={profile.picture} maxlength={2048} autocomplete="off" />
        <label class="check">
          <input type="checkbox" bind:checked={profile.emailVerified} />
          <span>Email is verified</span>
        </label>
      </div>
      <div>
        <button type="submit" disabled={profileAction.busy}><Save class="icon" aria-hidden="true" /> Save profile</button>
      </div>
    </form>
  </Section>

  <Section title="Groups" description="Sent to apps in the `groups` claim, and used to limit who can open each application.">
    <Notes ok={groupsAction.message} error={groupsAction.error} />
    <form class="stack" onsubmit={saveGroups}>
      <GroupChecks groups={allGroups} bind:selected={groups} />
      <div>
        <button type="submit" disabled={groupsAction.busy}><Save class="icon" aria-hidden="true" /> Save groups</button>
      </div>
    </form>
  </Section>

  <Section title="Sign-in link" description="A one-time link that signs this person in so they can add a passkey or password. Use it for new accounts and lost devices.">
    <Notes ok={linkAction.message} error={linkAction.error} />
    {#if link}
      <div class="notice ok">
        <p>
          <strong>Sign-in link</strong> — send this to @{user.username}. It works once and expires {relative(link.expiresAt)}.
          It won't be shown again.
        </p>
        <CopyRow value={link.url} label="Sign-in link" />
      </div>
    {/if}
    {#if user.openLinkExpiresAt}
      <div class="inline-edit">
        <span>An unused link expires {relative(user.openLinkExpiresAt)}.</span>
        <button type="button" class="small" onclick={() => { link = null; act(linkAction, "/link/revoke"); }} disabled={linkAction.busy}>
          Revoke it
        </button>
      </div>
    {/if}
    <form class="inline-edit" onsubmit={createLink}>
      <label>
        Valid for
        <select bind:value={ttl}>
          <option value="900">15 minutes</option>
          <option value="3600">1 hour</option>
          <option value="86400">1 day</option>
          <option value="604800">7 days</option>
        </select>
      </label>
      <button type="submit" class="primary" disabled={linkAction.busy}>
        <Link class="icon" aria-hidden="true" />
        {user.openLinkExpiresAt ? "Replace link" : "Create link"}
      </button>
    </form>
  </Section>

  <Section title="Sign-in methods">
    <Notes ok={methodsAction.message} error={methodsAction.error} />
    <ul class="rows">
      {#each user.passkeys as p (p.id)}
        <li>
          <div class="grow">
            <strong>Passkey: {p.name}</strong>
            <br />
            <small class="muted">added {date(p.createdAt)} · last used {relative(p.lastUsedAt)}</small>
          </div>
          <button
            type="button"
            class="danger small"
            disabled={methodsAction.busy}
            onclick={() => confirmThen(`Remove the passkey "${p.name}"?`, methodsAction, `/passkeys/${encodeURIComponent(p.id)}/delete`)}
          >
            Remove
          </button>
        </li>
      {/each}
      {#if user.hasPassword}
        <li>
          <div class="grow"><strong>Password</strong></div>
          <button
            type="button"
            class="danger small"
            disabled={methodsAction.busy}
            onclick={() => confirmThen("Remove this password (and any two-factor setup)?", methodsAction, "/password/remove")}
          >
            Remove
          </button>
        </li>
      {/if}
      {#if user.totp}
        <li>
          <div class="grow"><strong>Two-factor codes</strong></div>
          <button
            type="button"
            class="danger small"
            disabled={methodsAction.busy}
            onclick={() => confirmThen("Turn off two-factor codes for this account?", methodsAction, "/totp/reset")}
          >
            Turn off
          </button>
        </li>
      {/if}
      {#if !user.passkeys.length && !user.hasPassword}
        <li class="muted">None. Send a sign-in link so they can add one.</li>
      {/if}
    </ul>
  </Section>

  <Section title="Access">
    <Notes ok={accessAction.message} error={accessAction.error} />
    <p class="muted">{plural(user.sessionCount, "active browser session")} on this server.</p>
    <div class="buttons">
      <button
        type="button"
        disabled={accessAction.busy}
        onclick={() => confirmThen("Sign this account out of every browser and application?", accessAction, "/signout")}
      >
        Sign out everywhere
      </button>
      {#if !user.self}
        {#if user.disabled}
          <button type="button" disabled={accessAction.busy} onclick={() => act(accessAction, "/enable")}>Enable account</button>
        {:else}
          <button
            type="button"
            class="danger"
            disabled={accessAction.busy}
            onclick={() => confirmThen("Disable this account? They'll be signed out everywhere.", accessAction, "/disable")}
          >
            Disable account
          </button>
        {/if}
      {/if}
    </div>
  </Section>

  {#if !user.self}
    <Section title="Delete account" description="Permanent. Apps keep whatever they stored about this person; a new account will get a new subject id.">
      <Notes error={deleteAction.error} />
      <form class="inline-edit" onsubmit={remove}>
        <input type="text" bind:value={deleteConfirm} placeholder={`Type ${user.username} to confirm`} required autocomplete="off" aria-label="Confirm username" />
        <button type="submit" class="danger" disabled={deleteAction.busy}>Delete</button>
      </form>
    </Section>
  {/if}
{/if}
