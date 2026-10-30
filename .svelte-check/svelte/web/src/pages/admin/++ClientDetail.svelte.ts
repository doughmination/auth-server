///<reference types="svelte" />
;
import { untrack } from "svelte";
import Save from "../../lib/icons/Save.svelte";
import { api, confirmed } from "../../lib/api";
import { Action } from "../../lib/action.svelte";
import { navigate } from "../../lib/router.svelte";
import AdminTabs from "../../components/AdminTabs.svelte";
import ClientFields, { type ClientValues } from "../../components/ClientFields.svelte";
import CopyRow from "../../components/CopyRow.svelte";
import type { GroupOption } from "../../components/GroupChecks.svelte";
import Notes from "../../components/Notes.svelte";
import Section from "../../components/Section.svelte";
import Title from "../../components/Title.svelte";
import { newSecrets, type ClientData } from "./Clients.svelte";

;type $$ComponentProps =  { params: Record<string, string> };function $$render() {

  
  
  
  
  
  
  
  
  
  
  
  
  

  let { params }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props();
  const base = $derived(`/api/admin/clients/${encodeURIComponent(params.id ?? "")}`);

  let client = $state<ClientData | null>(null);
  let groups = $state<GroupOption[]>([]);
  let values = $state<ClientValues>({ name: "", homeUrl: "", iconUrl: "", redirectUris: "", postLogoutRedirectUris: "", allowedGroups: [] });
  // A secret just created on the previous page (taken, so it's only ever shown
  // once), or one from rotating it here.
  let secret = $state<string | null>(
    untrack(() => {
      const created = newSecrets.get(params.id ?? "") ?? null;
      newSecrets.delete(params.id ?? "");
      return created;
    }),
  );

  const load = new Action();
  const settings = new Action();
  const secretAction = new Action();
  const deleteAction = new Action();

  async function refresh() {
    const [c, g] = await Promise.all([api<ClientData>(base), api<GroupOption[]>("/api/admin/groups")]);
    client = c;
    groups = g;
    values = {
      name: c.name,
      homeUrl: c.homeUrl ?? "",
      iconUrl: c.iconUrl ?? "",
      redirectUris: c.redirectUris.join("\n"),
      postLogoutRedirectUris: c.postLogoutRedirectUris.join("\n"),
      allowedGroups: [...c.allowedGroups],
    };
  }
  load.run(refresh);

  async function save(ev: SubmitEvent) {
    ev.preventDefault();
    await settings.run(async () => {
      const res = await api(base, values);
      await refresh();
      return res;
    });
  }

  async function rotate() {
    const message = client!.isPublic
      ? "Give this app a secret and make it confidential?"
      : "Replace the secret? The old one stops working immediately.";
    if (!confirmed(message)) return;
    await secretAction.run(async () => {
      secret = (await api<{ secret: string }>(`${base}/secret`, {})).secret;
      await refresh();
    });
  }

  async function makePublic() {
    if (!confirmed("Remove the secret and make this a public PKCE client?")) return;
    await secretAction.run(async () => {
      const res = await api(`${base}/public`, {});
      secret = null;
      await refresh();
      return res;
    });
  }

  async function remove() {
    if (!confirmed(`Delete ${client!.name}? People won't be able to sign in to it.`)) return;
    const done = await deleteAction.run(() => api(`${base}/delete`, {}));
    if (done) navigate("/admin/clients?m=client-deleted");
  }
;
async () => {

 { const $$_eltiT0C = __sveltets_2_ensureComponent(Title); new $$_eltiT0C({ target: __sveltets_2_any(), props: {  "text":client?.name ?? "Application",}});}
 { const $$_sbaTnimdA0C = __sveltets_2_ensureComponent(AdminTabs); new $$_sbaTnimdA0C({ target: __sveltets_2_any(), props: {}});}
 { svelteHTML.createElement("p", {}); { svelteHTML.createElement("a", {   "class":`btn small`,"href":`/admin/clients`,});   } }
 { const $$_setoN0C = __sveltets_2_ensureComponent(Notes); new $$_setoN0C({ target: __sveltets_2_any(), props: {  "error":load.error,}});}

if(client){
   { svelteHTML.createElement("h1", {});client.name; }

  if(secret){
     { svelteHTML.createElement("div", { "class":`notice ok`,});
       { svelteHTML.createElement("p", {}); { svelteHTML.createElement("strong", {});  }              }
       { const $$_woRypoC1C = __sveltets_2_ensureComponent(CopyRow); new $$_woRypoC1C({ target: __sveltets_2_any(), props: {    "value":secret,"label":`Client secret`,}});}
     }
  }

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Connecting the app`,}});
     { svelteHTML.createElement("dl", { "class":`kv`,});
         for(let [k, v] of __sveltets_2_ensureArray(([
        ["Issuer", client.issuer],
        ["Discovery", client.discovery],
        ["Client id", client.id],
        ["Token auth", client.isPublic ? "none (PKCE)" : "client_secret_basic or client_secret_post"],
        ["Scopes", "openid profile email groups (+ offline_access for refresh tokens)"],
      ]))){k;
         { svelteHTML.createElement("dt", {});k; }
         { svelteHTML.createElement("dd", {}); { svelteHTML.createElement("code", {});v; } }
      }
     }
   Section}

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Settings`,}});
     { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":save,});
       { const $$_setoN2C = __sveltets_2_ensureComponent(Notes); new $$_setoN2C({ target: __sveltets_2_any(), props: {    "ok":settings.message,"error":settings.error,}});}
       { const $$_sdleiFtneilC2C = __sveltets_2_ensureComponent(ClientFields); const $$_sdleiFtneilC2 = new $$_sdleiFtneilC2C({ target: __sveltets_2_any(), props: {   values,groups,}});/*Ωignore_startΩ*/() => values = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_sdleiFtneilC2.$$bindings = 'values';}
       { svelteHTML.createElement("div", {});
         { svelteHTML.createElement("button", {   "type":`submit`,"disabled":settings.busy,}); { const $$_evaS4C = __sveltets_2_ensureComponent(Save); new $$_evaS4C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}  }
       }
     }
   Section}

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Client secret`,}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":secretAction.message,"error":secretAction.error,}});}
     { svelteHTML.createElement("p", { "class":`muted`,});
      client.isPublic
        ? "This is a public client: it has no secret and must use PKCE."
        : "Rotating the secret breaks the app until it's given the new one.";
     }
     { svelteHTML.createElement("div", { "class":`buttons`,});
       { svelteHTML.createElement("button", {     "type":`button`,"onclick":rotate,"disabled":secretAction.busy,});client.isPublic ? "Create a secret" : "Rotate secret"; }
      if(!client.isPublic){
         { svelteHTML.createElement("button", {       "type":`button`,"class":`danger`,"onclick":makePublic,"disabled":secretAction.busy,});  }
      }
     }
   Section}

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Delete application`,"description":`Its refresh tokens stop working immediately; issued access tokens are refused by /userinfo.`,}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {  "error":deleteAction.error,}});}
     { svelteHTML.createElement("button", {       "type":`button`,"class":`danger`,"onclick":remove,"disabled":deleteAction.busy,});  }
   Section}
}
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const ClientDetail__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type ClientDetail__SvelteComponent_ = ReturnType<typeof ClientDetail__SvelteComponent_>;
/*Ωignore_endΩ*/export default ClientDetail__SvelteComponent_;