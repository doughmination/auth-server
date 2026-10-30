<script lang="ts">
  import { untrack } from "svelte";
  import Save from "../../lib/icons/Save.svelte";
  import { api, confirmed } from "../../lib/api";
  import { Action } from "../../lib/action.svelte";
  import { navigate } from "../../lib/router.svelte";
  import AdminTabs from "../../components/AdminTabs.svelte";
  import ClientFields, { type ClientValues } from "../../components/ClientFields.svelte";
  import CopyRow from "../../components/CopyRow.svelte";
  import type { GroupOption } from "../../components/GroupChecks.svelte";
  import Notes from "../../components/Notes.svelte";
  import Section from "../../components/Section.svelte";
  import Title from "../../components/Title.svelte";
  import { newSecrets, type ClientData } from "./Clients.svelte";

  let { params }: { params: Record<string, string> } = $props();
  const base = $derived(`/api/admin/clients/${encodeURIComponent(params.id ?? "")}`);

  let client = $state<ClientData | null>(null);
  let groups = $state<GroupOption[]>([]);
  let values = $state<ClientValues>({ name: "", homeUrl: "", iconUrl: "", redirectUris: "", postLogoutRedirectUris: "", allowedGroups: [] });
  // A secret just created on the previous page (taken, so it's only ever shown
  // once), or one from rotating it here.
  let secret = $state<string | null>(
    untrack(() => {
      const created = newSecrets.get(params.id ?? "") ?? null;
      newSecrets.delete(params.id ?? "");
      return created;
    }),
  );

  const load = new Action();
  const settings = new Action();
  const secretAction = new Action();
  const deleteAction = new Action();

  async function refresh() {
    const [c, g] = await Promise.all([api<ClientData>(base), api<GroupOption[]>("/api/admin/groups")]);
    client = c;
    groups = g;
    values = {
      name: c.name,
      homeUrl: c.homeUrl ?? "",
      iconUrl: c.iconUrl ?? "",
      redirectUris: c.redirectUris.join("\n"),
      postLogoutRedirectUris: c.postLogoutRedirectUris.join("\n"),
      allowedGroups: [...c.allowedGroups],
    };
  }
  load.run(refresh);

  async function save(ev: SubmitEvent) {
    ev.preventDefault();
    await settings.run(async () => {
      const res = await api(base, values);
      await refresh();
      return res;
    });
  }

  async function rotate() {
    const message = client!.isPublic
      ? "Give this app a secret and make it confidential?"
      : "Replace the secret? The old one stops working immediately.";
    if (!confirmed(message)) return;
    await secretAction.run(async () => {
      secret = (await api<{ secret: string }>(`${base}/secret`, {})).secret;
      await refresh();
    });
  }

  async function makePublic() {
    if (!confirmed("Remove the secret and make this a public PKCE client?")) return;
    await secretAction.run(async () => {
      const res = await api(`${base}/public`, {});
      secret = null;
      await refresh();
      return res;
    });
  }

  async function remove() {
    if (!confirmed(`Delete ${client!.name}? People won't be able to sign in to it.`)) return;
    const done = await deleteAction.run(() => api(`${base}/delete`, {}));
    if (done) navigate("/admin/clients?m=client-deleted");
  }
</script>

<Title text={client?.name ?? "Application"} />
<AdminTabs />
<p><a class="btn small" href="/admin/clients">← All applications</a></p>
<Notes error={load.error} />

{#if client}
  <h1>{client.name}</h1>

  {#if secret}
    <div class="notice ok">
      <p><strong>Client secret</strong> — copy it into the app's configuration now. It won't be shown again.</p>
      <CopyRow value={secret} label="Client secret" />
    </div>
  {/if}

  <Section title="Connecting the app">
    <dl class="kv">
      {#each [
        ["Issuer", client.issuer],
        ["Discovery", client.discovery],
        ["Client id", client.id],
        ["Token auth", client.isPublic ? "none (PKCE)" : "client_secret_basic or client_secret_post"],
        ["Scopes", "openid profile email groups (+ offline_access for refresh tokens)"],
      ] as [k, v] (k)}
        <dt>{k}</dt>
        <dd><code>{v}</code></dd>
      {/each}
    </dl>
  </Section>

  <Section title="Settings">
    <form class="stack" onsubmit={save}>
      <Notes ok={settings.message} error={settings.error} />
      <ClientFields bind:values {groups} />
      <div>
        <button type="submit" disabled={settings.busy}><Save class="icon" aria-hidden="true" /> Save</button>
      </div>
    </form>
  </Section>

  <Section title="Client secret">
    <Notes ok={secretAction.message} error={secretAction.error} />
    <p class="muted">
      {client.isPublic
        ? "This is a public client: it has no secret and must use PKCE."
        : "Rotating the secret breaks the app until it's given the new one."}
    </p>
    <div class="buttons">
      <button type="button" onclick={rotate} disabled={secretAction.busy}>{client.isPublic ? "Create a secret" : "Rotate secret"}</button>
      {#if !client.isPublic}
        <button type="button" class="danger" onclick={makePublic} disabled={secretAction.busy}>Make public</button>
      {/if}
    </div>
  </Section>

  <Section title="Delete application" description="Its refresh tokens stop working immediately; issued access tokens are refused by /userinfo.">
    <Notes error={deleteAction.error} />
    <button type="button" class="danger" onclick={remove} disabled={deleteAction.busy}>Delete</button>
  </Section>
{/if}
