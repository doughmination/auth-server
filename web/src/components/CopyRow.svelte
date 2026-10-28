<script lang="ts">
  let { value, label }: { value: string; label: string } = $props();
  let input: HTMLInputElement;
  let copied = $state(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      input.select();
    }
  }
</script>

<p class="copyrow">
  <input bind:this={input} type="text" readonly {value} aria-label={label} />
  <button type="button" onclick={copy}>{copied ? "Copied" : "Copy"}</button>
</p>
