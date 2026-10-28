///<reference types="svelte" />
;
import { api } from "../lib/api";
import { Action } from "../lib/action.svelte";
import Card from "../components/Card.svelte";
import Field from "../components/Field.svelte";
import Notes from "../components/Notes.svelte";
function $$render() {

  
  
  
  
  

  let account = $state("");
  let sent = $state(false);
  const form = new Action();

  async function submit(ev: SubmitEvent) {
    ev.preventDefault();
    // The answer is the same whether or not the account exists.
    await form.run(async () => {
      await api("/api/forgot", { account });
      sent = true;
    });
  }
;
async () => {

 { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Forgot your password?`,}});
  if(sent){
     { svelteHTML.createElement("p", {   "class":`notice ok`,"role":`status`,});
                         
     }
     { svelteHTML.createElement("p", { "class":`muted`,});         }
  }else{
     { svelteHTML.createElement("p", { "class":`muted`,});
                          
      
     }
     { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":submit,});
       { const $$_setoN2C = __sveltets_2_ensureComponent(Notes); new $$_setoN2C({ target: __sveltets_2_any(), props: {  "error":form.error,}});}
        { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {          "label":`Username or email`,"name":`account`,value:account,"required":true,"autocomplete":`username`,"maxlength":254,"autofocus":true,}});/*Ωignore_startΩ*/() => account = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { svelteHTML.createElement("button", {     "type":`submit`,"class":`primary wide`,"disabled":form.busy,});   }
     }
  }
   { svelteHTML.createElement("p", { "class":`muted small`,}); { svelteHTML.createElement("a", { "href":`/login`,});    } }
 Card}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Forgot__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Forgot__SvelteComponent_ = ReturnType<typeof Forgot__SvelteComponent_>;
/*Ωignore_endΩ*/export default Forgot__SvelteComponent_;