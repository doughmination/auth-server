<script lang="ts">
  import { Check, LogIn } from "@lucide/svelte";
  import { api } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import { reload } from "../lib/router.svelte";
  import Card from "../components/Card.svelte";
  import Notes from "../components/Notes.svelte";

  let { params }: { params: Record<string, string> } = $props();
  const path = $derived(`/api/verify-email/${encodeURIComponent(params.token ?? "")}`);

  let email = $state<string | null>(null);
  let done = $state(false);
  const load = new Action();
  const verify = new Action();
  load.run(async () => (email = (await api<{ email: string }>(path)).email));

  // Mail scanners follow GETs, so verifying takes a deliberate click.
  async function confirm() {
    await verify.run(async () => {
      const { signedIn } = await api<{ signedIn: boolean }>(path, {});
      if (signedIn) reload("/settings?m=email-verified");
      else done = true;
    });
  }
</script>

{#if done}
  <Card title="Email verified" lead="Thanks! You can close this tab, or sign in.">
    <p><a class="btn primary" href="/login"><LogIn class="icon" aria-hidden="true" /> Sign in</a></p>
  </Card>
{:else if load.error || verify.error}
  <Card title="This link can't be used" lead="It has expired, was already used, or a newer one was sent. You can send a new one from your settings.">
    <Notes error={verify.error && !verify.error.startsWith("This link") ? verify.error : ""} />
    <p><a class="btn primary" href="/settings">Settings</a></p>
  </Card>
{:else if email}
  <Card title="Verify your email">
    <p class="muted">Confirm that <strong>{email}</strong> is yours.</p>
    <button type="button" class="primary wide" onclick={confirm} disabled={verify.busy}>
      <Check class="icon" aria-hidden="true" />
      Verify
    </button>
  </Card>
{/if}
