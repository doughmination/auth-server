///<reference types="svelte" />
;
import { Shield } from "@lucide/svelte";
import { api } from "../lib/api";
import { Action } from "../lib/action.svelte";
import { navigate } from "../lib/router.svelte";
import Card from "../components/Card.svelte";
import Field from "../components/Field.svelte";
import Notes from "../components/Notes.svelte";
function $$render() {

  
  
  
  
  
  
  

  let setup = $state<{ qr: string; secret: string } | null>(null);
  let code = $state("");
  const start = new Action();
  const form = new Action();

  // Each visit makes a fresh secret; it only takes effect once a code from it is confirmed.
  start.run(async () => (setup = await api("/api/account/totp/start", {})));

  async function confirm(ev: SubmitEvent) {
    ev.preventDefault();
    const done = await form.run(() => api("/api/account/totp/confirm", { code }));
    if (done) navigate("/settings?m=totp-enabled");
    else code = "";
  }
;
async () => {

 { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Scan this code`,"lead":`Use any authenticator app (1Password, Aegis, Google Authenticator…), then enter the code it shows.`,}});
   { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {  "error":start.error || form.error,}});}
  if(setup){
     { svelteHTML.createElement("img", {          "class":`qr`,"src":setup.qr,"alt":`QR code for your authenticator app`,"width":`220`,"height":`220`,});}
     { svelteHTML.createElement("details", {});
       { svelteHTML.createElement("summary", {});   }
       { svelteHTML.createElement("p", {});    }
       { svelteHTML.createElement("p", { "class":`secret`,}); { svelteHTML.createElement("code", {});setup.secret; } }
     }
     { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":confirm,});
        { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {            "label":`Code`,"name":`code`,value:code,"required":true,"inputmode":`numeric`,"autocomplete":`one-time-code`,"maxlength":7,"autofocus":true,}});/*Ωignore_startΩ*/() => code = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { svelteHTML.createElement("button", {     "type":`submit`,"class":`primary wide`,"disabled":form.busy,});
         { const $$_dleihS3C = __sveltets_2_ensureComponent(Shield); new $$_dleihS3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
         
       }
     }
  }
   { svelteHTML.createElement("p", { "class":`small`,}); { svelteHTML.createElement("a", {   "class":`btn wide`,"href":`/settings`,});  } }
 Card}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const TotpSetup__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type TotpSetup__SvelteComponent_ = ReturnType<typeof TotpSetup__SvelteComponent_>;
/*Ωignore_endΩ*/export default TotpSetup__SvelteComponent_;