///<reference types="svelte" />
;// A success note named by `?m=` in the URL (fixed codes only, see lib/messages).

import { MESSAGES } from "../lib/messages";
import { query } from "../lib/router.svelte";
function $$render() {

  
  
  

  const text = $derived(MESSAGES[query().get("m") ?? ""] ?? "");
;
async () => {

if(text){ { svelteHTML.createElement("p", {   "class":`notice ok`,"role":`status`,});text; }}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Flash__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Flash__SvelteComponent_ = ReturnType<typeof Flash__SvelteComponent_>;
/*Ωignore_endΩ*/export default Flash__SvelteComponent_;