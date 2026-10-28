///<reference types="svelte" />
;
import { api } from "../lib/api";
import { Action } from "../lib/action.svelte";
import { navigate, reload, route } from "../lib/router.svelte";
import Card from "../components/Card.svelte";
import Notes from "../components/Notes.svelte";
function $$render() {

  
  
  
  
  

  // /authorize sends people here (with its own query) when it has something to
  // explain. Asking the API again keeps the decision on the server.
  type Notice =
    | { kind: "error"; code: string }
    | { kind: "redirect"; url: string }
    | { kind: "denied"; client: string; username: string; back: string }
    | { kind: "verify-email"; client: string; email: string | null; retry: string };

  let notice = $state<Notice | null>(null);
  const load = new Action();
  const signOut = new Action();

  load.run(async () => {
    const n = await api<Notice>(`/api/authorize/notice${route.search}`);
    if (n.kind === "redirect") reload(n.url);
    else if (n.kind === "error") navigate(`/error?code=${encodeURIComponent(n.code)}`, { replace: true });
    else notice = n;
  });

  async function switchAccount() {
    // Sign out, then sign in again and pick up this same request.
    await signOut.run(async () => {
      await api("/api/logout", {});
      reload(`/login?${new URLSearchParams({ return: `/authorize${route.search}` })}`);
    });
  }
;
async () => {

 { const $$_setoN0C = __sveltets_2_ensureComponent(Notes); new $$_setoN0C({ target: __sveltets_2_any(), props: {  "error":load.error,}});}
if(notice?.kind === "denied"){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`No access to ${notice.client}`,}});
     { svelteHTML.createElement("p", { "class":`muted`,});
           { svelteHTML.createElement("strong", {}); notice.username; }      notice.client;   
           
     }
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {  "error":signOut.error,}});}
     { svelteHTML.createElement("button", {       "type":`button`,"class":`wide`,"onclick":switchAccount,"disabled":signOut.busy,});     }
     { svelteHTML.createElement("p", { "class":`small`,}); { svelteHTML.createElement("a", {   "class":`btn wide`,"href":notice.back,});  notice.client; } }
   Card}
} else if (notice?.kind === "verify-email"){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Verify your email first`,}});
     { svelteHTML.createElement("p", { "class":`muted`,});
      if(notice.email){      { svelteHTML.createElement("strong", {});notice.email; }      }else{            notice.client; }
     }
     { svelteHTML.createElement("p", {}); { svelteHTML.createElement("a", {   "class":`btn primary wide`,"href":notice.retry,});    } }
     { svelteHTML.createElement("p", {}); { svelteHTML.createElement("a", {   "class":`btn wide`,"href":`/settings`,});    } }
   Card}
}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const AuthorizeNotice__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type AuthorizeNotice__SvelteComponent_ = ReturnType<typeof AuthorizeNotice__SvelteComponent_>;
/*Ωignore_endΩ*/export default AuthorizeNotice__SvelteComponent_;