<script lang="ts">
  import { LogIn, UserPlus } from "@lucide/svelte";
  import { ApiError, api } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import { reload } from "../lib/router.svelte";
  import Card from "../components/Card.svelte";
  import Field from "../components/Field.svelte";
  import Notes from "../components/Notes.svelte";

  let status = $state<"open" | "done" | "unconfigured" | null>(null);
  const values = $state({ token: "", username: "", name: "", email: "" });
  const form = new Action();

  api<{ state: "open" | "done" | "unconfigured" }>("/api/setup").then((r) => (status = r.state));

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await form.run(async () => {
      try {
        reload((await api<{ redirect: string }>("/api/setup", values)).redirect);
      } catch (err) {
        if (err instanceof ApiError && err.data.done) status = "done";
        throw err;
      }
    });
  }
</script>

{#if status === "done"}
  <Card title="Setup is done" lead="This server already has accounts.">
    <p><a class="btn primary" href="/login"><LogIn class="icon" aria-hidden="true" /> Sign in</a></p>
  </Card>
{:else if status === "unconfigured"}
  <Card title="Almost there">
    <p>
      Set a <code>SETUP_TOKEN</code> secret (<code>wrangler secret put SETUP_TOKEN</code>, or <code>.dev.vars</code>
      locally), then reload this page to create the first admin.
    </p>
  </Card>
{:else if status === "open"}
  <Card title="Create the first admin" lead="This page only works while the server has no accounts. You'll add a passkey or password straight after.">
    <form class="stack" onsubmit={submit}>
      <Notes error={form.error} />
      <Field label="Setup token" name="token" type="password" bind:value={values.token} required autocomplete="off" hint="The SETUP_TOKEN secret." autofocus />
      <Field label="Username" name="username" bind:value={values.username} required autocomplete="username" maxlength={32} />
      <Field label="Display name" name="name" bind:value={values.name} autocomplete="name" maxlength={100} />
      <Field label="Email" name="email" type="email" bind:value={values.email} autocomplete="email" maxlength={254} />
      <button type="submit" class="primary wide" disabled={form.busy}>
        <UserPlus class="icon" aria-hidden="true" />
        Create admin account
      </button>
    </form>
  </Card>
{/if}
