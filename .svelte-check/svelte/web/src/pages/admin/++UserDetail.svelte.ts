///<reference types="svelte" />
;
import { Link, Save } from "@lucide/svelte";
import { api, confirmed } from "../../lib/api";
import { Action } from "../../lib/action.svelte";
import { date, plural, relative } from "../../lib/format";
import { navigate, reload } from "../../lib/router.svelte";
import AdminTabs from "../../components/AdminTabs.svelte";
import CopyRow from "../../components/CopyRow.svelte";
import Field from "../../components/Field.svelte";
import Flash from "../../components/Flash.svelte";
import GroupChecks, { type GroupOption } from "../../components/GroupChecks.svelte";
import Notes from "../../components/Notes.svelte";
import Section from "../../components/Section.svelte";
import Title from "../../components/Title.svelte";
;

  interface UserData {
    id: string;
    username: string;
    name: string | null;
    email: string | null;
    emailVerified: boolean;
    picture: string | null;
    disabled: boolean;
    createdAt: number;
    lastLoginAt: number | null;
    hasPassword: boolean;
    totp: boolean;
    groups: string[];
    passkeys: { id: string; name: string; createdAt: number; lastUsedAt: number | null }[];
    sessionCount: number;
    openLinkExpiresAt: number | null;
    self: boolean;
  };
