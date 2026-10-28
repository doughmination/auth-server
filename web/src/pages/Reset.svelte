<script lang="ts">
  import { KeyRound } from "@lucide/svelte";
  import { api } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import { reload } from "../lib/router.svelte";
  import Card from "../components/Card.svelte";
  import Field from "../components/Field.svelte";
  import Notes from "../components/Notes.svelte";

  let { params }: { params: Record<string, string> } = $props();
  const path = $derived(`/api/reset/${encodeURIComponent(params.token ?? "")}`);

  let username = $state<string | null>(null);
  let password = $state("");
  let confirm = $state("");
  const load = new Action();
  const form = new Action();
  load.run(async () => (username = (await api<{ username: string }>(path)).username));

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await form.run(async () => {
      try {
        reload((await api<{ redirect: string }>(path, { password, confirm })).redirect);
      } finally {
        password = confirm = "";
      }
    });
  }
</script>

{#if load.error}
  <Card title="This link can't be used" lead="It has expired, was already used, or a newer one was sent.">
    <p><a class="btn primary" href="/forgot">Send a new link</a></p>
  </Card>
{:else if username}
  <Card title="Choose a new password">
    <p class="muted">For <strong>@{username}</strong>. Every browser and app signed in to this account will be signed out.</p>
    <form class="stack" onsubmit={submit}>
      <Notes error={form.error} />
      <!-- Lets password managers save the new password against the right account. -->
      <input type="text" name="username" value={username} autocomplete="username" hidden />
      <Field label="New password" name="password" type="password" bind:value={password} required autocomplete="new-password" maxlength={512} hint="At least 10 characters." autofocus />
      <Field label="Confirm password" name="confirm" type="password" bind:value={confirm} required autocomplete="new-password" maxlength={512} />
      <button type="submit" class="primary wide" disabled={form.busy}>
        <KeyRound class="icon" aria-hidden="true" />
        Set password
      </button>
    </form>
  </Card>
{/if}
