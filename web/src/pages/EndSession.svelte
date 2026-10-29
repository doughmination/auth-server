<script lang="ts">
  import LogOut from "../lib/icons/LogOut.svelte";
  import { api } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import { navigate, query, reload, route } from "../lib/router.svelte";
  import Card from "../components/Card.svelte";
  import Notes from "../components/Notes.svelte";

  // RP-initiated logout without proof it came from the app: confirm first.
  const q = query();
  const request = {
    client_id: q.get("client_id") ?? "",
    post_logout_redirect_uri: q.get("post_logout_redirect_uri") ?? "",
    state: q.get("state") ?? "",
  };

  let info = $state<{ client: string | null; username: string | null; returnTo: string | null } | null>(null);
  const load = new Action();
  const act = new Action();

  load.run(async () => {
    try {
      info = await api(`/api/end-session${route.search}`);
    } catch (err) {
      navigate("/error?code=logout_bad_redirect", { replace: true });
      throw err;
    }
  });

  async function signOut() {
    await act.run(async () => reload((await api<{ redirect: string }>("/api/end-session", request)).redirect));
  }
</script>

{#if info}
  <Card title="Sign out?">
    <p class="muted">
      {info.client ? `${info.client} wants to sign you out` : "Sign out"}{info.username ? ` of @${info.username}` : ""} on this server.
    </p>
    <Notes error={act.error} />
    <button type="button" class="primary wide" onclick={signOut} disabled={act.busy}>
      <LogOut class="icon" aria-hidden="true" />
      Sign out
    </button>
    {#if info.returnTo}
      <p class="small"><a class="btn wide" href={info.returnTo}>Stay signed in and go back</a></p>
    {/if}
  </Card>
{/if}
