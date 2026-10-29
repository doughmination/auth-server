///<reference types="svelte" />
;
import LogOut from "../lib/icons/LogOut.svelte";
import { api } from "../lib/api";
import { Action } from "../lib/action.svelte";
import { navigate, query, reload, route } from "../lib/router.svelte";
import Card from "../components/Card.svelte";
import Notes from "../components/Notes.svelte";
function $$render() {

  
  
  
  
  
  

  // RP-initiated logout without proof it came from the app: confirm first.
  const q = query();
  const request = {
    client_id: q.get("client_id") ?? "",
    post_logout_redirect_uri: q.get("post_logout_redirect_uri") ?? "",
    state: q.get("state") ?? "",
  };

  let info = $state<{ client: string | null; username: string | null; returnTo: string | null } | null>(null);
  const load = new Action();
  const act = new Action();

  load.run(async () => {
    try {
      info = await api(`/api/end-session${route.search}`);
    } catch (err) {
      navigate("/error?code=logout_bad_redirect", { replace: true });
      throw err;
    }
  });

  async function signOut() {
    await act.run(async () => reload((await api<{ redirect: string }>("/api/end-session", request)).redirect));
  }
;
async () => {

if(info){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Sign out?`,}});
     { svelteHTML.createElement("p", { "class":`muted`,});
      info.client ? `${info.client} wants to sign you out` : "Sign out";info.username ? ` of @${info.username}` : "";   
     }
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {  "error":act.error,}});}
     { svelteHTML.createElement("button", {       "type":`button`,"class":`primary wide`,"onclick":signOut,"disabled":act.busy,});
       { const $$_tuOgoL2C = __sveltets_2_ensureComponent(LogOut); new $$_tuOgoL2C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
       
     }
    if(info.returnTo){
       { svelteHTML.createElement("p", { "class":`small`,}); { svelteHTML.createElement("a", {   "class":`btn wide`,"href":info.returnTo,});      } }
    }
   Card}
}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const EndSession__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type EndSession__SvelteComponent_ = ReturnType<typeof EndSession__SvelteComponent_>;
/*Ωignore_endΩ*/export default EndSession__SvelteComponent_;