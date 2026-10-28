///<reference types="svelte" />
;
import { ExternalLink } from "@lucide/svelte";
import { api } from "../lib/api";
import { Action } from "../lib/action.svelte";
import { session } from "../lib/session.svelte";
import Flash from "../components/Flash.svelte";
import Notes from "../components/Notes.svelte";
import Title from "../components/Title.svelte";
function $$render() {

  
  
  
  
  
  
  

  interface App {
    id: string;
    name: string;
    url: string;
  }

  let apps = $state<App[] | null>(null);
  const load = new Action();
  load.run(async () => (apps = await api<App[]>("/api/apps")));

  function host(url: string): string {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  }
;
async () => {

 { const $$_eltiT0C = __sveltets_2_ensureComponent(Title); new $$_eltiT0C({ target: __sveltets_2_any(), props: {  "text":`Your apps`,}});}
 { svelteHTML.createElement("h1", {}); session.user?.name ?? session.user?.username; }
 { const $$_hsalF0C = __sveltets_2_ensureComponent(Flash); new $$_hsalF0C({ target: __sveltets_2_any(), props: {}});}
 { const $$_setoN0C = __sveltets_2_ensureComponent(Notes); new $$_setoN0C({ target: __sveltets_2_any(), props: {  "error":load.error,}});}

if(apps){
  if(apps.length === 0){
     { svelteHTML.createElement("section", { "class":`panel`,});
       { svelteHTML.createElement("h2", {});   }
       { svelteHTML.createElement("p", { "class":`muted`,});
                    
        if(session.user?.isAdmin){       { svelteHTML.createElement("a", { "href":`/admin/clients`,});   }   }
       }
     }
  }else{
     { svelteHTML.createElement("p", { "class":`muted`,});       session.user?.username;  }
     { svelteHTML.createElement("ul", { "class":`apps`,});
         for(let app of __sveltets_2_ensureArray(apps)){app.id;
         { svelteHTML.createElement("li", {});
           { svelteHTML.createElement("a", {     "class":`app-tile`,"href":app.url,"rel":`noopener`,});
             { svelteHTML.createElement("span", {   "class":`app-mark`,"aria-hidden":`true`,});app.name.slice(0, 1).toUpperCase(); }
             { svelteHTML.createElement("span", { "class":`app-text`,});
               { svelteHTML.createElement("strong", {});app.name; }
               { svelteHTML.createElement("small", { "class":`muted`,});host(app.url); }
             }
             { const $$_kniLlanretxE3C = __sveltets_2_ensureComponent(ExternalLink); new $$_kniLlanretxE3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
           }
         }
      }
     }
  }
}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Apps__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Apps__SvelteComponent_ = ReturnType<typeof Apps__SvelteComponent_>;
/*Ωignore_endΩ*/export default Apps__SvelteComponent_;