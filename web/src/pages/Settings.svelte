<script lang="ts">
  import KeyRound from "../lib/icons/KeyRound.svelte";
  import Save from "../lib/icons/Save.svelte";
  import { api, confirmed } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import { date, relative } from "../lib/format";
  import { navigate, reload } from "../lib/router.svelte";
  import { createPasskey, passkeyMessage, passkeysSupported } from "../lib/webauthn";
  import Field from "../components/Field.svelte";
  import Flash from "../components/Flash.svelte";
  import Notes from "../components/Notes.svelte";
  import Section from "../components/Section.svelte";
  import Title from "../components/Title.svelte";

  interface AccountData {
    username: string;
    name: string | null;
    email: string | null;
    emailVerified: boolean;
    picture: string | null;
    hasPassword: boolean;
    totp: boolean;
    recentAuth: boolean;
    passkeys: { id: string; name: string; synced: boolean; createdAt: number; lastUsedAt: number | null }[];
    sessions: {
      id: string;
      current: boolean;
      device: string;
      ip: string | null;
      method: string;
      createdAt: number;
      lastSeenAt: number;
    }[];
  }

  const PASSWORD_MIN = 10;

  let data = $state<AccountData | null>(null);
  const profile = $state({ name: "", email: "", picture: "" });
  const passwords = $state({ password: "", confirm: "" });
  const removal = $state({ confirm: "", password: "" });
  let newPasskeyName = $state("");
  let totpCode = $state("");
  let renames = $state<Record<string, string>>({});

  // One Action per section, so each shows its own result next to its form.
  const load = new Action();
  const profileAction = new Action();
  const passkeyAction = new Action();
  const passwordAction = new Action();
  const totpAction = new Action();
  const sessionAction = new Action();
  const deleteAction = new Action();

  async function refresh() {
    const d = await api<AccountData>("/api/account");
    data = d;
    Object.assign(profile, { name: d.name ?? "", email: d.email ?? "", picture: d.picture ?? "" });
    renames = Object.fromEntries(d.passkeys.map((p) => [p.id, p.name]));
  }
  load.run(refresh);

  /** Runs `call` in a section; on success shows its message and reloads the page's data. */
  async function act(section: Action, call: () => Promise<{ message?: string | null; redirect?: string }>) {
    await section.run(async () => {
      const res = await call();
      if (res.redirect) return reload(res.redirect);
      await refresh();
      return res;
    });
  }

  const post = (path: string, body: object = {}) => api<{ message?: string; redirect?: string }>(path, body);

  function saveProfile(ev: SubmitEvent) {
    ev.preventDefault();
    act(profileAction, () => post("/api/account/profile", profile));
  }

  async function addPasskey(ev: SubmitEvent) {
    ev.preventDefault();
    passkeyAction.busy = true;
    passkeyAction.error = "";
    passkeyAction.message = "";
    try {
      if (await createPasskey(newPasskeyName.trim())) {
        newPasskeyName = "";
        await refresh();
        passkeyAction.message = "Passkey added.";
      }
    } catch (err) {
      passkeyAction.error = passkeyMessage(err);
    } finally {
      passkeyAction.busy = false;
    }
  }

  function renamePasskey(ev: SubmitEvent, id: string) {
    ev.preventDefault();
    act(passkeyAction, () => post(`/api/account/passkeys/${encodeURIComponent(id)}/rename`, { name: renames[id] }));
  }

  function removePasskey(id: string, name: string) {
    if (!confirmed(`Remove the passkey "${name}"?`)) return;
    act(passkeyAction, () => post(`/api/account/passkeys/${encodeURIComponent(id)}/delete`));
  }

  function setPassword(ev: SubmitEvent) {
    ev.preventDefault();
    act(passwordAction, async () => {
      try {
        return await post("/api/account/password", passwords);
      } finally {
        passwords.password = passwords.confirm = "";
      }
    });
  }

  function removePassword() {
    if (!confirmed("Remove your password? You'll only be able to sign in with a passkey.")) return;
    act(passwordAction, () => post("/api/account/password/remove"));
  }

  function disableTotp(ev: SubmitEvent) {
    ev.preventDefault();
    act(totpAction, async () => {
      try {
        return await post("/api/account/totp/disable", { code: totpCode });
      } finally {
        totpCode = "";
      }
    });
  }

  function resendVerification() {
    act(profileAction, () => post("/api/account/email/verify"));
  }

  function revokeSession(id: string) {
    act(sessionAction, () => post(`/api/account/sessions/${encodeURIComponent(id)}/revoke`));
  }

  function revokeOthers() {
    act(sessionAction, () => post("/api/account/sessions/revoke-others"));
  }

  function deleteAccount(ev: SubmitEvent) {
    ev.preventDefault();
    if (!confirmed("Delete your account for good? This can't be undone.")) return;
    act(deleteAction, () => post("/api/account/delete", removal));
  }

  const supported = passkeysSupported();
