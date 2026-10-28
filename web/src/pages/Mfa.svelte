<script lang="ts">
  import { KeyRound, LogIn } from "@lucide/svelte";
  import { ApiError, api } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import { navigate, reload } from "../lib/router.svelte";
  import { getPasskey, passkeyMessage, passkeysSupported } from "../lib/webauthn";
  import Card from "../components/Card.svelte";
  import Field from "../components/Field.svelte";
  import Notes from "../components/Notes.svelte";

  let step = $state<{ totp: boolean; passkey: boolean } | null>(null);
  let code = $state("");
  const form = new Action();
  let passkeyError = $state("");
  let passkeyBusy = $state(false);
  const supported = passkeysSupported();

  /** The half-finished sign-in is gone (expired, or too many tries): back to the start. */
  function restartIfNeeded(err: unknown) {
    if (err instanceof ApiError && err.data.restart) navigate("/login", { replace: true });
  }

  api<{ totp: boolean; passkey: boolean }>("/api/login/mfa").then((s) => (step = s), restartIfNeeded);

  async function submitCode(ev: SubmitEvent) {
    ev.preventDefault();
    await form.run(async () => {
      try {
        const { redirect } = await api<{ redirect: string }>("/api/login/mfa", { code });
        reload(redirect);
      } catch (err) {
        code = "";
        restartIfNeeded(err);
        throw err;
      }
    });
  }

  async function usePasskey() {
    passkeyBusy = true;
    passkeyError = "";
    try {
      const to = await getPasskey("/api/login/mfa/passkey");
      if (to) reload(to);
    } catch (err) {
      restartIfNeeded(err);
      passkeyError = passkeyMessage(err);
    } finally {
      passkeyBusy = false;
    }
  }
</script>

<Card
  title="One more step"
  lead={!step
    ? undefined
    : step.totp && step.passkey
      ? "Use one of your passkeys, or enter the code from your authenticator app."
      : step.passkey
        ? "Use one of your passkeys to finish signing in."
        : "Open your authenticator app and enter the 6-digit code for this account."}
>
  {#if step}
    <Notes error={passkeyError} />
    {#if step.passkey}
      <button type="button" class={step.totp ? "wide" : "primary wide"} onclick={usePasskey} disabled={!supported || passkeyBusy}>
        <KeyRound class="icon" aria-hidden="true" />
        {supported ? "Use a passkey" : "Passkeys aren't supported in this browser"}
      </button>
    {/if}
    {#if step.passkey && step.totp}
      <div class="divider"><span>or enter a code</span></div>
    {/if}
    {#if step.totp}
      <form class="stack" onsubmit={submitCode}>
        <Notes error={form.error} />
        <Field label="Code" name="code" bind:value={code} required autocomplete="one-time-code" inputmode="numeric" pattern={"[0-9 ]{6,7}"} maxlength={7} autofocus />
        <button type="submit" class="primary wide" disabled={form.busy}>
          <LogIn class="icon" aria-hidden="true" />
          Continue
        </button>
      </form>
    {/if}
  {/if}
  <p class="muted small"><a class="btn wide" href="/login">Start over</a></p>
</Card>
