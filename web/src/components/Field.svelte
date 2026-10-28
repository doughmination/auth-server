<script lang="ts">
  import { focus } from "../lib/action.svelte";

  let {
    label,
    name,
    value = $bindable(""),
    type = "text",
    hint,
    autofocus = false,
    ...rest
  }: {
    label: string;
    name: string;
    value?: string | null;
    type?: string;
    hint?: string;
    autofocus?: boolean;
    required?: boolean;
    autocomplete?: HTMLInputElement["autocomplete"] | null;
    placeholder?: string;
    maxlength?: number;
    inputmode?: "numeric" | "email" | "text";
    pattern?: string;
    disabled?: boolean;
  } = $props();
</script>

<label class="field">
  <span>{label}</span>
  <input {type} {name} bind:value {...rest} use:focus={autofocus} />
  {#if hint}<small class="muted">{hint}</small>{/if}
</label>
