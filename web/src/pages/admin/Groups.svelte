<script lang="ts">
  import { Save, Users } from "@lucide/svelte";
  import { api, confirmed } from "../../lib/api";
  import { Action } from "../../lib/action.svelte";
  import { plural } from "../../lib/format";
  import AdminTabs from "../../components/AdminTabs.svelte";
  import Field from "../../components/Field.svelte";
  import Notes from "../../components/Notes.svelte";
  import Section from "../../components/Section.svelte";
  import Title from "../../components/Title.svelte";

  const ADMIN_GROUP = "auth-admin";

  interface Group {
    name: string;
    description: string;
    members: number;
  }

  let groups = $state<Group[]>([]);
  let descriptions = $state<Record<string, string>>({});
  const values = $state({ name: "", description: "" });
  const load = new Action();
  const list = new Action();
  const create = new Action();

  async function refresh() {
    groups = await api<Group[]>("/api/admin/groups");
    descriptions = Object.fromEntries(groups.map((g) => [g.name, g.description]));
  }
  load.run(refresh);

  async function act(section: Action, path: string, body: object = {}) {
    await section.run(async () => {
      const res = await api(path, body);
      await refresh();
      return res;
    });
  }

  function save(ev: SubmitEvent, name: string) {
    ev.preventDefault();
    act(list, `/api/admin/groups/${encodeURIComponent(name)}`, { description: descriptions[name] });
  }

  function remove(name: string) {
    if (confirmed(`Delete the group "${name}"? Members lose it immediately.`)) {
      act(list, `/api/admin/groups/${encodeURIComponent(name)}/delete`);
    }
  }

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await act(create, "/api/admin/groups", values);
    if (!create.error) Object.assign(values, { name: "", description: "" });
  }
</script>

<Title text="Groups" />
<AdminTabs />
<Notes error={load.error} />

<Section title="Groups" description="Apps receive group names in the `groups` claim. Name them after what they allow, e.g. system-owner or inbox-admin.">
  <Notes ok={list.message} error={list.error} />
  <ul class="rows">
    {#each groups as g (g.name)}
      <li>
        <div class="grow">
          <strong>{g.name}</strong> <small class="muted">{plural(g.members, "member")}</small>
          <form class="inline-edit" onsubmit={(ev) => save(ev, g.name)}>
            <input type="text" bind:value={descriptions[g.name]} maxlength={200} placeholder="Description" aria-label={`Description of ${g.name}`} />
            <button type="submit" class="small" disabled={list.busy}><Save class="icon" aria-hidden="true" /> Save</button>
          </form>
        </div>
        {#if g.name !== ADMIN_GROUP}
          <button type="button" class="danger small" onclick={() => remove(g.name)} disabled={list.busy}>Delete</button>
        {/if}
      </li>
    {/each}
  </ul>
</Section>

<Section title="New group">
  <form class="stack" onsubmit={submit}>
    <Notes ok={create.message} error={create.error} />
    <div class="grid2">
      <Field label="Name" name="name" bind:value={values.name} required maxlength={64} autocomplete="off" />
      <Field label="Description" name="description" bind:value={values.description} maxlength={200} autocomplete="off" />
    </div>
    <div>
      <button type="submit" class="primary" disabled={create.busy}><Users class="icon" aria-hidden="true" /> Create group</button>
    </div>
  </form>
</Section>
