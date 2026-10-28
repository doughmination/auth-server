<script lang="ts">
  import { session } from "../lib/session.svelte";

  let { text }: { text: string } = $props();
</script>

<svelte:head>
  <title>{text} · {session.site}</title>
</svelte:head>
