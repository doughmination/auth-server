///<reference types="svelte" />
;
import { route } from "../lib/router.svelte";
function $$render() {

  

  const TABS = [
    ["/admin/users", "Users"],
    ["/admin/groups", "Groups"],
    ["/admin/clients", "Applications"],
    ["/admin/keys", "Signing keys"],
    ["/admin/audit", "Audit log"],
    ["/admin/reserved", "Reserved names"],
  ] as const;
;
async () => {

 { svelteHTML.createElement("nav", { "class":`tabs`,});
     for(let [href, label] of __sveltets_2_ensureArray(TABS)){href;
     { svelteHTML.createElement("a", {  href,"class":route.path === href || route.path.startsWith(href + "/") ? "active" : undefined,});label; }
  }
 }
};
return { props: {} as Record<string, never>, exports: {}, bindings: "", slots: {}, events: {} }}
const AdminTabs__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_with_any_event($$render()));
/*Ωignore_startΩ*/type AdminTabs__SvelteComponent_ = InstanceType<typeof AdminTabs__SvelteComponent_>;
/*Ωignore_endΩ*/export default AdminTabs__SvelteComponent_;