<script lang="ts" module>
  export interface ClientData {
    id: string;
    name: string;
    homeUrl: string | null;
    isPublic: boolean;
    redirectUris: string[];
    postLogoutRedirectUris: string[];
    allowedGroups: string[];
    issuer: string;
    discovery: string;
  }

  /** Shown once, on the page the app is opened on after creating it. Never kept beyond this tab. */
  export const newSecrets = new Map<string, string>();
</script>

<script lang="ts">
  import { AppWindow } from "@lucide/svelte";
  import { api } from "../../lib/api";
  import { Action } from "../../lib/action.svelte";
  import { navigate } from "../../lib/router.svelte";
  import AdminTabs from "../../components/AdminTabs.svelte";
  import ClientFields, { type ClientValues } from "../../components/ClientFields.svelte";
  import Field from "../../components/Field.svelte";
  import Flash from "../../components/Flash.svelte";
  import type { GroupOption } from "../../components/GroupChecks.svelte";
  import Notes from "../../components/Notes.svelte";
  import Section from "../../components/Section.svelte";
  import Title from "../../components/Title.svelte";

  let clients = $state<ClientData[]>([]);
  let groups = $state<GroupOption[]>([]);
  let values = $state<ClientValues>({ name: "", homeUrl: "", redirectUris: "", postLogoutRedirectUris: "", allowedGroups: [] });
  let type = $state<"confidential" | "public">("confidential");
  let clientId = $state("");
  const load = new Action();
  const create = new Action();

  load.run(async () => {
    [clients, groups] = await Promise.all([api<ClientData[]>("/api/admin/clients"), api<GroupOption[]>("/api/admin/groups")]);
  });

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await create.run(async () => {
      const { id, secret } = await api<{ id: string; secret: string | null }>("/api/admin/clients", { ...values, type, clientId });
      if (secret) newSecrets.set(id, secret);
      navigate(`/admin/clients/${encodeURIComponent(id)}`);
    });
  }
</script>

<Title text="Applications" />
<AdminTabs />
<Flash />
<Notes error={load.error} />

<Section title="Applications" description="Each app that signs people in through this server is an OpenID Connect client.">
  {#if clients.length === 0}
    <p class="muted">No applications yet.</p>
  {:else}
    <div class="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Client id</th><th>Type</th><th>Allowed</th></tr></thead>
        <tbody>
          {#each clients as cl (cl.id)}
            <tr>
              <td>
                <a class="btn small" href={`/admin/clients/${encodeURIComponent(cl.id)}`}>{cl.name}</a>
                {#if !cl.homeUrl}<br /><small class="muted">not on “Your apps”</small>{/if}
              </td>
              <td><code>{cl.id}</code></td>
              <td>{cl.isPublic ? "public (PKCE)" : "confidential"}</td>
              <td>{#each cl.allowedGroups as g (g)}<span class="badge">{g}</span>{:else}everyone{/each}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</Section>

<Section title="Add an application">
  <form class="stack" onsubmit={submit}>
    <Notes error={create.error} />
    <ClientFields bind:values {groups} />
    <fieldset>
      <legend>Type</legend>
      <label class="check">
        <input type="radio" value="confidential" bind:group={type} />
        <span>Confidential <small class="muted">— has a server that can keep a client secret (dough-git, inbox).</small></span>
      </label>
      <label class="check">
        <input type="radio" value="public" bind:group={type} />
        <span>Public <small class="muted">— runs entirely in the browser or on a device; uses PKCE and no secret.</small></span>
      </label>
    </fieldset>
    <details>
      <summary>Advanced</summary>
      <Field
        label="Client id"
        name="client_id"
        bind:value={clientId}
        maxlength={128}
        autocomplete="off"
        hint="Leave blank for a random id. Set it to keep an app's existing client id when moving it over from another provider."
      />
    </details>
    <div>
      <button type="submit" class="primary" disabled={create.busy}>
        <AppWindow class="icon" aria-hidden="true" />
        Create application
      </button>
    </div>
  </form>
</Section>
