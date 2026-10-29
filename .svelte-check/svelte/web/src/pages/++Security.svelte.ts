///<reference types="svelte" />
;
import LogIn from "../lib/icons/LogIn.svelte";
import LogOut from "../lib/icons/LogOut.svelte";
import { api, confirmed } from "../lib/api";
import { Action } from "../lib/action.svelte";
import Card from "../components/Card.svelte";
import Notes from "../components/Notes.svelte";

;type $$ComponentProps =  { params: Record<string, string> };function $$render() {

  
  
  
  
  
  

  // The "wasn't me" links in security emails. They work without signing in.
  let { params }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props();
  const path = $derived(`/api/security/${encodeURIComponent(params.token ?? "")}`);

  let target = $state<{ username: string; sessionLive: boolean } | null>(null);
  let result = $state<{ everywhere: boolean } | null>(null);
  const load = new Action();
  const act = new Action();
  load.run(async () => (target = await api(path)));

  async function signOut(scope: "device" | "all") {
    if (scope === "all" && !confirmed("Sign out every browser and app, including this one?")) return;
    await act.run(async () => (result = await api(path, { scope })));
  }
;
async () => {

if(result){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {     children:() => { return __sveltets_2_any(0); },"title":result.everywhere ? "Signed out everywhere" : "That device is signed out","lead":`Now sign in, change your password, and check your passkeys and two-factor settings for anything you didn't add.`,}});
     { svelteHTML.createElement("p", {}); { svelteHTML.createElement("a", {    "class":`btn primary`,"href":`/login?return=%2Fsettings`,...__sveltets_2_empty({"data-reload":true}),}); { const $$_nIgoL3C = __sveltets_2_ensureComponent(LogIn); new $$_nIgoL3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}   } }
   Card}
} else if (load.error){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`This link has expired`,"lead":`Sign in to see and sign out your sessions in Settings. If you can't sign in, ask an admin to sign you out everywhere.`,}});
     { svelteHTML.createElement("p", {}); { svelteHTML.createElement("a", {   "class":`btn primary`,"href":`/login`,}); { const $$_nIgoL3C = __sveltets_2_ensureComponent(LogIn); new $$_nIgoL3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}   } }
   Card}
} else if (target){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Wasn't you?`,}});
     { svelteHTML.createElement("p", { "class":`muted`,});
            { svelteHTML.createElement("strong", {}); target.username; }        
     }
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {  "error":act.error,}});}
     { svelteHTML.createElement("div", { "class":`stack`,});
      if(target.sessionLive){
         { svelteHTML.createElement("button", {       "type":`button`,"class":`primary wide`,"onclick":() => signOut("device"),"disabled":act.busy,});
           { const $$_tuOgoL3C = __sveltets_2_ensureComponent(LogOut); new $$_tuOgoL3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
             
         }
      }else{
         { svelteHTML.createElement("p", { "class":`notice`,});      }
      }
       { svelteHTML.createElement("button", {       "type":`button`,"class":`danger wide`,"onclick":() => signOut("all"),"disabled":act.busy,});
         { const $$_tuOgoL3C = __sveltets_2_ensureComponent(LogOut); new $$_tuOgoL3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
          
       }
     }
     { svelteHTML.createElement("p", { "class":`muted small`,});           }
   Card}
}
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Security__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Security__SvelteComponent_ = ReturnType<typeof Security__SvelteComponent_>;
/*Ωignore_endΩ*/export default Security__SvelteComponent_;