<script lang="ts" module>
  export interface GroupOption {
    name: string;
    description: string;
  }
</script>

<script lang="ts">
  let { groups, selected = $bindable([]) }: { groups: GroupOption[]; selected?: string[] } = $props();
</script>

{#if groups.length === 0}
  <p class="muted">No groups yet.</p>
{:else}
  <div class="checks">
    {#each groups as g (g.name)}
      <label class="check">
        <input type="checkbox" value={g.name} bind:group={selected} />
        <span>
          {g.name}
          {#if g.description}<small class="muted"> — {g.description}</small>{/if}
        </span>
      </label>
    {/each}
  </div>
{/if}
