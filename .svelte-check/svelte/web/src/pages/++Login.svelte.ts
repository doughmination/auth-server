///<reference types="svelte" />
;
import KeyRound from "../lib/icons/KeyRound.svelte";
import { api } from "../lib/api";
import { Action } from "../lib/action.svelte";
import { navigate, query, reload } from "../lib/router.svelte";
import { session } from "../lib/session.svelte";
import { conditionalAvailable, getPasskey, passkeyMessage, passkeysSupported } from "../lib/webauthn";
import Card from "../components/Card.svelte";
import Field from "../components/Field.svelte";
import Flash from "../components/Flash.svelte";
import Notes from "../components/Notes.svelte";
function $$render() {

  
  
  
  
  
  
  
  
  
  

  const q = query();
  const returnTo = safeReturn(q.get("return"));
  const reauth = q.get("reauth") === "1";

  /** Same rule as the server: only paths on this site. */
  function safeReturn(raw: string | null): string {
    if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/apps";
    return raw;
  }

  let username = $state(reauth ? (session.user?.username ?? "") : "");
  let password = $state("");
  const form = new Action();
  let passkeyError = $state("");
  let passkeyBusy = $state(false);
  const supported = passkeysSupported();

  // Already signed in (and not confirming it's you): straight on.
  if (session.user && !reauth) reload(returnTo);
  else if (session.needsSetup) navigate("/setup", { replace: true });

  // Saved passkeys are offered straight from the username field's autofill.
  // Cancelled when the page goes away or the button is used instead.
  let conditional: AbortController | null = null;
  async function startConditional() {
    if (!supported || !(await conditionalAvailable())) return;
    conditional = new AbortController();
    try {
      const to = await getPasskey("/api/login/passkey", { return: returnTo }, { conditional: conditional.signal });
      if (to) reload(to);
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") passkeyError = passkeyMessage(err);
    }
  }
  $effect(() => {
    if (session.user && !reauth) return;
    startConditional();
    return () => conditional?.abort();
  });

  async function passkeySignIn() {
    conditional?.abort();
    passkeyBusy = true;
    passkeyError = "";
    try {
      const to = await getPasskey("/api/login/passkey", { return: returnTo });
      if (to) reload(to);
    } catch (err) {
      passkeyError = passkeyMessage(err);
    } finally {
      passkeyBusy = false;
      startConditional();
    }
  }

  async function passwordSignIn(ev: SubmitEvent) {
    ev.preventDefault();
    await form.run(async () => {
      const res = await api<{ redirect?: string; mfa?: object }>("/api/login/password", {
        username,
        password,
        return: returnTo,
      });
      password = "";
      if (res.mfa) navigate("/login/mfa");
      else if (res.redirect) reload(res.redirect);
    });
  }
;
async () => {

 { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":reauth ? "Confirm it's you" : "Sign in","lead":reauth ? "This needs a fresh sign-in. It only takes a moment." : undefined,}});
   { const $$_hsalF1C = __sveltets_2_ensureComponent(Flash); new $$_hsalF1C({ target: __sveltets_2_any(), props: {}});}
   { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {  "error":passkeyError,}});}

   { svelteHTML.createElement("button", {       "type":`button`,"class":`primary wide`,"onclick":passkeySignIn,"disabled":!supported || passkeyBusy,});
     { const $$_dnuoRyeK2C = __sveltets_2_ensureComponent(KeyRound); new $$_dnuoRyeK2C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
    supported ? "Sign in with a passkey" : "Passkeys aren't supported in this browser";
   }

   { svelteHTML.createElement("div", { "class":`divider`,}); { svelteHTML.createElement("span", {});    } }

   { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":passwordSignIn,});
     { const $$_setoN2C = __sveltets_2_ensureComponent(Notes); new $$_setoN2C({ target: __sveltets_2_any(), props: {  "error":form.error,}});}
     { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {            "label":`Username`,"name":`username`,value:username,"required":true,"autocomplete":`username webauthn`,"maxlength":64,"autofocus":!username,}});/*Ωignore_startΩ*/() => username = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
     { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {              "label":`Password`,"name":`password`,"type":`password`,value:password,"required":true,"autocomplete":`current-password`,"maxlength":512,"autofocus":Boolean(username),}});/*Ωignore_startΩ*/() => password = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
     { svelteHTML.createElement("button", {     "type":`submit`,"class":`wide`,"disabled":form.busy,});  }
   }

  if(!reauth){
     { svelteHTML.createElement("p", { "class":`muted small`,}); { svelteHTML.createElement("a", { "href":`/forgot`,});   } }
    if(session.registration){
       { svelteHTML.createElement("p", { "class":`muted small`,});
           { svelteHTML.createElement("a", { "href":`/register?${new URLSearchParams({ return: returnTo })}`,});   }
       }
    }
  }
 Card}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Login__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Login__SvelteComponent_ = ReturnType<typeof Login__SvelteComponent_>;
/*Ωignore_endΩ*/export default Login__SvelteComponent_;