///<reference types="svelte" />
;
import Icon from "./Icon.svelte";

;type $$ComponentProps =  { size?: number; class?: string; [key: string]: unknown };function $$render() {

  

  let props:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props();
;
async () => {



 { const $$_nocI0C = __sveltets_2_ensureComponent(Icon); new $$_nocI0C({ target: __sveltets_2_any(), props: {   "name":`link`,...props,}});}
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Link__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Link__SvelteComponent_ = ReturnType<typeof Link__SvelteComponent_>;
/*Ωignore_endΩ*/export default Link__SvelteComponent_;