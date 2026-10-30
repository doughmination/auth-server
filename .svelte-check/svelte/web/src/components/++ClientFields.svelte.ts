///<reference types="svelte" />
;
  export interface ClientValues {
    name: string;
    homeUrl: string;
    iconUrl: string;
    redirectUris: string;
    postLogoutRedirectUris: string;
    allowedGroups: string[];
  }
;;

import Field from "./Field.svelte";
import GroupChecks, { type GroupOption } from "./GroupChecks.svelte";

;type $$ComponentProps =  { values: ClientValues; groups: GroupOption[] };function $$render() {

  
  

  let { values = $bindable(), groups }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props()/*Ωignore_startΩ*/;values;/*Ωignore_endΩ*/;
;
async () => {



 { const $$_dleiF0C = __sveltets_2_ensureComponent(Field); const $$_dleiF0 = new $$_dleiF0C({ target: __sveltets_2_any(), props: {            "label":`Name`,"name":`name`,value:values.name,"required":true,"maxlength":100,"autocomplete":`off`,"hint":`Shown to people when they're asked to sign in.`,}});/*Ωignore_startΩ*/() => values.name = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF0.$$bindings = 'value';}
 { const $$_dleiF0C = __sveltets_2_ensureComponent(Field); const $$_dleiF0 = new $$_dleiF0C({ target: __sveltets_2_any(), props: {                 "label":`Website`,"name":`homeUrl`,"type":`url`,value:values.homeUrl,"maxlength":2048,"autocomplete":`off`,"placeholder":`https://app.example.com/`,"hint":`Optional. Where the app lives: with one, it's listed on everyone's “Your apps” page (if their groups allow it).`,}});/*Ωignore_startΩ*/() => values.homeUrl = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF0.$$bindings = 'value';}
 { const $$_dleiF0C = __sveltets_2_ensureComponent(Field); const $$_dleiF0 = new $$_dleiF0C({ target: __sveltets_2_any(), props: {                 "label":`Icon`,"name":`iconUrl`,"type":`url`,value:values.iconUrl,"maxlength":2048,"autocomplete":`off`,"placeholder":`https://app.example.com/favicon.png`,"hint":`Optional. An https image shown for the app on “Your apps”; without one, its first letter is used.`,}});/*Ωignore_startΩ*/() => values.iconUrl = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF0.$$bindings = 'value';}
 { svelteHTML.createElement("label", { "class":`field`,});
   { svelteHTML.createElement("span", {});  }
   { svelteHTML.createElement("textarea", {     "bind:value":values.redirectUris,"rows":3,"required":true,"placeholder":`https://app.example.com/auth/callback`,});/*Ωignore_startΩ*/() => values.redirectUris = __sveltets_2_any(null);/*Ωignore_endΩ*/ }
   { svelteHTML.createElement("small", { "class":`muted`,});     }
 }
 { svelteHTML.createElement("label", { "class":`field`,});
   { svelteHTML.createElement("span", {});   }
   { svelteHTML.createElement("textarea", {     "bind:value":values.postLogoutRedirectUris,"rows":2,"placeholder":`https://app.example.com/`,});/*Ωignore_startΩ*/() => values.postLogoutRedirectUris = __sveltets_2_any(null);/*Ωignore_endΩ*/ }
   { svelteHTML.createElement("small", { "class":`muted`,});           }
 }
 { svelteHTML.createElement("fieldset", {});
   { svelteHTML.createElement("legend", {});    }
   { svelteHTML.createElement("p", { "class":`muted small`,});       }
   { const $$_skcehCpuorG1C = __sveltets_2_ensureComponent(GroupChecks); const $$_skcehCpuorG1 = new $$_skcehCpuorG1C({ target: __sveltets_2_any(), props: {   groups,selected:values.allowedGroups,}});/*Ωignore_startΩ*/() => values.allowedGroups = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_skcehCpuorG1.$$bindings = 'selected';}
 }
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings('values'), slots: {}, events: {} }}
const ClientFields__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type ClientFields__SvelteComponent_ = ReturnType<typeof ClientFields__SvelteComponent_>;
/*Ωignore_endΩ*/export default ClientFields__SvelteComponent_;