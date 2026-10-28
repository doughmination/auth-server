<script lang="ts">
  // The success note and/or error for an action. Errors are announced to screen readers.
  let { ok = "", error = "" }: { ok?: string | null; error?: string | null } = $props();
</script>

{#if ok}<p class="notice ok" role="status">{ok}</p>{/if}
{#if error}<p class="notice error" role="alert">{error}</p>{/if}