</script>

<Title text="Settings" />

{#if load.error}
  <Notes error={load.error} />
{:else if data}
  <h1>Settings</h1>
  <Flash />
  {#if !data.recentAuth}
    <p class="notice">
      Changing your password, passkeys, two-factor codes or email asks you to
      <a href={`/login?${new URLSearchParams({ return: "/settings", reauth: "1" })}`} data-reload>confirm it's you</a> first.
    </p>
  {/if}

  <Section title="Profile" description="Shared with the apps you sign in to.">
    <Notes ok={profileAction.message} error={profileAction.error} />
    <form class="stack" onsubmit={saveProfile}>
      <label class="field">
        <span>Username</span>
        <input type="text" value={data.username} disabled />
        <small class="muted">Only an admin can change this.</small>
      </label>
      <Field label="Display name" name="name" bind:value={profile.name} autocomplete="name" maxlength={100} />
      <Field
        label="Email"
        name="email"
        type="email"
        bind:value={profile.email}
        autocomplete="email"
        maxlength={254}
        hint={data.email ? (data.emailVerified ? "Verified." : "Not verified.") : undefined}
      />
      <Field label="Picture URL" name="picture" type="url" bind:value={profile.picture} maxlength={2048} placeholder="https://…" />
      <div>
        <button type="submit" disabled={profileAction.busy}><Save class="icon" aria-hidden="true" /> Save profile</button>
      </div>
    </form>
    {#if data.email && !data.emailVerified}
      <div class="inline-edit">
        <small class="muted">{data.email} isn't verified yet.</small>
        <button type="button" class="small" onclick={resendVerification} disabled={profileAction.busy}>
          Resend verification email
        </button>
      </div>
    {/if}
  </Section>

  <Section title="Passkeys" description="The quickest and safest way to sign in: your device unlocks with a fingerprint, face or PIN.">
    <Notes ok={passkeyAction.message} error={passkeyAction.error} />
    {#if data.passkeys.length === 0}
      <p class="muted">No passkeys yet.</p>
    {:else}
      <ul class="rows">
        {#each data.passkeys as p (p.id)}
          <li>
            <div class="grow">
              <form class="inline-edit" onsubmit={(ev) => renamePasskey(ev, p.id)}>
                <input type="text" bind:value={renames[p.id]} maxlength={60} aria-label="Passkey name" required />
                <button type="submit" class="small" disabled={passkeyAction.busy}>Rename</button>
              </form>
              <small class="muted">
                {p.synced ? "Synced" : "This device only"} · added {date(p.createdAt)} · last used {relative(p.lastUsedAt)}
              </small>
            </div>
            <button type="button" class="danger small" onclick={() => removePasskey(p.id, p.name)} disabled={passkeyAction.busy}>
              Remove
            </button>
          </li>
        {/each}
      </ul>
    {/if}
    <form class="inline-edit" onsubmit={addPasskey}>
      <input type="text" bind:value={newPasskeyName} placeholder="Name, e.g. Phone" maxlength={60} aria-label="New passkey name" />
      <button type="submit" class="primary" disabled={!supported || passkeyAction.busy}>
        <KeyRound class="icon" aria-hidden="true" />
        {supported ? "Add a passkey" : "Passkeys aren't supported in this browser"}
      </button>
    </form>
  </Section>

  <Section title="Password">
    <Notes ok={passwordAction.message} error={passwordAction.error} />
    <p class="muted">
      {data.hasPassword
        ? "You can sign in with a password."
        : "No password set. Add one as a fallback for devices without your passkeys."}
    </p>
    <form class="stack" onsubmit={setPassword}>
      <input type="text" name="username" value={data.username} autocomplete="username" hidden />
      <Field
        label={data.hasPassword ? "New password" : "Password"}
        name="password"
        type="password"
        bind:value={passwords.password}
        required
        autocomplete="new-password"
        maxlength={512}
        hint={`At least ${PASSWORD_MIN} characters. A long phrase beats a short tricky one.`}
      />
      <Field label="Confirm password" name="confirm" type="password" bind:value={passwords.confirm} required autocomplete="new-password" maxlength={512} />
      <div>
        <button type="submit" disabled={passwordAction.busy}>{data.hasPassword ? "Change password" : "Set password"}</button>
      </div>
    </form>
    {#if data.hasPassword}
      <p>
        <button type="button" class="danger small" onclick={removePassword} disabled={data.passkeys.length === 0 || passwordAction.busy}>
          Remove password
        </button>
        {#if data.passkeys.length === 0}<small class="muted"> Add a passkey first.</small>{/if}
      </p>
    {/if}
  </Section>

  <Section
    title="Two-factor codes"
    description="Asks for a code from an authenticator app after your password. Once you have a passkey or codes, a password alone can't sign in: it always needs one of them too. Passkey sign-ins need nothing else."
  >
    <Notes ok={totpAction.message} error={totpAction.error} />
    {#if !data.hasPassword}
      <p class="muted">Set a password first.</p>
    {:else if data.totp}
      <form class="inline-edit" onsubmit={disableTotp}>
        <span class="badge ok">On</span>
        <input
          type="text"
          bind:value={totpCode}
          placeholder="Current code"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength={7}
          required
          aria-label="Current code"
        />
        <button type="submit" class="danger" disabled={totpAction.busy}>Turn off</button>
      </form>
    {:else}
      <button type="button" onclick={() => navigate("/settings/totp")}>Set up an authenticator app</button>
    {/if}
  </Section>

  <Section title="Sessions" description="Browsers signed in to this server. Apps you've signed in to keep their own sessions.">
    <Notes ok={sessionAction.message} error={sessionAction.error} />
    <ul class="rows">
      {#each data.sessions as s (s.id)}
        <li>
          <div class="grow">
            <strong>{s.device}</strong>
            {#if s.current}<span class="badge">This browser</span>{/if}
            <br />
            <small class="muted">
              {s.ip ?? "unknown IP"} · via {s.method} · signed in {date(s.createdAt)} · active {relative(s.lastSeenAt)}
            </small>
          </div>
          <button type="button" class="small" onclick={() => revokeSession(s.id)} disabled={sessionAction.busy}>Sign out</button>
        </li>
      {/each}
    </ul>
    {#if data.sessions.length > 1}
      <button type="button" class="danger small" onclick={revokeOthers} disabled={sessionAction.busy}>Sign out everywhere else</button>
    {/if}
  </Section>

  <Section
    title="Delete account"
    description="Permanently deletes your account, passkeys, sessions and app sign-ins. Apps you've used may keep their own copy of your details; ask them separately. This can't be undone."
  >
    <Notes error={deleteAction.error} />
    <form class="stack" onsubmit={deleteAccount}>
      <Field label={`Type your username (${data.username}) to confirm`} name="confirm" bind:value={removal.confirm} required autocomplete="off" maxlength={64} />
      {#if data.hasPassword}
        <Field label="Password" name="password" type="password" bind:value={removal.password} required autocomplete="current-password" maxlength={512} />
      {/if}
      <div>
        <button type="submit" class="danger" disabled={deleteAction.busy}>Delete my account</button>
      </div>
    </form>
  </Section>
{/if}
