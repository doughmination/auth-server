<script lang="ts">
  import { LogIn, UserPlus } from "@lucide/svelte";
  import { api } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import { navigate, query, reload } from "../lib/router.svelte";
  import { session } from "../lib/session.svelte";
  import Card from "../components/Card.svelte";
  import Field from "../components/Field.svelte";
  import Notes from "../components/Notes.svelte";

  const PASSWORD_MIN = 10;
  const returnTo = query().get("return") ?? "/apps";

  if (session.user) reload(returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/apps");
  else if (session.needsSetup) navigate("/setup", { replace: true });

  const values = $state({ username: "", name: "", email: "", password: "", confirm: "" });
  const form = new Action();

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await form.run(async () => {
      try {
        reload((await api<{ redirect: string }>("/api/register", { ...values, return: returnTo })).redirect);
      } finally {
        // Never keep the password around after a failed attempt.
        values.password = values.confirm = "";
      }
    });
  }
</script>

{#if !session.registration}
  <Card title="Sign-ups are closed" lead="Accounts on this server are created by an admin.">
    <p><a class="btn primary" href="/login"><LogIn class="icon" aria-hidden="true" /> Sign in</a></p>
  </Card>
{:else}
  <Card title="Create an account" lead="You can add a passkey straight after.">
    <form class="stack" onsubmit={submit}>
      <Notes error={form.error} />
      <Field label="Username" name="username" bind:value={values.username} required autocomplete="username" maxlength={32} autofocus hint="Lowercase letters, digits, dots, dashes or underscores. You can't change it later." />
      <Field label="Display name" name="name" bind:value={values.name} autocomplete="name" maxlength={100} />
      <Field label="Email" name="email" type="email" bind:value={values.email} required autocomplete="email" maxlength={254} hint="We'll send a link to verify it." />
      <Field label="Password" name="password" type="password" bind:value={values.password} required autocomplete="new-password" maxlength={512} hint={`At least ${PASSWORD_MIN} characters.`} />
      <Field label="Confirm password" name="confirm" type="password" bind:value={values.confirm} required autocomplete="new-password" maxlength={512} />
      <p class="muted small">
        By creating an account you agree to the <a href="/terms">terms</a> and <a href="/privacy">privacy policy</a>.
      </p>
      <button type="submit" class="primary wide" disabled={form.busy}>
        <UserPlus class="icon" aria-hidden="true" />
        Create account
      </button>
    </form>
    <p class="muted small">
      Already have an account? <a href={`/login?${new URLSearchParams({ return: returnTo })}`}>Sign in</a>
    </p>
  </Card>
{/if}
