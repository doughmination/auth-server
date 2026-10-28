///<reference types="svelte" />
;
import { KeyRound } from "@lucide/svelte";
import { api } from "../lib/api";
import { Action } from "../lib/action.svelte";
import { reload } from "../lib/router.svelte";
import Card from "../components/Card.svelte";
import Field from "../components/Field.svelte";
import Notes from "../components/Notes.svelte";

;type $$ComponentProps =  { params: Record<string, string> };function $$render() {

  
  
  
  
  
  
  

  let { params }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props();
  const path = $derived(`/api/reset/${encodeURIComponent(params.token ?? "")}`);

  let username = $state<string | null>(null);
  let password = $state("");
  let confirm = $state("");
  const load = new Action();
  const form = new Action();
  load.run(async () => (username = (await api<{ username: string }>(path)).username));

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await form.run(async () => {
      try {
        reload((await api<{ redirect: string }>(path, { password, confirm })).redirect);
      } finally {
        password = confirm = "";
      }
    });
  }
;
async () => {

if(load.error){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`This link can't be used`,"lead":`It has expired, was already used, or a newer one was sent.`,}});
     { svelteHTML.createElement("p", {}); { svelteHTML.createElement("a", {   "class":`btn primary`,"href":`/forgot`,});    } }
   Card}
} else if (username){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Choose a new password`,}});
     { svelteHTML.createElement("p", { "class":`muted`,});  { svelteHTML.createElement("strong", {}); username; }              }
     { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":submit,});
       { const $$_setoN2C = __sveltets_2_ensureComponent(Notes); new $$_setoN2C({ target: __sveltets_2_any(), props: {  "error":form.error,}});}
      
        { svelteHTML.createElement("input", {        "type":`text`,"name":`username`,"value":username,"autocomplete":`username`,"hidden":true,});}
        { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {              "label":`New password`,"name":`password`,"type":`password`,value:password,"required":true,"autocomplete":`new-password`,"maxlength":512,"hint":`At least 10 characters.`,"autofocus":true,}});/*Ωignore_startΩ*/() => password = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {            "label":`Confirm password`,"name":`confirm`,"type":`password`,value:confirm,"required":true,"autocomplete":`new-password`,"maxlength":512,}});/*Ωignore_startΩ*/() => confirm = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { svelteHTML.createElement("button", {     "type":`submit`,"class":`primary wide`,"disabled":form.busy,});
         { const $$_dnuoRyeK3C = __sveltets_2_ensureComponent(KeyRound); new $$_dnuoRyeK3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
         
       }
     }
   Card}
}
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Reset__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Reset__SvelteComponent_ = ReturnType<typeof Reset__SvelteComponent_>;
/*Ωignore_endΩ*/export default Reset__SvelteComponent_;