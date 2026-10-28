///<reference types="svelte" />
;
  export interface ClientData {
    id: string;
    name: string;
    homeUrl: string | null;
    isPublic: boolean;
    redirectUris: string[];
    postLogoutRedirectUris: string[];
    allowedGroups: string[];
    issuer: string;
    discovery: string;
  }

  /** Shown once, on the page the app is opened on after creating it. Never kept beyond this tab. */
  export const newSecrets = new Map<string, string>();
;;

import { AppWindow } from "@lucide/svelte";
import { api } from "../../lib/api";
import { Action } from "../../lib/action.svelte";
import { navigate } from "../../lib/router.svelte";
import AdminTabs from "../../components/AdminTabs.svelte";
import ClientFields, { type ClientValues } from "../../components/ClientFields.svelte";
import Field from "../../components/Field.svelte";
import Flash from "../../components/Flash.svelte";
import type { GroupOption } from "../../components/GroupChecks.svelte";
import Notes from "../../components/Notes.svelte";
import Section from "../../components/Section.svelte";
import Title from "../../components/Title.svelte";
function $$render() {

  
  
  
  
  
  
  
  
  
  
  
  

  let clients = $state<ClientData[]>([]);
  let groups = $state<GroupOption[]>([]);
  let values = $state<ClientValues>({ name: "", homeUrl: "", redirectUris: "", postLogoutRedirectUris: "", allowedGroups: [] });
  let type = $state<"confidential" | "public">("confidential");
  let clientId = $state("");
  const load = new Action();
  const create = new Action();

  load.run(async () => {
    [clients, groups] = await Promise.all([api<ClientData[]>("/api/admin/clients"), api<GroupOption[]>("/api/admin/groups")]);
  });

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await create.run(async () => {
      const { id, secret } = await api<{ id: string; secret: string | null }>("/api/admin/clients", { ...values, type, clientId });
      if (secret) newSecrets.set(id, secret);
      navigate(`/admin/clients/${encodeURIComponent(id)}`);
    });
  }
;
async () => {



 { const $$_eltiT0C = __sveltets_2_ensureComponent(Title); new $$_eltiT0C({ target: __sveltets_2_any(), props: {  "text":`Applications`,}});}
 { const $$_sbaTnimdA0C = __sveltets_2_ensureComponent(AdminTabs); new $$_sbaTnimdA0C({ target: __sveltets_2_any(), props: {}});}
 { const $$_hsalF0C = __sveltets_2_ensureComponent(Flash); new $$_hsalF0C({ target: __sveltets_2_any(), props: {}});}
 { const $$_setoN0C = __sveltets_2_ensureComponent(Notes); new $$_setoN0C({ target: __sveltets_2_any(), props: {  "error":load.error,}});}

 { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Applications`,"description":`Each app that signs people in through this server is an OpenID Connect client.`,}});
  if(clients.length === 0){
     { svelteHTML.createElement("p", { "class":`muted`,});   }
  }else{
     { svelteHTML.createElement("div", { "class":`table-wrap`,});
       { svelteHTML.createElement("table", {});
         { svelteHTML.createElement("thead", {}); { svelteHTML.createElement("tr", {}); { svelteHTML.createElement("th", {});  } { svelteHTML.createElement("th", {});  } { svelteHTML.createElement("th", {});  } { svelteHTML.createElement("th", {});  } } }
         { svelteHTML.createElement("tbody", {});
             for(let cl of __sveltets_2_ensureArray(clients)){cl.id;
             { svelteHTML.createElement("tr", {});
               { svelteHTML.createElement("td", {});
                 { svelteHTML.createElement("a", {   "class":`btn small`,"href":`/admin/clients/${encodeURIComponent(cl.id)}`,});cl.name; }
                if(!cl.homeUrl){ { svelteHTML.createElement("br", {});} { svelteHTML.createElement("small", { "class":`muted`,});    }}
               }
               { svelteHTML.createElement("td", {}); { svelteHTML.createElement("code", {});cl.id; } }
               { svelteHTML.createElement("td", {});cl.isPublic ? "public (PKCE)" : "confidential"; }
               { svelteHTML.createElement("td", {});   for(let g of __sveltets_2_ensureArray(cl.allowedGroups)){g; { svelteHTML.createElement("span", { "class":`badge`,});g; }}  }
             }
          }
         }
       }
     }
  }
 Section}

 { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Add an application`,}});
   { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":submit,});
     { const $$_setoN2C = __sveltets_2_ensureComponent(Notes); new $$_setoN2C({ target: __sveltets_2_any(), props: {  "error":create.error,}});}
     { const $$_sdleiFtneilC2C = __sveltets_2_ensureComponent(ClientFields); const $$_sdleiFtneilC2 = new $$_sdleiFtneilC2C({ target: __sveltets_2_any(), props: {   values,groups,}});/*Ωignore_startΩ*/() => values = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_sdleiFtneilC2.$$bindings = 'values';}
     { svelteHTML.createElement("fieldset", {});
       { svelteHTML.createElement("legend", {});  }
       { svelteHTML.createElement("label", { "class":`check`,});
         { svelteHTML.createElement("input", {     "type":`radio`,"value":`confidential`,});type = __sveltets_2_any(null);}
         { svelteHTML.createElement("span", {});  { svelteHTML.createElement("small", { "class":`muted`,});            } }
       }
       { svelteHTML.createElement("label", { "class":`check`,});
         { svelteHTML.createElement("input", {     "type":`radio`,"value":`public`,});type = __sveltets_2_any(null);}
         { svelteHTML.createElement("span", {});  { svelteHTML.createElement("small", { "class":`muted`,});               } }
       }
     }
     { svelteHTML.createElement("details", {});
       { svelteHTML.createElement("summary", {});  }
       { const $$_dleiF3C = __sveltets_2_ensureComponent(Field); const $$_dleiF3 = new $$_dleiF3C({ target: __sveltets_2_any(), props: {             "label":`Client id`,"name":`client_id`,value:clientId,"maxlength":128,"autocomplete":`off`,"hint":`Leave blank for a random id. Set it to keep an app's existing client id when moving it over from another provider.`,}});/*Ωignore_startΩ*/() => clientId = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF3.$$bindings = 'value';}
     }
     { svelteHTML.createElement("div", {});
       { svelteHTML.createElement("button", {     "type":`submit`,"class":`primary`,"disabled":create.busy,});
         { const $$_wodniWppA4C = __sveltets_2_ensureComponent(AppWindow); new $$_wodniWppA4C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
         
       }
     }
   }
 Section}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Clients__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Clients__SvelteComponent_ = ReturnType<typeof Clients__SvelteComponent_>;
/*Ωignore_endΩ*/export default Clients__SvelteComponent_;