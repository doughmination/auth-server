<script lang="ts">
  import UserPlus from "../../lib/icons/UserPlus.svelte";
  import { api } from "../../lib/api";
  import { Action } from "../../lib/action.svelte";
  import { relative } from "../../lib/format";
  import { navigate } from "../../lib/router.svelte";
  import AdminTabs from "../../components/AdminTabs.svelte";
  import Field from "../../components/Field.svelte";
  import Flash from "../../components/Flash.svelte";
  import GroupChecks, { type GroupOption } from "../../components/GroupChecks.svelte";
  import Notes from "../../components/Notes.svelte";
  import Section from "../../components/Section.svelte";
  import Title from "../../components/Title.svelte";

  interface UserRow {
    id: string;
    username: string;
    name: string | null;
    disabled: boolean;
    groups: string[];
    passkeys: number;
    hasPassword: boolean;
    totp: boolean;
    lastLoginAt: number | null;
  }

  let users = $state<UserRow[]>([]);
  let groups = $state<GroupOption[]>([]);
  const fresh = () => ({ username: "", name: "", email: "", emailVerified: false, subject: "", groups: [] as string[] });
  let values = $state(fresh());
  const load = new Action();
  const create = new Action();

  load.run(async () => {
    [users, groups] = await Promise.all([api<UserRow[]>("/api/admin/users"), api<GroupOption[]>("/api/admin/groups")]);
  });

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await create.run(async () => {
      const { id } = await api<{ id: string }>("/api/admin/users", values);
      navigate(`/admin/users/${encodeURIComponent(id)}?m=user-created`);
    });
  }
</script>

<Title text="Users" />
<AdminTabs />
<Flash />
<Notes error={load.error} />

<Section title={`Users (${users.length})`}>
  <div class="table-wrap">
    <table>
      <thead>
        <tr><th>User</th><th>Groups</th><th>Sign-in methods</th><th>Last sign-in</th></tr>
      </thead>
      <tbody>
        {#each users as u (u.id)}
          <tr>
            <td>
              <a class="btn small" href={`/admin/users/${encodeURIComponent(u.id)}`}>{u.name ?? u.username}</a>
              <br />
              <small class="muted">@{u.username}</small>
              {#if u.disabled}<span class="badge danger">disabled</span>{/if}
            </td>
            <td>
              {#each u.groups as g (g)}<span class="badge">{g}</span>{:else}<span class="muted">—</span>{/each}
            </td>
            <td>
              {#if u.passkeys > 0}<span class="badge">{u.passkeys} passkey{u.passkeys === 1 ? "" : "s"}</span>{/if}
              {#if u.hasPassword}<span class="badge">password{u.totp ? " + 2FA" : ""}</span>{/if}
              {#if !u.passkeys && !u.hasPassword}<span class="muted">none</span>{/if}
            </td>
            <td>{relative(u.lastLoginAt)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</Section>

<Section title="Add a user" description="They'll need a sign-in link from their page to set up a passkey or password.">
  <form class="stack" onsubmit={submit}>
    <Notes error={create.error} />
    <div class="grid2">
      <Field label="Username" name="username" bind:value={values.username} required maxlength={32} autocomplete="off" />
      <Field label="Display name" name="name" bind:value={values.name} maxlength={100} autocomplete="off" />
      <Field label="Email" name="email" type="email" bind:value={values.email} maxlength={254} autocomplete="off" />
      <label class="check">
        <input type="checkbox" bind:checked={values.emailVerified} />
        <span>Email is verified</span>
      </label>
    </div>
    <fieldset>
      <legend>Groups</legend>
      <GroupChecks {groups} bind:selected={values.groups} />
    </fieldset>
    <details>
      <summary>Advanced</summary>
      <Field
        label="Subject id"
        name="subject"
        bind:value={values.subject}
        maxlength={64}
        autocomplete="off"
        hint="The permanent `sub` apps see. Leave blank for a random UUID. Set it to carry an account over from another identity provider without apps treating it as a new person."
      />
    </details>
    <div>
      <button type="submit" class="primary" disabled={create.busy}>
        <UserPlus class="icon" aria-hidden="true" />
        Add user
      </button>
    </div>
  </form>
</Section>
