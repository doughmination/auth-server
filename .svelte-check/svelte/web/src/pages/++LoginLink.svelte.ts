///<reference types="svelte" />
;
import { LogIn } from "@lucide/svelte";
import { api } from "../lib/api";
import { Action } from "../lib/action.svelte";
import { reload } from "../lib/router.svelte";
import { session } from "../lib/session.svelte";
import Card from "../components/Card.svelte";
import Notes from "../components/Notes.svelte";

;type $$ComponentProps =  { params: Record<string, string> };function $$render() {

  
  
  
  
  
  
  

  let { params }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props();
  const path = $derived(`/api/login/link/${encodeURIComponent(params.token ?? "")}`);

  let target = $state<{ userId: string; username: string; name: string | null } | null>(null);
  const load = new Action();
  const use = new Action();
  load.run(async () => (target = await api(path)));

  // Link scanners follow GETs, so using the link takes a deliberate click.
  async function signIn() {
    await use.run(async () => reload((await api<{ redirect: string }>(path, {})).redirect));
  }
;
async () => {

if(load.error){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {    "title":`This link can't be used`,"lead":`It has expired, was already used, or was replaced by a newer one. Ask an admin for a new link.`,}});}
} else if (target){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Sign in as ${target.name ?? target.username}`,}});
     { svelteHTML.createElement("p", { "class":`muted`,});
              { svelteHTML.createElement("strong", {}); target.username; }      
     }
    if(session.user && session.user.id !== target.userId){
       { svelteHTML.createElement("p", { "class":`notice`,});     session.user.username;    }
    }
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {  "error":use.error,}});}
     { svelteHTML.createElement("button", {       "type":`button`,"class":`primary wide`,"onclick":signIn,"disabled":use.busy,});
       { const $$_nIgoL2C = __sveltets_2_ensureComponent(LogIn); new $$_nIgoL2C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
      
     }
   Card}
}
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const LoginLink__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type LoginLink__SvelteComponent_ = ReturnType<typeof LoginLink__SvelteComponent_>;
/*Ωignore_endΩ*/export default LoginLink__SvelteComponent_;