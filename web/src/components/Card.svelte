<script lang="ts">
  // A narrow page's single card: a title, an optional lead paragraph, then content.
  import type { Snippet } from "svelte";
  import Title from "./Title.svelte";

  let { title, lead, children }: { title: string; lead?: string; children?: Snippet } = $props();
</script>

<Title text={title} />
<div class="card">
  <h1>{title}</h1>
  {#if lead}<p class="muted">{lead}</p>{/if}
  {@render children?.()}
</div>
