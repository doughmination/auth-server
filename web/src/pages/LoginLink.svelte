<script lang="ts">
  import LogIn from "../lib/icons/LogIn.svelte";
  import { api } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import { reload } from "../lib/router.svelte";
  import { session } from "../lib/session.svelte";
  import Card from "../components/Card.svelte";
  import Notes from "../components/Notes.svelte";

  let { params }: { params: Record<string, string> } = $props();
  const path = $derived(`/api/login/link/${encodeURIComponent(params.token ?? "")}`);

  let target = $state<{ userId: string; username: string; name: string | null } | null>(null);
  const load = new Action();
  const use = new Action();
  load.run(async () => (target = await api(path)));

  // Link scanners follow GETs, so using the link takes a deliberate click.
  async function signIn() {
    await use.run(async () => reload((await api<{ redirect: string }>(path, {})).redirect));
  }
</script>

{#if load.error}
  <Card title="This link can't be used" lead="It has expired, was already used, or was replaced by a newer one. Ask an admin for a new link." />
{:else if target}
  <Card title={`Sign in as ${target.name ?? target.username}`}>
    <p class="muted">
      This one-time link signs you in as <strong>@{target.username}</strong>. It stops working once it's used.
    </p>
    {#if session.user && session.user.id !== target.userId}
      <p class="notice">You'll be signed out of @{session.user.username} on this browser.</p>
    {/if}
    <Notes error={use.error} />
    <button type="button" class="primary wide" onclick={signIn} disabled={use.busy}>
      <LogIn class="icon" aria-hidden="true" />
      Continue
    </button>
  </Card>
{/if}
