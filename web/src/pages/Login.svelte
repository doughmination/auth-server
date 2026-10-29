<script lang="ts">
  import KeyRound from "../lib/icons/KeyRound.svelte";
  import { api } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import { navigate, query, reload } from "../lib/router.svelte";
  import { session } from "../lib/session.svelte";
  import { conditionalAvailable, getPasskey, passkeyMessage, passkeysSupported } from "../lib/webauthn";
  import Card from "../components/Card.svelte";
  import Field from "../components/Field.svelte";
  import Flash from "../components/Flash.svelte";
  import Notes from "../components/Notes.svelte";

  const q = query();
  const returnTo = safeReturn(q.get("return"));
  const reauth = q.get("reauth") === "1";

  /** Same rule as the server: only paths on this site. */
  function safeReturn(raw: string | null): string {
    if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/apps";
    return raw;
  }

  let username = $state(reauth ? (session.user?.username ?? "") : "");
  let password = $state("");
  const form = new Action();
  let passkeyError = $state("");
  let passkeyBusy = $state(false);
  const supported = passkeysSupported();

  // Already signed in (and not confirming it's you): straight on.
  if (session.user && !reauth) reload(returnTo);
  else if (session.needsSetup) navigate("/setup", { replace: true });

  // Saved passkeys are offered straight from the username field's autofill.
  // Cancelled when the page goes away or the button is used instead.
  let conditional: AbortController | null = null;
  async function startConditional() {
    if (!supported || !(await conditionalAvailable())) return;
    conditional = new AbortController();
    try {
      const to = await getPasskey("/api/login/passkey", { return: returnTo }, { conditional: conditional.signal });
      if (to) reload(to);
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") passkeyError = passkeyMessage(err);
    }
  }
  $effect(() => {
    if (session.user && !reauth) return;
    startConditional();
    return () => conditional?.abort();
  });

  async function passkeySignIn() {
    conditional?.abort();
    passkeyBusy = true;
    passkeyError = "";
    try {
      const to = await getPasskey("/api/login/passkey", { return: returnTo });
      if (to) reload(to);
    } catch (err) {
      passkeyError = passkeyMessage(err);
    } finally {
      passkeyBusy = false;
      startConditional();
    }
  }

  async function passwordSignIn(ev: SubmitEvent) {
    ev.preventDefault();
    await form.run(async () => {
      const res = await api<{ redirect?: string; mfa?: object }>("/api/login/password", {
        username,
        password,
        return: returnTo,
      });
      password = "";
      if (res.mfa) navigate("/login/mfa");
      else if (res.redirect) reload(res.redirect);
    });
  }
</script>

<Card title={reauth ? "Confirm it's you" : "Sign in"} lead={reauth ? "This needs a fresh sign-in. It only takes a moment." : undefined}>
  <Flash />
  <Notes error={passkeyError} />

  <button type="button" class="primary wide" onclick={passkeySignIn} disabled={!supported || passkeyBusy}>
    <KeyRound class="icon" aria-hidden="true" />
    {supported ? "Sign in with a passkey" : "Passkeys aren't supported in this browser"}
  </button>

  <div class="divider"><span>or use a password</span></div>

  <form class="stack" onsubmit={passwordSignIn}>
    <Notes error={form.error} />
    <Field label="Username" name="username" bind:value={username} required autocomplete="username webauthn" maxlength={64} autofocus={!username} />
    <Field label="Password" name="password" type="password" bind:value={password} required autocomplete="current-password" maxlength={512} autofocus={Boolean(username)} />
    <button type="submit" class="wide" disabled={form.busy}>Sign in</button>
  </form>

  {#if !reauth}
    <p class="muted small"><a href="/forgot">Forgot your password?</a></p>
    {#if session.registration}
      <p class="muted small">
        New here? <a href={`/register?${new URLSearchParams({ return: returnTo })}`}>Create an account</a>
      </p>
    {/if}
  {/if}
</Card>
