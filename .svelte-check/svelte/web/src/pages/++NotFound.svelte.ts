///<reference types="svelte" />
;
import { session } from "../lib/session.svelte";
import Card from "../components/Card.svelte";
function $$render() {

  
  
;
async () => {

 { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Page not found`,"lead":`There's nothing at this address.`,}});
   { svelteHTML.createElement("p", {}); { svelteHTML.createElement("a", {   "class":`btn primary`,"href":session.user ? "/apps" : "/login",});session.user ? "Your apps" : "Sign in"; } }
 Card}
};
return { props: {} as Record<string, never>, exports: {}, bindings: "", slots: {}, events: {} }}
const NotFound__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_with_any_event($$render()));
/*Ωignore_startΩ*/type NotFound__SvelteComponent_ = InstanceType<typeof NotFound__SvelteComponent_>;
/*Ωignore_endΩ*/export default NotFound__SvelteComponent_;