///<reference types="svelte" />
;// A narrow page's single card: a title, an optional lead paragraph, then content.

import type { Snippet } from "svelte";
import Title from "./Title.svelte";

;type $$ComponentProps =  { title: string; lead?: string; children?: Snippet };function $$render() {

  
  
  

  let { title, lead, children }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props();
;
async () => {

 { const $$_eltiT0C = __sveltets_2_ensureComponent(Title); new $$_eltiT0C({ target: __sveltets_2_any(), props: {  "text":title,}});}
 { svelteHTML.createElement("div", { "class":`card`,});
   { svelteHTML.createElement("h1", {});title; }
  if(lead){ { svelteHTML.createElement("p", { "class":`muted`,});lead; }}
  ;__sveltets_2_ensureSnippet(children?.());
 }
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Card__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Card__SvelteComponent_ = ReturnType<typeof Card__SvelteComponent_>;
/*Ωignore_endΩ*/export default Card__SvelteComponent_;