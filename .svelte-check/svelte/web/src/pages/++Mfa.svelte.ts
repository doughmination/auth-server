///<reference types="svelte" />
;
import KeyRound from "../lib/icons/KeyRound.svelte";
import LogIn from "../lib/icons/LogIn.svelte";
import { ApiError, api } from "../lib/api";
import { Action } from "../lib/action.svelte";
import { navigate, reload } from "../lib/router.svelte";
import { getPasskey, passkeyMessage, passkeysSupported } from "../lib/webauthn";
import Card from "../components/Card.svelte";
import Field from "../components/Field.svelte";
import Notes from "../components/Notes.svelte";
function $$render() {

  
  
  
  
  
  
  
  
  

  let step = $state<{ totp: boolean; passkey: boolean } | null>(null);
  let code = $state("");
  const form = new Action();
  let passkeyError = $state("");
  let passkeyBusy = $state(false);
  const supported = passkeysSupported();

  /** The half-finished sign-in is gone (expired, or too many tries): back to the start. */
  function restartIfNeeded(err: unknown) {
    if (err instanceof ApiError && err.data.restart) navigate("/login", { replace: true });
  }

  api<{ totp: boolean; passkey: boolean }>("/api/login/mfa").then((s) => (step = s), restartIfNeeded);

  async function submitCode(ev: SubmitEvent) {
    ev.preventDefault();
    await form.run(async () => {
      try {
        const { redirect } = await api<{ redirect: string }>("/api/login/mfa", { code });
        reload(redirect);
      } catch (err) {
        code = "";
        restartIfNeeded(err);
        throw err;
      }
    });
  }

  async function usePasskey() {
    passkeyBusy = true;
    passkeyError = "";
    try {
      const to = await getPasskey("/api/login/mfa/passkey");
      if (to) reload(to);
    } catch (err) {
      restartIfNeeded(err);
      passkeyError = passkeyMessage(err);
    } finally {
      passkeyBusy = false;
    }
  }
;
async () => {

  { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {    children:() => { return __sveltets_2_any(0); },"title":`One more step`,"lead":!step
    ? undefined
    : step.totp && step.passkey
      ? "Use one of your passkeys, or enter the code from your authenticator app."
      : step.passkey
        ? "Use one of your passkeys to finish signing in."
        : "Open your authenticator app and enter the 6-digit code for this account.",}});
  if(step){
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {  "error":passkeyError,}});}
    if(step.passkey){
       { svelteHTML.createElement("button", {       "type":`button`,"class":step.totp ? "wide" : "primary wide","onclick":usePasskey,"disabled":!supported || passkeyBusy,});
         { const $$_dnuoRyeK2C = __sveltets_2_ensureComponent(KeyRound); new $$_dnuoRyeK2C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
        supported ? "Use a passkey" : "Passkeys aren't supported in this browser";
       }
    }
    if(step.passkey && step.totp){
       { svelteHTML.createElement("div", { "class":`divider`,}); { svelteHTML.createElement("span", {});    } }
    }
    if(step.totp){
       { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":submitCode,});
         { const $$_setoN2C = __sveltets_2_ensureComponent(Notes); new $$_setoN2C({ target: __sveltets_2_any(), props: {  "error":form.error,}});}
          { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {              "label":`Code`,"name":`code`,value:code,"required":true,"autocomplete":`one-time-code`,"inputmode":`numeric`,"pattern":"[0-9 ]{6,7}","maxlength":7,"autofocus":true,}});/*Ωignore_startΩ*/() => code = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
         { svelteHTML.createElement("button", {     "type":`submit`,"class":`primary wide`,"disabled":form.busy,});
           { const $$_nIgoL3C = __sveltets_2_ensureComponent(LogIn); new $$_nIgoL3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
          
         }
       }
    }
  }
   { svelteHTML.createElement("p", { "class":`muted small`,}); { svelteHTML.createElement("a", {   "class":`btn wide`,"href":`/login`,});  } }
 Card}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Mfa__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Mfa__SvelteComponent_ = ReturnType<typeof Mfa__SvelteComponent_>;
/*Ωignore_endΩ*/export default Mfa__SvelteComponent_;