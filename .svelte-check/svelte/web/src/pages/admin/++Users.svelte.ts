///<reference types="svelte" />
;
import { UserPlus } from "@lucide/svelte";
import { api } from "../../lib/api";
import { Action } from "../../lib/action.svelte";
import { relative } from "../../lib/format";
import { navigate } from "../../lib/router.svelte";
import AdminTabs from "../../components/AdminTabs.svelte";
import Field from "../../components/Field.svelte";
import Flash from "../../components/Flash.svelte";
import GroupChecks, { type GroupOption } from "../../components/GroupChecks.svelte";
import Notes from "../../components/Notes.svelte";
import Section from "../../components/Section.svelte";
import Title from "../../components/Title.svelte";
function $$render() {

  
  
  
  
  
  
  
  
  
  
  
  

  interface UserRow {
    id: string;
    username: string;
    name: string | null;
    disabled: boolean;
    groups: string[];
    passkeys: number;
    hasPassword: boolean;
    totp: boolean;
    lastLoginAt: number | null;
  }

  let users = $state<UserRow[]>([]);
  let groups = $state<GroupOption[]>([]);
  const fresh = () => ({ username: "", name: "", email: "", emailVerified: false, subject: "", groups: [] as string[] });
  let values = $state(fresh());
  const load = new Action();
  const create = new Action();

  load.run(async () => {
    [users, groups] = await Promise.all([api<UserRow[]>("/api/admin/users"), api<GroupOption[]>("/api/admin/groups")]);
  });

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await create.run(async () => {
      const { id } = await api<{ id: string }>("/api/admin/users", values);
      navigate(`/admin/users/${encodeURIComponent(id)}?m=user-created`);
    });
  }
