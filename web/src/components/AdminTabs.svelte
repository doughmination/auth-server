<script lang="ts">
  import { route } from "../lib/router.svelte";

  const TABS = [
    ["/admin/users", "Users"],
    ["/admin/groups", "Groups"],
    ["/admin/clients", "Applications"],
    ["/admin/keys", "Signing keys"],
    ["/admin/audit", "Audit log"],
    ["/admin/reserved", "Reserved names"],
  ] as const;
</script>

<nav class="tabs">
  {#each TABS as [href, label] (href)}
    <a {href} class={route.path === href || route.path.startsWith(href + "/") ? "active" : undefined}>{label}</a>
  {/each}
</nav>
