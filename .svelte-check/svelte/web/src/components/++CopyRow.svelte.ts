///<reference types="svelte" />
;
;type $$ComponentProps =  { value: string; label: string };function $$render() {

  let { value, label }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props();
  let input: HTMLInputElement;
  let copied = $state(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      input.select();
    }
  }
;
async () => {

 { svelteHTML.createElement("p", { "class":`copyrow`,});
   { const $$_input1 = svelteHTML.createElement("input", {        "type":`text`,"readonly":true,value,"aria-label":label,});input = $$_input1;}
   { svelteHTML.createElement("button", {   "type":`button`,"onclick":copy,});copied ? "Copied" : "Copy"; }
 }
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const CopyRow__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type CopyRow__SvelteComponent_ = ReturnType<typeof CopyRow__SvelteComponent_>;
/*Ωignore_endΩ*/export default CopyRow__SvelteComponent_;