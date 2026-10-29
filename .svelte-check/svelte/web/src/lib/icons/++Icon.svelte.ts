///<reference types="svelte" />
;
;type $$ComponentProps =  {
    name: string;
    size?: number;
    type?: "bold" | "broken" | "bulk" | "linear" | "outline" | "twotone";
    class?: string;
    [key: string]: unknown;
  };function $$render() {

  // One iconsax icon, the set doughmination.gay uses. Sized by `size`, or by a CSS class
  let {
    name,
    size = 24,
    type = "bulk",
    class: className = "",
    ...rest
  }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props();
;
async () => {



 { svelteHTML.createElement("iconsax-icon", {       name,type,size,"class":className,"aria-hidden":`true`,...rest,}); }
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Icon__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Icon__SvelteComponent_ = ReturnType<typeof Icon__SvelteComponent_>;
/*Ωignore_endΩ*/export default Icon__SvelteComponent_;