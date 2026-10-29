///<reference types="svelte" />
;
import LogIn from "../lib/icons/LogIn.svelte";
import UserPlus from "../lib/icons/UserPlus.svelte";
import { api } from "../lib/api";
import { Action } from "../lib/action.svelte";
import { navigate, query, reload } from "../lib/router.svelte";
import { session } from "../lib/session.svelte";
import Card from "../components/Card.svelte";
import Field from "../components/Field.svelte";
import Notes from "../components/Notes.svelte";
function $$render() {

  
  
  
  
  
  
  
  
  

  const PASSWORD_MIN = 10;
  const returnTo = query().get("return") ?? "/apps";

  if (session.user) reload(returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/apps");
  else if (session.needsSetup) navigate("/setup", { replace: true });

  const values = $state({ username: "", name: "", email: "", password: "", confirm: "" });
  const form = new Action();

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await form.run(async () => {
      try {
        reload((await api<{ redirect: string }>("/api/register", { ...values, return: returnTo })).redirect);
      } finally {
        // Never keep the password around after a failed attempt.
        values.password = values.confirm = "";
      }
    });
  }
;
async () => {

if(!session.registration){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Sign-ups are closed`,"lead":`Accounts on this server are created by an admin.`,}});
     { svelteHTML.createElement("p", {}); { svelteHTML.createElement("a", {   "class":`btn primary`,"href":`/login`,}); { const $$_nIgoL3C = __sveltets_2_ensureComponent(LogIn); new $$_nIgoL3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}   } }
   Card}
}else{
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Create an account`,"lead":`You can add a passkey straight after.`,}});
     { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":submit,});
       { const $$_setoN2C = __sveltets_2_ensureComponent(Notes); new $$_setoN2C({ target: __sveltets_2_any(), props: {  "error":form.error,}});}
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {            "label":`Username`,"name":`username`,value:values.username,"required":true,"autocomplete":`username`,"maxlength":32,"autofocus":true,"hint":`Lowercase letters, digits, dots, dashes or underscores. You can't change it later.`,}});/*Ωignore_startΩ*/() => values.username = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {          "label":`Display name`,"name":`name`,value:values.name,"autocomplete":`name`,"maxlength":100,}});/*Ωignore_startΩ*/() => values.name = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {              "label":`Email`,"name":`email`,"type":`email`,value:values.email,"required":true,"autocomplete":`email`,"maxlength":254,"hint":`We'll send a link to verify it.`,}});/*Ωignore_startΩ*/() => values.email = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {              "label":`Password`,"name":`password`,"type":`password`,value:values.password,"required":true,"autocomplete":`new-password`,"maxlength":512,"hint":`At least ${PASSWORD_MIN} characters.`,}});/*Ωignore_startΩ*/() => values.password = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {            "label":`Confirm password`,"name":`confirm`,"type":`password`,value:values.confirm,"required":true,"autocomplete":`new-password`,"maxlength":512,}});/*Ωignore_startΩ*/() => values.confirm = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { svelteHTML.createElement("p", { "class":`muted small`,});
                 { svelteHTML.createElement("a", { "href":`/terms`,});  }   { svelteHTML.createElement("a", { "href":`/privacy`,});  }
       }
       { svelteHTML.createElement("button", {     "type":`submit`,"class":`primary wide`,"disabled":form.busy,});
         { const $$_sulPresU3C = __sveltets_2_ensureComponent(UserPlus); new $$_sulPresU3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
         
       }
     }
     { svelteHTML.createElement("p", { "class":`muted small`,});
           { svelteHTML.createElement("a", { "href":`/login?${new URLSearchParams({ return: returnTo })}`,});  }
     }
   Card}
}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Register__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Register__SvelteComponent_ = ReturnType<typeof Register__SvelteComponent_>;
/*Ωignore_endΩ*/export default Register__SvelteComponent_;