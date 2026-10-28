<script lang="ts">
  import { api } from "../../lib/api";
  import { Action } from "../../lib/action.svelte";
  import { date, relative } from "../../lib/format";
  import AdminTabs from "../../components/AdminTabs.svelte";
  import Notes from "../../components/Notes.svelte";
  import Section from "../../components/Section.svelte";
  import Title from "../../components/Title.svelte";

  interface Entry {
    id: number;
    at: number;
    actor: string | null;
    action: string;
    target: string | null;
    ip: string | null;
    detail: string | null;
  }

  let entries = $state<Entry[]>([]);
  const load = new Action();
  load.run(async () => (entries = await api<Entry[]>("/api/admin/audit")));
</script>

<Title text="Audit log" />
<AdminTabs />
<Notes error={load.error} />

<Section title="Recent activity" description="The latest 200 events. Kept for 180 days.">
  <div class="table-wrap">
    <table class="compact">
      <thead><tr><th>When</th><th>Who</th><th>What</th><th>Target</th><th>IP</th></tr></thead>
      <tbody>
        {#each entries as e (e.id)}
          <tr>
            <td title={date(e.at)}>{relative(e.at)}</td>
            <td>{#if e.actor}@{e.actor}{:else}<span class="muted">—</span>{/if}</td>
            <td><code>{e.action}</code>{#if e.detail}<small class="muted"> {e.detail}</small>{/if}</td>
            <td>{e.target ?? ""}</td>
            <td>{e.ip ?? ""}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</Section>
