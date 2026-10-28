///<reference types="svelte" />
;
import { focus } from "../lib/action.svelte";

;type $$ComponentProps =  {
    label: string;
    name: string;
    value?: string | null;
    type?: string;
    hint?: string;
    autofocus?: boolean;
    required?: boolean;
    autocomplete?: HTMLInputElement["autocomplete"] | null;
    placeholder?: string;
    maxlength?: number;
    inputmode?: "numeric" | "email" | "text";
    pattern?: string;
    disabled?: boolean;
  };function $$render() {

  

  let {
    label,
    name,
    value = $bindable(""),
    type = "text",
    hint,
    autofocus = false,
    ...rest
  }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props()/*Ωignore_startΩ*/;value;/*Ωignore_endΩ*/;
;
async () => {

 { svelteHTML.createElement("label", { "class":`field`,});
   { svelteHTML.createElement("span", {});label; }
   {const $$action_0 = __sveltets_2_ensureAction(focus(svelteHTML.mapElementTag('input'),(autofocus)));{ svelteHTML.createElement("input", __sveltets_2_union($$action_0), {      type,name,"bind:value":value,...rest,});/*Ωignore_startΩ*/() => value = __sveltets_2_any(null);/*Ωignore_endΩ*/}}
  if(hint){ { svelteHTML.createElement("small", { "class":`muted`,});hint; }}
 }
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings('value'), slots: {}, events: {} }}
const Field__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Field__SvelteComponent_ = ReturnType<typeof Field__SvelteComponent_>;
/*Ωignore_endΩ*/export default Field__SvelteComponent_;