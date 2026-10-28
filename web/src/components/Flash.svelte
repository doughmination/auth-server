<script lang="ts">
  // A success note named by `?m=` in the URL (fixed codes only, see lib/messages).
  import { MESSAGES } from "../lib/messages";
  import { query } from "../lib/router.svelte";

  const text = $derived(MESSAGES[query().get("m") ?? ""] ?? "");
</script>

{#if text}<p class="notice ok" role="status">{text}</p>{/if}
