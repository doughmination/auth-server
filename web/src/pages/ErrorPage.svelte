<script lang="ts">
  import { ERRORS } from "../lib/messages";
  import { query } from "../lib/router.svelte";
  import Card from "../components/Card.svelte";

  // Fixed messages only: the code picks one, so a crafted link can't write the text.
  const error = ERRORS[query().get("code") ?? ""] ?? {
    title: "Something went wrong",
    text: "That request couldn't be completed. Go back to the app and try again.",
  };
</script>

<Card title={error.title} lead={error.text} />