;type $$ComponentProps =  { params: Record<string, string> };function $$render() {

  
  
  
  
  
  
  
  
  
  
  
  
  


  let { params }:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/ = $props();
  const base = $derived(`/api/admin/users/${encodeURIComponent(params.id ?? "")}`);

  let user = $state<UserData | null>(null);
  let allGroups = $state<GroupOption[]>([]);
  const profile = $state({ username: "", name: "", email: "", picture: "", emailVerified: false });
  let groups = $state<string[]>([]);
  let ttl = $state("3600");
  let link = $state<{ url: string; expiresAt: number } | null>(null);
  let deleteConfirm = $state("");

  const load = new Action();
  const profileAction = new Action();
  const groupsAction = new Action();
  const linkAction = new Action();
  const methodsAction = new Action();
  const accessAction = new Action();
  const deleteAction = new Action();

  async function refresh() {
    const [u, g] = await Promise.all([api<UserData>(base), api<GroupOption[]>("/api/admin/groups")]);
    user = u;
    allGroups = g;
    Object.assign(profile, {
      username: u.username,
      name: u.name ?? "",
      email: u.email ?? "",
      picture: u.picture ?? "",
      emailVerified: u.emailVerified,
    });
    groups = [...u.groups];
  }
  load.run(refresh);

  /** Posts to `base + path`; on success shows the message and reloads this user. */
  async function act(section: Action, path: string, body: object = {}) {
    await section.run(async () => {
      const res = await api<{ message?: string; redirect?: string }>(base + path, body);
      if (res.redirect) return reload(res.redirect);
      await refresh();
      return res;
    });
  }

  function saveProfile(ev: SubmitEvent) {
    ev.preventDefault();
    act(profileAction, "/profile", profile);
  }

  function saveGroups(ev: SubmitEvent) {
    ev.preventDefault();
    act(groupsAction, "/groups", { groups });
  }

  async function createLink(ev: SubmitEvent) {
    ev.preventDefault();
    await linkAction.run(async () => {
      link = await api(base + "/link", { ttl: Number(ttl) });
      await refresh();
    });
  }

  function confirmThen(message: string, section: Action, path: string) {
    if (confirmed(message)) act(section, path);
  }

  async function remove(ev: SubmitEvent) {
    ev.preventDefault();
    const done = await deleteAction.run(() => api(base + "/delete", { confirm: deleteConfirm }));
    if (done) navigate("/admin/users?m=user-deleted");
  }
;
async () => {

 { const $$_eltiT0C = __sveltets_2_ensureComponent(Title); new $$_eltiT0C({ target: __sveltets_2_any(), props: {  "text":user ? `@${user.username}` : "User",}});}
 { const $$_sbaTnimdA0C = __sveltets_2_ensureComponent(AdminTabs); new $$_sbaTnimdA0C({ target: __sveltets_2_any(), props: {}});}
 { svelteHTML.createElement("p", {}); { svelteHTML.createElement("a", {   "class":`btn small`,"href":`/admin/users`,});   } }
 { const $$_hsalF0C = __sveltets_2_ensureComponent(Flash); new $$_hsalF0C({ target: __sveltets_2_any(), props: {}});}
 { const $$_setoN0C = __sveltets_2_ensureComponent(Notes); new $$_setoN0C({ target: __sveltets_2_any(), props: {  "error":load.error,}});}

if(user){
   { svelteHTML.createElement("h1", {});
    user.name ?? user.username;  { svelteHTML.createElement("small", { "class":`muted`,}); user.username; }
    if(user.disabled){ { svelteHTML.createElement("span", { "class":`badge danger`,});  }}
   }
   { svelteHTML.createElement("p", { "class":`muted`,});
      { svelteHTML.createElement("code", {});user.id; }   date(user.createdAt);    relative(user.lastLoginAt);
   }

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Profile`,}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":profileAction.message,"error":profileAction.error,}});}
     { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":saveProfile,});
       { svelteHTML.createElement("div", { "class":`grid2`,});
         { const $$_dleiF3C = __sveltets_2_ensureComponent(Field); const $$_dleiF3 = new $$_dleiF3C({ target: __sveltets_2_any(), props: {            "label":`Username`,"name":`username`,value:profile.username,"required":true,"maxlength":32,"autocomplete":`off`,"hint":`Apps may use this as a mailbox or URL; changing it can break things there.`,}});/*Ωignore_startΩ*/() => profile.username = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF3.$$bindings = 'value';}
         { const $$_dleiF3C = __sveltets_2_ensureComponent(Field); const $$_dleiF3 = new $$_dleiF3C({ target: __sveltets_2_any(), props: {          "label":`Display name`,"name":`name`,value:profile.name,"maxlength":100,"autocomplete":`off`,}});/*Ωignore_startΩ*/() => profile.name = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF3.$$bindings = 'value';}
         { const $$_dleiF3C = __sveltets_2_ensureComponent(Field); const $$_dleiF3 = new $$_dleiF3C({ target: __sveltets_2_any(), props: {            "label":`Email`,"name":`email`,"type":`email`,value:profile.email,"maxlength":254,"autocomplete":`off`,}});/*Ωignore_startΩ*/() => profile.email = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF3.$$bindings = 'value';}
         { const $$_dleiF3C = __sveltets_2_ensureComponent(Field); const $$_dleiF3 = new $$_dleiF3C({ target: __sveltets_2_any(), props: {            "label":`Picture URL`,"name":`picture`,"type":`url`,value:profile.picture,"maxlength":2048,"autocomplete":`off`,}});/*Ωignore_startΩ*/() => profile.picture = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF3.$$bindings = 'value';}
         { svelteHTML.createElement("label", { "class":`check`,});
           { svelteHTML.createElement("input", {    "type":`checkbox`,"bind:checked":profile.emailVerified,});/*Ωignore_startΩ*/() => profile.emailVerified = __sveltets_2_any(null);/*Ωignore_endΩ*/}
           { svelteHTML.createElement("span", {});   }
         }
       }
       { svelteHTML.createElement("div", {});
         { svelteHTML.createElement("button", {   "type":`submit`,"disabled":profileAction.busy,}); { const $$_evaS4C = __sveltets_2_ensureComponent(Save); new $$_evaS4C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}   }
       }
     }
   Section}

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Groups`,"description":"Sent to apps in the `groups` claim, and used to limit who can open each application.",}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":groupsAction.message,"error":groupsAction.error,}});}
     { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":saveGroups,});
       { const $$_skcehCpuorG2C = __sveltets_2_ensureComponent(GroupChecks); const $$_skcehCpuorG2 = new $$_skcehCpuorG2C({ target: __sveltets_2_any(), props: {    "groups":allGroups,selected:groups,}});/*Ωignore_startΩ*/() => groups = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_skcehCpuorG2.$$bindings = 'selected';}
       { svelteHTML.createElement("div", {});
         { svelteHTML.createElement("button", {   "type":`submit`,"disabled":groupsAction.busy,}); { const $$_evaS4C = __sveltets_2_ensureComponent(Save); new $$_evaS4C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}   }
       }
     }
   Section}

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Sign-in link`,"description":`A one-time link that signs this person in so they can add a passkey or password. Use it for new accounts and lost devices.`,}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":linkAction.message,"error":linkAction.error,}});}
    if(link){
       { svelteHTML.createElement("div", { "class":`notice ok`,});
         { svelteHTML.createElement("p", {});
           { svelteHTML.createElement("strong", {});  }     user.username;      relative(link.expiresAt);
              
         }
         { const $$_woRypoC2C = __sveltets_2_ensureComponent(CopyRow); new $$_woRypoC2C({ target: __sveltets_2_any(), props: {    "value":link.url,"label":`Sign-in link`,}});}
       }
    }
    if(user.openLinkExpiresAt){
       { svelteHTML.createElement("div", { "class":`inline-edit`,});
         { svelteHTML.createElement("span", {});    relative(user.openLinkExpiresAt);  }
         { svelteHTML.createElement("button", {       "type":`button`,"class":`small`,"onclick":() => { link = null; act(linkAction, "/link/revoke"); },"disabled":linkAction.busy,});
           
         }
       }
    }
     { svelteHTML.createElement("form", {   "class":`inline-edit`,"onsubmit":createLink,});
       { svelteHTML.createElement("label", {});
         
         { svelteHTML.createElement("select", { "bind:value":ttl,});/*Ωignore_startΩ*/() => ttl = __sveltets_2_any(null);/*Ωignore_endΩ*/
           { svelteHTML.createElement("option", { "value":`900`,});  }
           { svelteHTML.createElement("option", { "value":`3600`,});  }
           { svelteHTML.createElement("option", { "value":`86400`,});  }
           { svelteHTML.createElement("option", { "value":`604800`,});  }
         }
       }
       { svelteHTML.createElement("button", {     "type":`submit`,"class":`primary`,"disabled":linkAction.busy,});
         { const $$_kniL3C = __sveltets_2_ensureComponent(Link); new $$_kniL3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
        user.openLinkExpiresAt ? "Replace link" : "Create link";
       }
     }
   Section}

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Sign-in methods`,}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":methodsAction.message,"error":methodsAction.error,}});}
     { svelteHTML.createElement("ul", { "class":`rows`,});
         for(let p of __sveltets_2_ensureArray(user.passkeys)){p.id;
         { svelteHTML.createElement("li", {});
           { svelteHTML.createElement("div", { "class":`grow`,});
             { svelteHTML.createElement("strong", {}); p.name; }
             { svelteHTML.createElement("br", {});}
             { svelteHTML.createElement("small", { "class":`muted`,}); date(p.createdAt);    relative(p.lastUsedAt); }
           }
           { svelteHTML.createElement("button", {         "type":`button`,"class":`danger small`,"disabled":methodsAction.busy,"onclick":() => confirmThen(`Remove the passkey "${p.name}"?`, methodsAction, `/passkeys/${encodeURIComponent(p.id)}/delete`),});
            
           }
         }
      }
      if(user.hasPassword){
         { svelteHTML.createElement("li", {});
           { svelteHTML.createElement("div", { "class":`grow`,}); { svelteHTML.createElement("strong", {});  } }
           { svelteHTML.createElement("button", {         "type":`button`,"class":`danger small`,"disabled":methodsAction.busy,"onclick":() => confirmThen("Remove this password (and any two-factor setup)?", methodsAction, "/password/remove"),});
            
           }
         }
      }
      if(user.totp){
         { svelteHTML.createElement("li", {});
           { svelteHTML.createElement("div", { "class":`grow`,}); { svelteHTML.createElement("strong", {});  } }
           { svelteHTML.createElement("button", {         "type":`button`,"class":`danger small`,"disabled":methodsAction.busy,"onclick":() => confirmThen("Turn off two-factor codes for this account?", methodsAction, "/totp/reset"),});
             
           }
         }
      }
      if(!user.passkeys.length && !user.hasPassword){
         { svelteHTML.createElement("li", { "class":`muted`,});          }
      }
     }
   Section}

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Access`,}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":accessAction.message,"error":accessAction.error,}});}
     { svelteHTML.createElement("p", { "class":`muted`,});plural(user.sessionCount, "active browser session");    }
     { svelteHTML.createElement("div", { "class":`buttons`,});
       { svelteHTML.createElement("button", {       "type":`button`,"disabled":accessAction.busy,"onclick":() => confirmThen("Sign this account out of every browser and application?", accessAction, "/signout"),});
          
       }
      if(!user.self){
        if(user.disabled){
           { svelteHTML.createElement("button", {     "type":`button`,"disabled":accessAction.busy,"onclick":() => act(accessAction, "/enable"),});  }
        }else{
           { svelteHTML.createElement("button", {         "type":`button`,"class":`danger`,"disabled":accessAction.busy,"onclick":() => confirmThen("Disable this account? They'll be signed out everywhere.", accessAction, "/disable"),});
             
           }
        }
      }
     }
   Section}

  if(!user.self){
     { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Delete account`,"description":`Permanent. Apps keep whatever they stored about this person; a new account will get a new subject id.`,}});
       { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {  "error":deleteAction.error,}});}
       { svelteHTML.createElement("form", {   "class":`inline-edit`,"onsubmit":remove,});
         { svelteHTML.createElement("input", {          "type":`text`,"bind:value":deleteConfirm,"placeholder":`Type ${user.username} to confirm`,"required":true,"autocomplete":`off`,"aria-label":`Confirm username`,});/*Ωignore_startΩ*/() => deleteConfirm = __sveltets_2_any(null);/*Ωignore_endΩ*/}
         { svelteHTML.createElement("button", {     "type":`submit`,"class":`danger`,"disabled":deleteAction.busy,});  }
       }
     Section}
  }
}
};
return { props: {} as any as $$ComponentProps, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const UserDetail__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type UserDetail__SvelteComponent_ = ReturnType<typeof UserDetail__SvelteComponent_>;
/*Ωignore_endΩ*/export default UserDetail__SvelteComponent_;