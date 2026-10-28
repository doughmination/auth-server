<script lang="ts">
  import { api } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import Card from "../components/Card.svelte";
  import Field from "../components/Field.svelte";
  import Notes from "../components/Notes.svelte";

  let account = $state("");
  let sent = $state(false);
  const form = new Action();

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    // The answer is the same whether or not the account exists.
    await form.run(async () => {
      await api("/api/forgot", { account });
      sent = true;
    });
  }
</script>

<Card title="Forgot your password?">
  {#if sent}
    <p class="notice ok" role="status">
      If that matches an account with a verified email address, we've sent it a link. Check your inbox (and spam).
    </p>
    <p class="muted">No email? Ask an admin for a sign-in link.</p>
  {:else}
    <p class="muted">
      Enter your username or email address. We'll email a link to choose a new password, if the account has a verified
      address.
    </p>
    <form class="stack" onsubmit={submit}>
      <Notes error={form.error} />
      <Field label="Username or email" name="account" bind:value={account} required autocomplete="username" maxlength={254} autofocus />
      <button type="submit" class="primary wide" disabled={form.busy}>Send reset link</button>
    </form>
  {/if}
  <p class="muted small"><a href="/login">Back to sign in</a></p>
</Card>
