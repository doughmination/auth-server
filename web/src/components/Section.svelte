<script lang="ts">
  import type { Snippet } from "svelte";

  let { title, description, children }: { title: string; description?: string; children: Snippet } = $props();
</script>

<section class="panel">
  <h2>{title}</h2>
  {#if description}<p class="muted">{description}</p>{/if}
  {@render children()}
</section>
