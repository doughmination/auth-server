///<reference types="svelte" />
;
import { ERRORS } from "../lib/messages";
import { query } from "../lib/router.svelte";
import Card from "../components/Card.svelte";
function $$render() {

  
  
  

  // Fixed messages only: the code picks one, so a crafted link can't write the text.
  const error = ERRORS[query().get("code") ?? ""] ?? {
    title: "Something went wrong",
    text: "That request couldn't be completed. Go back to the app and try again.",
  };
;
async () => {

 { const $$_draC0C = __sveltets_2_ensureComponent(Card); new $$_draC0C({ target: __sveltets_2_any(), props: {    "title":error.title,"lead":error.text,}});}
};
return { props: {} as Record<string, never>, exports: {}, bindings: "", slots: {}, events: {} }}
const ErrorPage__SvelteComponent_ = __sveltets_2_isomorphic_component(__sveltets_2_with_any_event($$render()));
/*Ωignore_startΩ*/type ErrorPage__SvelteComponent_ = InstanceType<typeof ErrorPage__SvelteComponent_>;
/*Ωignore_endΩ*/export default ErrorPage__SvelteComponent_;