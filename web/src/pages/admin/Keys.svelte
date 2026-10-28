<script lang="ts">
  import { api, confirmed } from "../../lib/api";
  import { Action } from "../../lib/action.svelte";
  import { date } from "../../lib/format";
  import AdminTabs from "../../components/AdminTabs.svelte";
  import Notes from "../../components/Notes.svelte";
  import Section from "../../components/Section.svelte";
  import Title from "../../components/Title.svelte";

  let keys = $state<{ kid: string; alg: string; createdAt: number; retiredAt: number | null }[]>([]);
  const load = new Action();
  const rotate = new Action();

  const refresh = async () => void (keys = await api("/api/admin/keys"));
  load.run(refresh);

  async function rotateNow() {
    if (!confirmed("Rotate the signing key?")) return;
    await rotate.run(async () => {
      const res = await api("/api/admin/keys/rotate", {});
      await refresh();
      return res;
    });
  }
</script>

<Title text="Signing keys" />
<AdminTabs />
<Notes error={load.error} />

<Section title="Signing keys" description="Tokens are signed with the newest active key. Apps pick up new keys from the JWKS automatically. A key is created on first use.">
  <Notes ok={rotate.message} error={rotate.error} />
  <ul class="rows">
    {#each keys as k (k.kid)}
      <li>
        <div class="grow">
          <code>{k.kid}</code> <span class={`badge ${k.retiredAt ? "" : "ok"}`}>{k.retiredAt ? "retired" : "active"}</span>
          <br />
          <small class="muted">{k.alg} · created {date(k.createdAt)}{k.retiredAt ? ` · retired ${date(k.retiredAt)}` : ""}</small>
        </div>
      </li>
    {/each}
  </ul>
  <button type="button" onclick={rotateNow} disabled={rotate.busy}>Rotate now</button>
</Section>
