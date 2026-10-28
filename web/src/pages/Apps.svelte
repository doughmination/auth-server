<script lang="ts">
  import { ExternalLink } from "@lucide/svelte";
  import { api } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import { session } from "../lib/session.svelte";
  import Flash from "../components/Flash.svelte";
  import Notes from "../components/Notes.svelte";
  import Title from "../components/Title.svelte";

  interface App {
    id: string;
    name: string;
    url: string;
  }

  let apps = $state<App[] | null>(null);
  const load = new Action();
  load.run(async () => (apps = await api<App[]>("/api/apps")));

  function host(url: string): string {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  }
</script>

<Title text="Your apps" />
<h1>Hi, {session.user?.name ?? session.user?.username}</h1>
<Flash />
<Notes error={load.error} />

{#if apps}
  {#if apps.length === 0}
    <section class="panel">
      <h2>No apps yet</h2>
      <p class="muted">
        Apps you can sign in to with this account will show up here.
        {#if session.user?.isAdmin}
          Give an application a website in <a href="/admin/clients">Admin → Applications</a> to list it.
        {/if}
      </p>
    </section>
  {:else}
    <p class="muted">Everything you can sign in to with @{session.user?.username}.</p>
    <ul class="apps">
      {#each apps as app (app.id)}
        <li>
          <a class="app-tile" href={app.url} rel="noopener">
            <span class="app-mark" aria-hidden="true">{app.name.slice(0, 1).toUpperCase()}</span>
            <span class="app-text">
              <strong>{app.name}</strong>
              <small class="muted">{host(app.url)}</small>
            </span>
            <ExternalLink class="icon" aria-hidden="true" />
          </a>
        </li>
      {/each}
    </ul>
  {/if}
{/if}
