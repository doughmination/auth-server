<!-- web/src/lib/icons/KeyRound.svelte
     Licensed under the DASL-1.2 Licence — (c) Clove Twilight
-->

<script lang="ts">
  import Icon from "./Icon.svelte";

  let props: { size?: number; class?: string; [key: string]: unknown } = $props();
</script>

<Icon name="key" {...props} />
