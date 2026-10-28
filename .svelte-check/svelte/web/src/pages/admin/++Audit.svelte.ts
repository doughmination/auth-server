///<reference types="svelte" />
;
import { api } from "../../lib/api";
import { Action } from "../../lib/action.svelte";
import { date, relative } from "../../lib/format";
import AdminTabs from "../../components/AdminTabs.svelte";
import Notes from "../../components/Notes.svelte";
import Section from "../../components/Section.svelte";
import Title from "../../components/Title.svelte";
function $$render() {

  
  
  
  
  
  
  

  interface Entry {
    id: number;
    at: number;
    actor: string | null;
    action: string;
    target: string | null;
    ip: string | null;
    detail: string | null;
  }

  let entries = $state<Entry[]>([]);
  const load = new Action();
  load.run(async () => (entries = await api<Entry[]>("/api/admin/audit")));
;
async () => {

 { const $$_eltiT0C = __sveltets_2_ensureComponent(Title); new $$_eltiT0C({ target: __sveltets_2_any(), props: {  "text":`Audit log`,}});}
 { const $$_sbaTnimdA0C = __sveltets_2_ensureComponent(AdminTabs); new $$_sbaTnimdA0C({ target: __sveltets_2_any(), props: {}});}
 { const $$_setoN0C = __sveltets_2_ensureComponent(Notes); new $$_setoN0C({ target: __sveltets_2_any(), props: {  "error":load.error,}});}

 { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Recent activity`,"description":`The latest 200 events. Kept for 180 days.`,}});
   { svelteHTML.createElement("div", { "class":`table-wrap`,});
     { svelteHTML.createElement("table", { "class":`compact`,});
       { svelteHTML.createElement("thead", {}); { svelteHTML.createElement("tr", {}); { svelteHTML.createElement("th", {});  } { svelteHTML.createElement("th", {});  } { svelteHTML.createElement("th", {});  } { svelteHTML.createElement("th", {});  } { svelteHTML.createElement("th", {});  } } }
       { svelteHTML.createElement("tbody", {});
           for(let e of __sveltets_2_ensureArray(entries)){e.id;
           { svelteHTML.createElement("tr", {});
             { svelteHTML.createElement("td", { "title":date(e.at),});relative(e.at); }
             { svelteHTML.createElement("td", {});if(e.actor){ e.actor;}else{ { svelteHTML.createElement("span", { "class":`muted`,});  }} }
             { svelteHTML.createElement("td", {}); { svelteHTML.createElement("code", {});e.action; }if(e.detail){ { svelteHTML.createElement("small", { "class":`muted`,}); e.detail; }} }
             { svelteHTML.createElement("td", {});e.target ?? ""; }
             { svelteHTML.createElement("td", {});e.ip ?? ""; }
           }
        }
       }
     }
   }
 Section}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Audit__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Audit__SvelteComponent_ = ReturnType<typeof Audit__SvelteComponent_>;
/*Ωignore_endΩ*/export default Audit__SvelteComponent_;