;
async () => {

 { const $$_eltiT0C = __sveltets_2_ensureComponent(Title); new $$_eltiT0C({ target: __sveltets_2_any(), props: {  "text":`Users`,}});}
 { const $$_sbaTnimdA0C = __sveltets_2_ensureComponent(AdminTabs); new $$_sbaTnimdA0C({ target: __sveltets_2_any(), props: {}});}
 { const $$_hsalF0C = __sveltets_2_ensureComponent(Flash); new $$_hsalF0C({ target: __sveltets_2_any(), props: {}});}
 { const $$_setoN0C = __sveltets_2_ensureComponent(Notes); new $$_setoN0C({ target: __sveltets_2_any(), props: {  "error":load.error,}});}

 { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Users (${users.length})`,}});
   { svelteHTML.createElement("div", { "class":`table-wrap`,});
     { svelteHTML.createElement("table", {});
       { svelteHTML.createElement("thead", {});
         { svelteHTML.createElement("tr", {}); { svelteHTML.createElement("th", {});  } { svelteHTML.createElement("th", {});  } { svelteHTML.createElement("th", {});  } { svelteHTML.createElement("th", {});  } }
       }
       { svelteHTML.createElement("tbody", {});
           for(let u of __sveltets_2_ensureArray(users)){u.id;
           { svelteHTML.createElement("tr", {});
             { svelteHTML.createElement("td", {});
               { svelteHTML.createElement("a", {   "class":`btn small`,"href":`/admin/users/${encodeURIComponent(u.id)}`,});u.name ?? u.username; }
               { svelteHTML.createElement("br", {});}
               { svelteHTML.createElement("small", { "class":`muted`,}); u.username; }
              if(u.disabled){ { svelteHTML.createElement("span", { "class":`badge danger`,});  }}
             }
             { svelteHTML.createElement("td", {});
                 for(let g of __sveltets_2_ensureArray(u.groups)){g; { svelteHTML.createElement("span", { "class":`badge`,});g; }} { svelteHTML.createElement("span", { "class":`muted`,});  }
             }
             { svelteHTML.createElement("td", {});
              if(u.passkeys > 0){ { svelteHTML.createElement("span", { "class":`badge`,});u.passkeys; u.passkeys === 1 ? "" : "s"; }}
              if(u.hasPassword){ { svelteHTML.createElement("span", { "class":`badge`,}); u.totp ? " + 2FA" : ""; }}
              if(!u.passkeys && !u.hasPassword){ { svelteHTML.createElement("span", { "class":`muted`,});  }}
             }
             { svelteHTML.createElement("td", {});relative(u.lastLoginAt); }
           }
        }
       }
     }
   }
 Section}

 { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Add a user`,"description":`They'll need a sign-in link from their page to set up a passkey or password.`,}});
   { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":submit,});
     { const $$_setoN2C = __sveltets_2_ensureComponent(Notes); new $$_setoN2C({ target: __sveltets_2_any(), props: {  "error":create.error,}});}
     { svelteHTML.createElement("div", { "class":`grid2`,});
       { const $$_dleiF3C = __sveltets_2_ensureComponent(Field); const $$_dleiF3 = new $$_dleiF3C({ target: __sveltets_2_any(), props: {          "label":`Username`,"name":`username`,value:values.username,"required":true,"maxlength":32,"autocomplete":`off`,}});/*Ωignore_startΩ*/() => values.username = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF3.$$bindings = 'value';}
       { const $$_dleiF3C = __sveltets_2_ensureComponent(Field); const $$_dleiF3 = new $$_dleiF3C({ target: __sveltets_2_any(), props: {          "label":`Display name`,"name":`name`,value:values.name,"maxlength":100,"autocomplete":`off`,}});/*Ωignore_startΩ*/() => values.name = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF3.$$bindings = 'value';}
       { const $$_dleiF3C = __sveltets_2_ensureComponent(Field); const $$_dleiF3 = new $$_dleiF3C({ target: __sveltets_2_any(), props: {            "label":`Email`,"name":`email`,"type":`email`,value:values.email,"maxlength":254,"autocomplete":`off`,}});/*Ωignore_startΩ*/() => values.email = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF3.$$bindings = 'value';}
       { svelteHTML.createElement("label", { "class":`check`,});
         { svelteHTML.createElement("input", {    "type":`checkbox`,"bind:checked":values.emailVerified,});/*Ωignore_startΩ*/() => values.emailVerified = __sveltets_2_any(null);/*Ωignore_endΩ*/}
         { svelteHTML.createElement("span", {});   }
       }
     }
     { svelteHTML.createElement("fieldset", {});
       { svelteHTML.createElement("legend", {});  }
       { const $$_skcehCpuorG3C = __sveltets_2_ensureComponent(GroupChecks); const $$_skcehCpuorG3 = new $$_skcehCpuorG3C({ target: __sveltets_2_any(), props: {   groups,selected:values.groups,}});/*Ωignore_startΩ*/() => values.groups = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_skcehCpuorG3.$$bindings = 'selected';}
     }
     { svelteHTML.createElement("details", {});
       { svelteHTML.createElement("summary", {});  }
       { const $$_dleiF3C = __sveltets_2_ensureComponent(Field); const $$_dleiF3 = new $$_dleiF3C({ target: __sveltets_2_any(), props: {             "label":`Subject id`,"name":`subject`,value:values.subject,"maxlength":64,"autocomplete":`off`,"hint":"The permanent `sub` apps see. Leave blank for a random UUID. Set it to carry an account over from another identity provider without apps treating it as a new person.",}});/*Ωignore_startΩ*/() => values.subject = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF3.$$bindings = 'value';}
     }
     { svelteHTML.createElement("div", {});
       { svelteHTML.createElement("button", {     "type":`submit`,"class":`primary`,"disabled":create.busy,});
         { const $$_sulPresU4C = __sveltets_2_ensureComponent(UserPlus); new $$_sulPresU4C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
         
       }
     }
   }
 Section}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Users__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Users__SvelteComponent_ = ReturnType<typeof Users__SvelteComponent_>;
/*Ωignore_endΩ*/export default Users__SvelteComponent_;