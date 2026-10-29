<script lang="ts">
  import Shield from "../lib/icons/Shield.svelte";
  import { api } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import { navigate } from "../lib/router.svelte";
  import Card from "../components/Card.svelte";
  import Field from "../components/Field.svelte";
  import Notes from "../components/Notes.svelte";

  let setup = $state<{ qr: string; secret: string } | null>(null);
  let code = $state("");
  const start = new Action();
  const form = new Action();

  // Each visit makes a fresh secret; it only takes effect once a code from it is confirmed.
  start.run(async () => (setup = await api("/api/account/totp/start", {})));

  async function confirm(ev: SubmitEvent) {
    ev.preventDefault();
    const done = await form.run(() => api("/api/account/totp/confirm", { code }));
    if (done) navigate("/settings?m=totp-enabled");
    else code = "";
  }
</script>

<Card title="Scan this code" lead="Use any authenticator app (1Password, Aegis, Google Authenticator…), then enter the code it shows.">
  <Notes error={start.error || form.error} />
  {#if setup}
    <img class="qr" src={setup.qr} alt="QR code for your authenticator app" width="220" height="220" />
    <details>
      <summary>Can't scan it?</summary>
      <p>Enter this key instead:</p>
      <p class="secret"><code>{setup.secret}</code></p>
    </details>
    <form class="stack" onsubmit={confirm}>
      <Field label="Code" name="code" bind:value={code} required inputmode="numeric" autocomplete="one-time-code" maxlength={7} autofocus />
      <button type="submit" class="primary wide" disabled={form.busy}>
        <Shield class="icon" aria-hidden="true" />
        Turn on
      </button>
    </form>
  {/if}
  <p class="small"><a class="btn wide" href="/settings">Cancel</a></p>
</Card>
