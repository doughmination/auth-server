<script lang="ts">
  import { session } from "../lib/session.svelte";
  import Card from "../components/Card.svelte";
</script>

<Card title="Page not found" lead="There's nothing at this address.">
  <p><a class="btn primary" href={session.user ? "/apps" : "/login"}>{session.user ? "Your apps" : "Sign in"}</a></p>
</Card>
