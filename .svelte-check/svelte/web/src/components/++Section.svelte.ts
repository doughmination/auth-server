///<reference types="svelte" />
;
import type { Snippet } from "svelte";

;type $$ComponentProps =  { title: string; description?: string; children: Snippet };function $$render() {

  

  let { title, description, children }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props();
;
async () => {

 { svelteHTML.createElement("section", { "class":`panel`,});
   { svelteHTML.createElement("h2", {});title; }
  if(description){ { svelteHTML.createElement("p", { "class":`muted`,});description; }}
  ;__sveltets_2_ensureSnippet(children());
 }
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Section__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Section__SvelteComponent_ = ReturnType<typeof Section__SvelteComponent_>;
/*Ωignore_endΩ*/export default Section__SvelteComponent_;