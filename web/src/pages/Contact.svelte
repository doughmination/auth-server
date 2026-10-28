<script lang="ts">
  import { session } from "../lib/session.svelte";
</script>

{#if session.contact}<a href={`mailto:${session.contact}`}>{session.contact}</a>{:else}the administrator of this server{/if}
