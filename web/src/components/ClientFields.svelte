<script lang="ts" module>
  export interface ClientValues {
    name: string;
    homeUrl: string;
    redirectUris: string;
    postLogoutRedirectUris: string;
    allowedGroups: string[];
  }
</script>

<script lang="ts">
  import Field from "./Field.svelte";
  import GroupChecks, { type GroupOption } from "./GroupChecks.svelte";

  let { values = $bindable(), groups }: { values: ClientValues; groups: GroupOption[] } = $props();
</script>

<Field label="Name" name="name" bind:value={values.name} required maxlength={100} autocomplete="off" hint="Shown to people when they're asked to sign in." />
<Field
  label="Website"
  name="homeUrl"
  type="url"
  bind:value={values.homeUrl}
  maxlength={2048}
  autocomplete="off"
  placeholder="https://app.example.com/"
  hint="Optional. Where the app lives: with one, it's listed on everyone's “Your apps” page (if their groups allow it)."
/>
<label class="field">
  <span>Redirect URIs</span>
  <textarea bind:value={values.redirectUris} rows={3} required placeholder="https://app.example.com/auth/callback"></textarea>
  <small class="muted">One per line, matched exactly.</small>
</label>
<label class="field">
  <span>Post-logout redirect URIs</span>
  <textarea bind:value={values.postLogoutRedirectUris} rows={2} placeholder="https://app.example.com/"></textarea>
  <small class="muted">Optional. Where the app may send people after signing out here.</small>
</label>
<fieldset>
  <legend>Who can use it</legend>
  <p class="muted small">Leave everything unticked to allow every account.</p>
  <GroupChecks {groups} bind:selected={values.allowedGroups} />
</fieldset>
