///<reference types="svelte" />
;
  export interface GroupOption {
    name: string;
    description: string;
  }
;;
;type $$ComponentProps =  { groups: GroupOption[]; selected?: string[] };function $$render() {

  let { groups, selected = $bindable([]) }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props()/*Ωignore_startΩ*/;selected;/*Ωignore_endΩ*/;
;
async () => {



if(groups.length === 0){
   { svelteHTML.createElement("p", { "class":`muted`,});   }
}else{
   { svelteHTML.createElement("div", { "class":`checks`,});
       for(let g of __sveltets_2_ensureArray(groups)){g.name;
       { svelteHTML.createElement("label", { "class":`check`,});
         { svelteHTML.createElement("input", {     "type":`checkbox`,"value":g.name,});selected = __sveltets_2_any(null);}
         { svelteHTML.createElement("span", {});
          g.name;
          if(g.description){ { svelteHTML.createElement("small", { "class":`muted`,});  g.description; }}
         }
       }
    }
   }
}
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings('selected'), slots: {}, events: {} }}
const GroupChecks__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type GroupChecks__SvelteComponent_ = ReturnType<typeof GroupChecks__SvelteComponent_>;
/*Ωignore_endΩ*/export default GroupChecks__SvelteComponent_;