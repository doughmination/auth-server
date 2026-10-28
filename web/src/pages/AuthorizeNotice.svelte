<script lang="ts">
  import { api } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import { navigate, reload, route } from "../lib/router.svelte";
  import Card from "../components/Card.svelte";
  import Notes from "../components/Notes.svelte";

  // /authorize sends people here (with its own query) when it has something to
  // explain. Asking the API again keeps the decision on the server.
  type Notice =
    | { kind: "error"; code: string }
    | { kind: "redirect"; url: string }
    | { kind: "denied"; client: string; username: string; back: string }
    | { kind: "verify-email"; client: string; email: string | null; retry: string };

  let notice = $state<Notice | null>(null);
  const load = new Action();
  const signOut = new Action();

  load.run(async () => {
    const n = await api<Notice>(`/api/authorize/notice${route.search}`);
    if (n.kind === "redirect") reload(n.url);
    else if (n.kind === "error") navigate(`/error?code=${encodeURIComponent(n.code)}`, { replace: true });
    else notice = n;
  });

  async function switchAccount() {
    // Sign out, then sign in again and pick up this same request.
    await signOut.run(async () => {
      await api("/api/logout", {});
      reload(`/login?${new URLSearchParams({ return: `/authorize${route.search}` })}`);
    });
  }
</script>

<Notes error={load.error} />
{#if notice?.kind === "denied"}
  <Card title={`No access to ${notice.client}`}>
    <p class="muted">
      You're signed in as <strong>@{notice.username}</strong>, which isn't allowed to use {notice.client}. If you think
      it should be, ask an admin.
    </p>
    <Notes error={signOut.error} />
    <button type="button" class="wide" onclick={switchAccount} disabled={signOut.busy}>Sign in as someone else</button>
    <p class="small"><a class="btn wide" href={notice.back}>Back to {notice.client}</a></p>
  </Card>
{:else if notice?.kind === "verify-email"}
  <Card title="Verify your email first">
    <p class="muted">
      {#if notice.email}
        We sent a link to <strong>{notice.email}</strong>. Open it, then come back here.
      {:else}
        Add an email address in your settings and verify it to use {notice.client}.
      {/if}
    </p>
    <p><a class="btn primary wide" href={notice.retry}>I've verified it, continue</a></p>
    <p><a class="btn wide" href="/settings">Settings (resend the link)</a></p>
  </Card>
{/if}
