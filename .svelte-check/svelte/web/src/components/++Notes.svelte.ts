///<reference types="svelte" />
;
;type $$ComponentProps =  { ok?: string | null; error?: string | null };function $$render() {

  // The success note and/or error for an action. Errors are announced to screen readers.
  let { ok = "", error = "" }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props();
;
async () => {

if(ok){ { svelteHTML.createElement("p", {   "class":`notice ok`,"role":`status`,});ok; }}
if(error){ { svelteHTML.createElement("p", {   "class":`notice error`,"role":`alert`,});error; }}
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Notes__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Notes__SvelteComponent_ = ReturnType<typeof Notes__SvelteComponent_>;
/*Ωignore_endΩ*/export default Notes__SvelteComponent_;