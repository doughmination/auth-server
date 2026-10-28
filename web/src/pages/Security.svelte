<script lang="ts">
  import { LogIn, LogOut } from "@lucide/svelte";
  import { api, confirmed } from "../lib/api";
  import { Action } from "../lib/action.svelte";
  import Card from "../components/Card.svelte";
  import Notes from "../components/Notes.svelte";

  // The "wasn't me" links in security emails. They work without signing in.
  let { params }: { params: Record<string, string> } = $props();
  const path = $derived(`/api/security/${encodeURIComponent(params.token ?? "")}`);

  let target = $state<{ username: string; sessionLive: boolean } | null>(null);
  let result = $state<{ everywhere: boolean } | null>(null);
  const load = new Action();
  const act = new Action();
  load.run(async () => (target = await api(path)));

  async function signOut(scope: "device" | "all") {
    if (scope === "all" && !confirmed("Sign out every browser and app, including this one?")) return;
    await act.run(async () => (result = await api(path, { scope })));
  }
</script>

{#if result}
  <Card
    title={result.everywhere ? "Signed out everywhere" : "That device is signed out"}
    lead="Now sign in, change your password, and check your passkeys and two-factor settings for anything you didn't add."
  >
    <p><a class="btn primary" href="/login?return=%2Fsettings" data-reload><LogIn class="icon" aria-hidden="true" /> Sign in</a></p>
  </Card>
{:else if load.error}
  <Card title="This link has expired" lead="Sign in to see and sign out your sessions in Settings. If you can't sign in, ask an admin to sign you out everywhere.">
    <p><a class="btn primary" href="/login"><LogIn class="icon" aria-hidden="true" /> Sign in</a></p>
  </Card>
{:else if target}
  <Card title="Wasn't you?">
    <p class="muted">
      Sign the device out of <strong>@{target.username}</strong>. Then sign in yourself and change your password.
    </p>
    <Notes error={act.error} />
    <div class="stack">
      {#if target.sessionLive}
        <button type="button" class="primary wide" onclick={() => signOut("device")} disabled={act.busy}>
          <LogOut class="icon" aria-hidden="true" />
          Sign out that device
        </button>
      {:else}
        <p class="notice">That device's session has already ended.</p>
      {/if}
      <button type="button" class="danger wide" onclick={() => signOut("all")} disabled={act.busy}>
        <LogOut class="icon" aria-hidden="true" />
        Sign out everywhere
      </button>
    </div>
    <p class="muted small">"Everywhere" also signs out the apps you use with this account.</p>
  </Card>
{/if}
