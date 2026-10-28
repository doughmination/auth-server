///<reference types="svelte" />
;
import { session } from "../lib/session.svelte";
function $$render() {

  
;
async () => {

if(session.contact){ { svelteHTML.createElement("a", { "href":`mailto:${session.contact}`,});session.contact; }}else{    }
};
return { props: {} as Record<string, never>, exports: {}, bindings: "", slots: {}, events: {} }}
const Contact__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_with_any_event($$render()));
/*Ωignore_startΩ*/type Contact__SvelteComponent_ = InstanceType<typeof Contact__SvelteComponent_>;
/*Ωignore_endΩ*/export default Contact__SvelteComponent_;