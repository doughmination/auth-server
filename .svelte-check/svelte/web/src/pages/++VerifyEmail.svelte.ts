///<reference types="svelte" />
;
import Check from "../lib/icons/Check.svelte";
import LogIn from "../lib/icons/LogIn.svelte";
import { api } from "../lib/api";
import { Action } from "../lib/action.svelte";
import { reload } from "../lib/router.svelte";
import Card from "../components/Card.svelte";
import Notes from "../components/Notes.svelte";

;type $$ComponentProps =  { params: Record<string, string> };function $$render() {

  
  
  
  
  
  
  

  let { params }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props();
  const path = $derived(`/api/verify-email/${encodeURIComponent(params.token ?? "")}`);

  let email = $state<string | null>(null);
  let done = $state(false);
  const load = new Action();
  const verify = new Action();
  load.run(async () => (email = (await api<{ email: string }>(path)).email));

  // Mail scanners follow GETs, so verifying takes a deliberate click.
  async function confirm() {
    await verify.run(async () => {
      const { signedIn } = await api<{ signedIn: boolean }>(path, {});
      if (signedIn) reload("/settings?m=email-verified");
      else done = true;
    });
  }
;
async () => {

if(done){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Email verified`,"lead":`Thanks! You can close this tab, or sign in.`,}});
     { svelteHTML.createElement("p", {}); { svelteHTML.createElement("a", {   "class":`btn primary`,"href":`/login`,}); { const $$_nIgoL3C = __sveltets_2_ensureComponent(LogIn); new $$_nIgoL3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}   } }
   Card}
} else if (load.error || verify.error){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`This link can't be used`,"lead":`It has expired, was already used, or a newer one was sent. You can send a new one from your settings.`,}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {  "error":verify.error && !verify.error.startsWith("This link") ? verify.error : "",}});}
     { svelteHTML.createElement("p", {}); { svelteHTML.createElement("a", {   "class":`btn primary`,"href":`/settings`,});  } }
   Card}
} else if (email){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Verify your email`,}});
     { svelteHTML.createElement("p", { "class":`muted`,});   { svelteHTML.createElement("strong", {});email; }   }
     { svelteHTML.createElement("button", {       "type":`button`,"class":`primary wide`,"onclick":confirm,"disabled":verify.busy,});
       { const $$_kcehC2C = __sveltets_2_ensureComponent(Check); new $$_kcehC2C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
      
     }
   Card}
}
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const VerifyEmail__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type VerifyEmail__SvelteComponent_ = ReturnType<typeof VerifyEmail__SvelteComponent_>;
/*Ωignore_endΩ*/export default VerifyEmail__SvelteComponent_;