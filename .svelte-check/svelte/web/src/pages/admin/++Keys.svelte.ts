///<reference types="svelte" />
;
import { api, confirmed } from "../../lib/api";
import { Action } from "../../lib/action.svelte";
import { date } from "../../lib/format";
import AdminTabs from "../../components/AdminTabs.svelte";
import Notes from "../../components/Notes.svelte";
import Section from "../../components/Section.svelte";
import Title from "../../components/Title.svelte";
function $$render() {

  
  
  
  
  
  
  

  let keys = $state<{ kid: string; alg: string; createdAt: number; retiredAt: number | null }[]>([]);
  const load = new Action();
  const rotate = new Action();

  const refresh = async () => void (keys = await api("/api/admin/keys"));
  load.run(refresh);

  async function rotateNow() {
    if (!confirmed("Rotate the signing key?")) return;
    await rotate.run(async () => {
      const res = await api("/api/admin/keys/rotate", {});
      await refresh();
      return res;
    });
  }
;
async () => {

 { const $$_eltiT0C = __sveltets_2_ensureComponent(Title); new $$_eltiT0C({ target: __sveltets_2_any(), props: {  "text":`Signing keys`,}});}
 { const $$_sbaTnimdA0C = __sveltets_2_ensureComponent(AdminTabs); new $$_sbaTnimdA0C({ target: __sveltets_2_any(), props: {}});}
 { const $$_setoN0C = __sveltets_2_ensureComponent(Notes); new $$_setoN0C({ target: __sveltets_2_any(), props: {  "error":load.error,}});}

 { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Signing keys`,"description":`Tokens are signed with the newest active key. Apps pick up new keys from the JWKS automatically. A key is created on first use.`,}});
   { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":rotate.message,"error":rotate.error,}});}
   { svelteHTML.createElement("ul", { "class":`rows`,});
       for(let k of __sveltets_2_ensureArray(keys)){k.kid;
       { svelteHTML.createElement("li", {});
         { svelteHTML.createElement("div", { "class":`grow`,});
           { svelteHTML.createElement("code", {});k.kid; }  { svelteHTML.createElement("span", { "class":`badge ${k.retiredAt ? "" : "ok"}`,});k.retiredAt ? "retired" : "active"; }
           { svelteHTML.createElement("br", {});}
           { svelteHTML.createElement("small", { "class":`muted`,});k.alg;   date(k.createdAt);k.retiredAt ? ` · retired ${date(k.retiredAt)}` : ""; }
         }
       }
    }
   }
   { svelteHTML.createElement("button", {     "type":`button`,"onclick":rotateNow,"disabled":rotate.busy,});  }
 Section}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Keys__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Keys__SvelteComponent_ = ReturnType<typeof Keys__SvelteComponent_>;
/*Ωignore_endΩ*/export default Keys__SvelteComponent_;