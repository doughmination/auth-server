///<reference types="svelte" />
;
import { Save, Users } from "@lucide/svelte";
import { api, confirmed } from "../../lib/api";
import { Action } from "../../lib/action.svelte";
import { plural } from "../../lib/format";
import AdminTabs from "../../components/AdminTabs.svelte";
import Field from "../../components/Field.svelte";
import Notes from "../../components/Notes.svelte";
import Section from "../../components/Section.svelte";
import Title from "../../components/Title.svelte";
function $$render() {

  
  
  
  
  
  
  
  
  

  const ADMIN_GROUP = "auth-admin";

  interface Group {
    name: string;
    description: string;
    members: number;
  }

  let groups = $state<Group[]>([]);
  let descriptions = $state<Record<string, string>>({});
  const values = $state({ name: "", description: "" });
  const load = new Action();
  const list = new Action();
  const create = new Action();

  async function refresh() {
    groups = await api<Group[]>("/api/admin/groups");
    descriptions = Object.fromEntries(groups.map((g) => [g.name, g.description]));
  }
  load.run(refresh);

  async function act(section: Action, path: string, body: object = {}) {
    await section.run(async () => {
      const res = await api(path, body);
      await refresh();
      return res;
    });
  }

  function save(ev: SubmitEvent, name: string) {
    ev.preventDefault();
    act(list, `/api/admin/groups/${encodeURIComponent(name)}`, { description: descriptions[name] });
  }

  function remove(name: string) {
    if (confirmed(`Delete the group "${name}"? Members lose it immediately.`)) {
      act(list, `/api/admin/groups/${encodeURIComponent(name)}/delete`);
    }
  }

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await act(create, "/api/admin/groups", values);
    if (!create.error) Object.assign(values, { name: "", description: "" });
  }
;
async () => {

 { const $$_eltiT0C = __sveltets_2_ensureComponent(Title); new $$_eltiT0C({ target: __sveltets_2_any(), props: {  "text":`Groups`,}});}
 { const $$_sbaTnimdA0C = __sveltets_2_ensureComponent(AdminTabs); new $$_sbaTnimdA0C({ target: __sveltets_2_any(), props: {}});}
 { const $$_setoN0C = __sveltets_2_ensureComponent(Notes); new $$_setoN0C({ target: __sveltets_2_any(), props: {  "error":load.error,}});}

 { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Groups`,"description":"Apps receive group names in the `groups` claim. Name them after what they allow, e.g. system-owner or inbox-admin.",}});
   { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":list.message,"error":list.error,}});}
   { svelteHTML.createElement("ul", { "class":`rows`,});
       for(let g of __sveltets_2_ensureArray(groups)){g.name;
       { svelteHTML.createElement("li", {});
         { svelteHTML.createElement("div", { "class":`grow`,});
           { svelteHTML.createElement("strong", {});g.name; }  { svelteHTML.createElement("small", { "class":`muted`,});plural(g.members, "member"); }
           { svelteHTML.createElement("form", {   "class":`inline-edit`,"onsubmit":(ev) => save(ev, g.name),});
             { svelteHTML.createElement("input", {          "type":`text`,"bind:value":descriptions[g.name],"maxlength":200,"placeholder":`Description`,"aria-label":`Description of ${g.name}`,});/*Ωignore_startΩ*/() => descriptions[g.name] = __sveltets_2_any(null);/*Ωignore_endΩ*/}
             { svelteHTML.createElement("button", {     "type":`submit`,"class":`small`,"disabled":list.busy,}); { const $$_evaS6C = __sveltets_2_ensureComponent(Save); new $$_evaS6C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}  }
           }
         }
        if(g.name !== ADMIN_GROUP){
           { svelteHTML.createElement("button", {       "type":`button`,"class":`danger small`,"onclick":() => remove(g.name),"disabled":list.busy,});  }
        }
       }
    }
   }
 Section}

 { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`New group`,}});
   { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":submit,});
     { const $$_setoN2C = __sveltets_2_ensureComponent(Notes); new $$_setoN2C({ target: __sveltets_2_any(), props: {    "ok":create.message,"error":create.error,}});}
     { svelteHTML.createElement("div", { "class":`grid2`,});
       { const $$_dleiF3C = __sveltets_2_ensureComponent(Field); const $$_dleiF3 = new $$_dleiF3C({ target: __sveltets_2_any(), props: {          "label":`Name`,"name":`name`,value:values.name,"required":true,"maxlength":64,"autocomplete":`off`,}});/*Ωignore_startΩ*/() => values.name = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF3.$$bindings = 'value';}
       { const $$_dleiF3C = __sveltets_2_ensureComponent(Field); const $$_dleiF3 = new $$_dleiF3C({ target: __sveltets_2_any(), props: {          "label":`Description`,"name":`description`,value:values.description,"maxlength":200,"autocomplete":`off`,}});/*Ωignore_startΩ*/() => values.description = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF3.$$bindings = 'value';}
     }
     { svelteHTML.createElement("div", {});
       { svelteHTML.createElement("button", {     "type":`submit`,"class":`primary`,"disabled":create.busy,}); { const $$_sresU4C = __sveltets_2_ensureComponent(Users); new $$_sresU4C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}   }
     }
   }
 Section}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Groups__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Groups__SvelteComponent_ = ReturnType<typeof Groups__SvelteComponent_>;
/*Ωignore_endΩ*/export default Groups__SvelteComponent_;