///<reference types="svelte" />
;
import { Save } from "@lucide/svelte";
import { api, confirmed } from "../../lib/api";
import { Action } from "../../lib/action.svelte";
import AdminTabs from "../../components/AdminTabs.svelte";
import Field from "../../components/Field.svelte";
import Notes from "../../components/Notes.svelte";
import Section from "../../components/Section.svelte";
import Title from "../../components/Title.svelte";
function $$render() {

  
  
  
  
  
  
  
  

  let reserved = $state<{ username: string; note: string }[]>([]);
  let builtin = $state<string[]>([]);
  const values = $state({ username: "", note: "" });
  const load = new Action();
  const list = new Action();
  const create = new Action();

  async function refresh() {
    ({ reserved, builtin } = await api<{ reserved: { username: string; note: string }[]; builtin: string[] }>("/api/admin/reserved"));
  }
  load.run(refresh);

  async function act(section: Action, path: string, body: object = {}) {
    await section.run(async () => {
      const res = await api(path, body);
      await refresh();
      return res;
    });
  }

  function release(name: string) {
    if (confirmed(`Release "${name}"? Anyone can then sign up with it.`)) {
      act(list, `/api/admin/reserved/${encodeURIComponent(name)}/delete`);
    }
  }

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await act(create, "/api/admin/reserved", values);
    if (!create.error) Object.assign(values, { username: "", note: "" });
  }
;
async () => {

 { const $$_eltiT0C = __sveltets_2_ensureComponent(Title); new $$_eltiT0C({ target: __sveltets_2_any(), props: {  "text":`Reserved names`,}});}
 { const $$_sbaTnimdA0C = __sveltets_2_ensureComponent(AdminTabs); new $$_sbaTnimdA0C({ target: __sveltets_2_any(), props: {}});}
 { const $$_setoN0C = __sveltets_2_ensureComponent(Notes); new $$_setoN0C({ target: __sveltets_2_any(), props: {  "error":load.error,}});}

  { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {    children:() => { return __sveltets_2_any(0); },"title":`Reserved names`,"description":`Nobody can sign up with these, or with anything that reads the same: dots, dashes and underscores are ignored, and look-alikes such as 0 for o or 1 for l are folded, so reserving noreply also blocks no-reply and n0reply. Admins can still create accounts with them.`,}});
   { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":list.message,"error":list.error,}});}
   { svelteHTML.createElement("ul", { "class":`rows`,});
       for(let r of __sveltets_2_ensureArray(reserved)){r.username;
       { svelteHTML.createElement("li", {});
         { svelteHTML.createElement("div", { "class":`grow`,}); { svelteHTML.createElement("strong", {});r.username; } if(r.note){ { svelteHTML.createElement("small", { "class":`muted`,});r.note; }} }
         { svelteHTML.createElement("button", {       "type":`button`,"class":`danger small`,"onclick":() => release(r.username),"disabled":list.busy,});  }
       }
    }
   }
 Section}

 { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Reserve a name`,}});
   { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":submit,});
     { const $$_setoN2C = __sveltets_2_ensureComponent(Notes); new $$_setoN2C({ target: __sveltets_2_any(), props: {    "ok":create.message,"error":create.error,}});}
     { svelteHTML.createElement("div", { "class":`grid2`,});
       { const $$_dleiF3C = __sveltets_2_ensureComponent(Field); const $$_dleiF3 = new $$_dleiF3C({ target: __sveltets_2_any(), props: {          "label":`Username`,"name":`username`,value:values.username,"required":true,"maxlength":32,"autocomplete":`off`,}});/*Ωignore_startΩ*/() => values.username = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF3.$$bindings = 'value';}
       { const $$_dleiF3C = __sveltets_2_ensureComponent(Field); const $$_dleiF3 = new $$_dleiF3C({ target: __sveltets_2_any(), props: {            "label":`Note`,"name":`note`,value:values.note,"maxlength":200,"autocomplete":`off`,"hint":`Why, or who it's held for.`,}});/*Ωignore_startΩ*/() => values.note = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF3.$$bindings = 'value';}
     }
     { svelteHTML.createElement("div", {});
       { svelteHTML.createElement("button", {     "type":`submit`,"class":`primary`,"disabled":create.busy,}); { const $$_evaS4C = __sveltets_2_ensureComponent(Save); new $$_evaS4C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}  }
     }
   }
 Section}

 { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Always reserved`,"description":`Built into the code (src/data/reserved.ts).`,}});
   { svelteHTML.createElement("p", { "class":`muted small`,});builtin.join(", "); }
 Section}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Reserved__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Reserved__SvelteComponent_ = ReturnType<typeof Reserved__SvelteComponent_>;
/*Ωignore_endΩ*/export default Reserved__SvelteComponent_;