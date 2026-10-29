<script lang="ts">
  import Save from "../../lib/icons/Save.svelte";
  import { api, confirmed } from "../../lib/api";
  import { Action } from "../../lib/action.svelte";
  import AdminTabs from "../../components/AdminTabs.svelte";
  import Field from "../../components/Field.svelte";
  import Notes from "../../components/Notes.svelte";
  import Section from "../../components/Section.svelte";
  import Title from "../../components/Title.svelte";

  let reserved = $state<{ username: string; note: string }[]>([]);
  let builtin = $state<string[]>([]);
  const values = $state({ username: "", note: "" });
  const load = new Action();
  const list = new Action();
  const create = new Action();

  async function refresh() {
    ({ reserved, builtin } = await api<{ reserved: { username: string; note: string }[]; builtin: string[] }>("/api/admin/reserved"));
  }
  load.run(refresh);

  async function act(section: Action, path: string, body: object = {}) {
    await section.run(async () => {
      const res = await api(path, body);
      await refresh();
      return res;
    });
  }

  function release(name: string) {
    if (confirmed(`Release "${name}"? Anyone can then sign up with it.`)) {
      act(list, `/api/admin/reserved/${encodeURIComponent(name)}/delete`);
    }
  }

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await act(create, "/api/admin/reserved", values);
    if (!create.error) Object.assign(values, { username: "", note: "" });
  }
</script>

<Title text="Reserved names" />
<AdminTabs />
<Notes error={load.error} />

<Section
  title="Reserved names"
  description="Nobody can sign up with these, or with anything that reads the same: dots, dashes and underscores are ignored, and look-alikes such as 0 for o or 1 for l are folded, so reserving noreply also blocks no-reply and n0reply. Admins can still create accounts with them."
>
  <Notes ok={list.message} error={list.error} />
  <ul class="rows">
    {#each reserved as r (r.username)}
      <li>
        <div class="grow"><strong>{r.username}</strong> {#if r.note}<small class="muted">{r.note}</small>{/if}</div>
        <button type="button" class="danger small" onclick={() => release(r.username)} disabled={list.busy}>Release</button>
      </li>
    {/each}
  </ul>
</Section>

<Section title="Reserve a name">
  <form class="stack" onsubmit={submit}>
    <Notes ok={create.message} error={create.error} />
    <div class="grid2">
      <Field label="Username" name="username" bind:value={values.username} required maxlength={32} autocomplete="off" />
      <Field label="Note" name="note" bind:value={values.note} maxlength={200} autocomplete="off" hint="Why, or who it's held for." />
    </div>
    <div>
      <button type="submit" class="primary" disabled={create.busy}><Save class="icon" aria-hidden="true" /> Reserve</button>
    </div>
  </form>
</Section>

<Section title="Always reserved" description="Built into the code (src/data/reserved.ts).">
  <p class="muted small">{builtin.join(", ")}</p>
</Section>
