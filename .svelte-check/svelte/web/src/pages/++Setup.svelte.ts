///<reference types="svelte" />
;
import LogIn from "../lib/icons/LogIn.svelte";
import UserPlus from "../lib/icons/UserPlus.svelte";
import { ApiError, api } from "../lib/api";
import { Action } from "../lib/action.svelte";
import { reload } from "../lib/router.svelte";
import Card from "../components/Card.svelte";
import Field from "../components/Field.svelte";
import Notes from "../components/Notes.svelte";
function $$render() {

  
  
  
  
  
  
  
  

  let status = $state<"open" | "done" | "unconfigured" | null>(null);
  const values = $state({ token: "", username: "", name: "", email: "" });
  const form = new Action();

  api<{ state: "open" | "done" | "unconfigured" }>("/api/setup").then((r) => (status = r.state));

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    await form.run(async () => {
      try {
        reload((await api<{ redirect: string }>("/api/setup", values)).redirect);
      } catch (err) {
        if (err instanceof ApiError && err.data.done) status = "done";
        throw err;
      }
    });
  }
;
async () => {

if(status === "done"){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Setup is done`,"lead":`This server already has accounts.`,}});
     { svelteHTML.createElement("p", {}); { svelteHTML.createElement("a", {   "class":`btn primary`,"href":`/login`,}); { const $$_nIgoL3C = __sveltets_2_ensureComponent(LogIn); new $$_nIgoL3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}   } }
   Card}
} else if (status === "unconfigured"){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Almost there`,}});
     { svelteHTML.createElement("p", {});
         { svelteHTML.createElement("code", {});  }   { svelteHTML.createElement("code", {});    }   { svelteHTML.createElement("code", {});  }
               
     }
   Card}
} else if (status === "open"){
   { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Create the first admin`,"lead":`This page only works while the server has no accounts. You'll add a passkey or password straight after.`,}});
     { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":submit,});
       { const $$_setoN2C = __sveltets_2_ensureComponent(Notes); new $$_setoN2C({ target: __sveltets_2_any(), props: {  "error":form.error,}});}
        { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {            "label":`Setup token`,"name":`token`,"type":`password`,value:values.token,"required":true,"autocomplete":`off`,"hint":`The SETUP_TOKEN secret.`,"autofocus":true,}});/*Ωignore_startΩ*/() => values.token = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {          "label":`Username`,"name":`username`,value:values.username,"required":true,"autocomplete":`username`,"maxlength":32,}});/*Ωignore_startΩ*/() => values.username = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {          "label":`Display name`,"name":`name`,value:values.name,"autocomplete":`name`,"maxlength":100,}});/*Ωignore_startΩ*/() => values.name = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {            "label":`Email`,"name":`email`,"type":`email`,value:values.email,"autocomplete":`email`,"maxlength":254,}});/*Ωignore_startΩ*/() => values.email = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { svelteHTML.createElement("button", {     "type":`submit`,"class":`primary wide`,"disabled":form.busy,});
         { const $$_sulPresU3C = __sveltets_2_ensureComponent(UserPlus); new $$_sulPresU3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
          
       }
     }
   Card}
}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Setup__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Setup__SvelteComponent_ = ReturnType<typeof Setup__SvelteComponent_>;
/*Ωignore_endΩ*/export default Setup__SvelteComponent_;