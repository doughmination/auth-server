///<reference types="svelte" />
;
import { KeyRound, Save } from "@lucide/svelte";
import { api, confirmed } from "../lib/api";
import { Action } from "../lib/action.svelte";
import { date, relative } from "../lib/format";
import { navigate, reload } from "../lib/router.svelte";
import { createPasskey, passkeyMessage, passkeysSupported } from "../lib/webauthn";
import Field from "../components/Field.svelte";
import Flash from "../components/Flash.svelte";
import Notes from "../components/Notes.svelte";
import Section from "../components/Section.svelte";
import Title from "../components/Title.svelte";
function $$render() {

  
  
  
  
  
  
  
  
  
  
  

  interface AccountData {
    username: string;
    name: string | null;
    email: string | null;
    emailVerified: boolean;
    picture: string | null;
    hasPassword: boolean;
    totp: boolean;
    recentAuth: boolean;
    passkeys: { id: string; name: string; synced: boolean; createdAt: number; lastUsedAt: number | null }[];
    sessions: {
      id: string;
      current: boolean;
      device: string;
      ip: string | null;
      method: string;
      createdAt: number;
      lastSeenAt: number;
    }[];
  }

  const PASSWORD_MIN = 10;

  let data = $state<AccountData | null>(null);
  const profile = $state({ name: "", email: "", picture: "" });
  const passwords = $state({ password: "", confirm: "" });
  const removal = $state({ confirm: "", password: "" });
  let newPasskeyName = $state("");
  let totpCode = $state("");
  let renames = $state<Record<string, string>>({});

  // One Action per section, so each shows its own result next to its form.
  const load = new Action();
  const profileAction = new Action();
  const passkeyAction = new Action();
  const passwordAction = new Action();
  const totpAction = new Action();
  const sessionAction = new Action();
  const deleteAction = new Action();

  async function refresh() {
    const d = await api<AccountData>("/api/account");
    data = d;
    Object.assign(profile, { name: d.name ?? "", email: d.email ?? "", picture: d.picture ?? "" });
    renames = Object.fromEntries(d.passkeys.map((p) => [p.id, p.name]));
  }
  load.run(refresh);

  /** Runs `call` in a section; on success shows its message and reloads the page's data. */
  async function act(section: Action, call: () => Promise<{ message?: string | null; redirect?: string }>) {
    await section.run(async () => {
      const res = await call();
      if (res.redirect) return reload(res.redirect);
      await refresh();
      return res;
    });
  }

  const post = (path: string, body: object = {}) => api<{ message?: string; redirect?: string }>(path, body);

  function saveProfile(ev: SubmitEvent) {
    ev.preventDefault();
    act(profileAction, () => post("/api/account/profile", profile));
  }

  async function addPasskey(ev: SubmitEvent) {
    ev.preventDefault();
    passkeyAction.busy = true;
    passkeyAction.error = "";
    passkeyAction.message = "";
    try {
      if (await createPasskey(newPasskeyName.trim())) {
        newPasskeyName = "";
        await refresh();
        passkeyAction.message = "Passkey added.";
      }
    } catch (err) {
      passkeyAction.error = passkeyMessage(err);
    } finally {
      passkeyAction.busy = false;
    }
  }

  function renamePasskey(ev: SubmitEvent, id: string) {
    ev.preventDefault();
    act(passkeyAction, () => post(`/api/account/passkeys/${encodeURIComponent(id)}/rename`, { name: renames[id] }));
  }

  function removePasskey(id: string, name: string) {
    if (!confirmed(`Remove the passkey "${name}"?`)) return;
    act(passkeyAction, () => post(`/api/account/passkeys/${encodeURIComponent(id)}/delete`));
  }

  function setPassword(ev: SubmitEvent) {
    ev.preventDefault();
    act(passwordAction, async () => {
      try {
        return await post("/api/account/password", passwords);
      } finally {
        passwords.password = passwords.confirm = "";
      }
    });
  }

  function removePassword() {
    if (!confirmed("Remove your password? You'll only be able to sign in with a passkey.")) return;
    act(passwordAction, () => post("/api/account/password/remove"));
  }

  function disableTotp(ev: SubmitEvent) {
    ev.preventDefault();
    act(totpAction, async () => {
      try {
        return await post("/api/account/totp/disable", { code: totpCode });
      } finally {
        totpCode = "";
      }
    });
  }

  function resendVerification() {
    act(profileAction, () => post("/api/account/email/verify"));
  }

  function revokeSession(id: string) {
    act(sessionAction, () => post(`/api/account/sessions/${encodeURIComponent(id)}/revoke`));
  }

  function revokeOthers() {
    act(sessionAction, () => post("/api/account/sessions/revoke-others"));
  }

  function deleteAccount(ev: SubmitEvent) {
    ev.preventDefault();
    if (!confirmed("Delete your account for good? This can't be undone.")) return;
    act(deleteAction, () => post("/api/account/delete", removal));
  }

  const supported = passkeysSupported();
;
async () => {

 { const $$_eltiT0C = __sveltets_2_ensureComponent(Title); new $$_eltiT0C({ target: __sveltets_2_any(), props: {  "text":`Settings`,}});}

if(load.error){
   { const $$_setoN0C = __sveltets_2_ensureComponent(Notes); new $$_setoN0C({ target: __sveltets_2_any(), props: {  "error":load.error,}});}
} else if (data){
   { svelteHTML.createElement("h1", {});  }
   { const $$_hsalF0C = __sveltets_2_ensureComponent(Flash); new $$_hsalF0C({ target: __sveltets_2_any(), props: {}});}
  if(!data.recentAuth){
     { svelteHTML.createElement("p", { "class":`notice`,});
                
       { svelteHTML.createElement("a", {  "href":`/login?${new URLSearchParams({ return: "/settings", reauth: "1" })}`,...__sveltets_2_empty({"data-reload":true}),});   } 
     }
  }

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Profile`,"description":`Shared with the apps you sign in to.`,}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":profileAction.message,"error":profileAction.error,}});}
     { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":saveProfile,});
       { svelteHTML.createElement("label", { "class":`field`,});
         { svelteHTML.createElement("span", {});  }
          { svelteHTML.createElement("input", {    "type":`text`,"value":data.username,"disabled":true,});}
         { svelteHTML.createElement("small", { "class":`muted`,});      }
       }
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {          "label":`Display name`,"name":`name`,value:profile.name,"autocomplete":`name`,"maxlength":100,}});/*Ωignore_startΩ*/() => profile.name = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {               "label":`Email`,"name":`email`,"type":`email`,value:profile.email,"autocomplete":`email`,"maxlength":254,"hint":data.email ? (data.emailVerified ? "Verified." : "Not verified.") : undefined,}});/*Ωignore_startΩ*/() => profile.email = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {            "label":`Picture URL`,"name":`picture`,"type":`url`,value:profile.picture,"maxlength":2048,"placeholder":`https://…`,}});/*Ωignore_startΩ*/() => profile.picture = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { svelteHTML.createElement("div", {});
         { svelteHTML.createElement("button", {   "type":`submit`,"disabled":profileAction.busy,}); { const $$_evaS4C = __sveltets_2_ensureComponent(Save); new $$_evaS4C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}   }
       }
     }
    if(data.email && !data.emailVerified){
       { svelteHTML.createElement("div", { "class":`inline-edit`,});
         { svelteHTML.createElement("small", { "class":`muted`,});data.email;    }
         { svelteHTML.createElement("button", {       "type":`button`,"class":`small`,"onclick":resendVerification,"disabled":profileAction.busy,});
            
         }
       }
    }
   Section}

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Passkeys`,"description":`The quickest and safest way to sign in: your device unlocks with a fingerprint, face or PIN.`,}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":passkeyAction.message,"error":passkeyAction.error,}});}
    if(data.passkeys.length === 0){
       { svelteHTML.createElement("p", { "class":`muted`,});   }
    }else{
       { svelteHTML.createElement("ul", { "class":`rows`,});
           for(let p of __sveltets_2_ensureArray(data.passkeys)){p.id;
           { svelteHTML.createElement("li", {});
             { svelteHTML.createElement("div", { "class":`grow`,});
               { svelteHTML.createElement("form", {   "class":`inline-edit`,"onsubmit":(ev) => renamePasskey(ev, p.id),});
                  { svelteHTML.createElement("input", {        "type":`text`,"bind:value":renames[p.id],"maxlength":60,"aria-label":`Passkey name`,"required":true,});/*Ωignore_startΩ*/() => renames[p.id] = __sveltets_2_any(null);/*Ωignore_endΩ*/}
                 { svelteHTML.createElement("button", {     "type":`submit`,"class":`small`,"disabled":passkeyAction.busy,});  }
               }
               { svelteHTML.createElement("small", { "class":`muted`,});
                p.synced ? "Synced" : "This device only";   date(p.createdAt);    relative(p.lastUsedAt);
               }
             }
             { svelteHTML.createElement("button", {       "type":`button`,"class":`danger small`,"onclick":() => removePasskey(p.id, p.name),"disabled":passkeyAction.busy,});
              
             }
           }
        }
       }
    }
     { svelteHTML.createElement("form", {   "class":`inline-edit`,"onsubmit":addPasskey,});
       { svelteHTML.createElement("input", {          "type":`text`,"bind:value":newPasskeyName,"placeholder":`Name, e.g. Phone`,"maxlength":60,"aria-label":`New passkey name`,});/*Ωignore_startΩ*/() => newPasskeyName = __sveltets_2_any(null);/*Ωignore_endΩ*/}
       { svelteHTML.createElement("button", {     "type":`submit`,"class":`primary`,"disabled":!supported || passkeyAction.busy,});
         { const $$_dnuoRyeK3C = __sveltets_2_ensureComponent(KeyRound); new $$_dnuoRyeK3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}
        supported ? "Add a passkey" : "Passkeys aren't supported in this browser";
       }
     }
   Section}

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: { children:() => { return __sveltets_2_any(0); },"title":`Password`,}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":passwordAction.message,"error":passwordAction.error,}});}
     { svelteHTML.createElement("p", { "class":`muted`,});
      data.hasPassword
        ? "You can sign in with a password."
        : "No password set. Add one as a fallback for devices without your passkeys.";
     }
     { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":setPassword,});
        { svelteHTML.createElement("input", {        "type":`text`,"name":`username`,"value":data.username,"autocomplete":`username`,"hidden":true,});}
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {                "label":data.hasPassword ? "New password" : "Password","name":`password`,"type":`password`,value:passwords.password,"required":true,"autocomplete":`new-password`,"maxlength":512,"hint":`At least ${PASSWORD_MIN} characters. A long phrase beats a short tricky one.`,}});/*Ωignore_startΩ*/() => passwords.password = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {            "label":`Confirm password`,"name":`confirm`,"type":`password`,value:passwords.confirm,"required":true,"autocomplete":`new-password`,"maxlength":512,}});/*Ωignore_startΩ*/() => passwords.confirm = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
       { svelteHTML.createElement("div", {});
         { svelteHTML.createElement("button", {   "type":`submit`,"disabled":passwordAction.busy,});data.hasPassword ? "Change password" : "Set password"; }
       }
     }
    if(data.hasPassword){
       { svelteHTML.createElement("p", {});
         { svelteHTML.createElement("button", {       "type":`button`,"class":`danger small`,"onclick":removePassword,"disabled":data.passkeys.length === 0 || passwordAction.busy,});
           
         }
        if(data.passkeys.length === 0){ { svelteHTML.createElement("small", { "class":`muted`,});     }}
       }
    }
   Section}

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {     children:() => { return __sveltets_2_any(0); },"title":`Two-factor codes`,"description":`Asks for a code from an authenticator app after your password. Once you have a passkey or codes, a password alone can't sign in: it always needs one of them too. Passkey sign-ins need nothing else.`,}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":totpAction.message,"error":totpAction.error,}});}
    if(!data.hasPassword){
       { svelteHTML.createElement("p", { "class":`muted`,});    }
    } else if (data.totp){
       { svelteHTML.createElement("form", {   "class":`inline-edit`,"onsubmit":disableTotp,});
         { svelteHTML.createElement("span", { "class":`badge ok`,});  }
         { svelteHTML.createElement("input", {                "type":`text`,"bind:value":totpCode,"placeholder":`Current code`,"inputmode":`numeric`,"autocomplete":`one-time-code`,"maxlength":7,"required":true,"aria-label":`Current code`,});/*Ωignore_startΩ*/() => totpCode = __sveltets_2_any(null);/*Ωignore_endΩ*/}
         { svelteHTML.createElement("button", {     "type":`submit`,"class":`danger`,"disabled":totpAction.busy,});  }
       }
    }else{
       { svelteHTML.createElement("button", {   "type":`button`,"onclick":() => navigate("/settings/totp"),});     }
    }
   Section}

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Sessions`,"description":`Browsers signed in to this server. Apps you've signed in to keep their own sessions.`,}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {    "ok":sessionAction.message,"error":sessionAction.error,}});}
     { svelteHTML.createElement("ul", { "class":`rows`,});
         for(let s of __sveltets_2_ensureArray(data.sessions)){s.id;
         { svelteHTML.createElement("li", {});
           { svelteHTML.createElement("div", { "class":`grow`,});
             { svelteHTML.createElement("strong", {});s.device; }
            if(s.current){ { svelteHTML.createElement("span", { "class":`badge`,});  }}
             { svelteHTML.createElement("br", {});}
             { svelteHTML.createElement("small", { "class":`muted`,});
              s.ip ?? "unknown IP";   s.method;    date(s.createdAt);   relative(s.lastSeenAt);
             }
           }
           { svelteHTML.createElement("button", {       "type":`button`,"class":`small`,"onclick":() => revokeSession(s.id),"disabled":sessionAction.busy,});  }
         }
      }
     }
    if(data.sessions.length > 1){
       { svelteHTML.createElement("button", {       "type":`button`,"class":`danger small`,"onclick":revokeOthers,"disabled":sessionAction.busy,});    }
    }
   Section}

   { const $$_noitceS0C = __sveltets_2_ensureComponent(Section); new $$_noitceS0C({ target: __sveltets_2_any(), props: {     children:() => { return __sveltets_2_any(0); },"title":`Delete account`,"description":`Permanently deletes your account, passkeys, sessions and app sign-ins. Apps you've used may keep their own copy of your details; ask them separately. This can't be undone.`,}});
     { const $$_setoN1C = __sveltets_2_ensureComponent(Notes); new $$_setoN1C({ target: __sveltets_2_any(), props: {  "error":deleteAction.error,}});}
     { svelteHTML.createElement("form", {   "class":`stack`,"onsubmit":deleteAccount,});
       { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {          "label":`Type your username (${data.username}) to confirm`,"name":`confirm`,value:removal.confirm,"required":true,"autocomplete":`off`,"maxlength":64,}});/*Ωignore_startΩ*/() => removal.confirm = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
      if(data.hasPassword){
         { const $$_dleiF2C = __sveltets_2_ensureComponent(Field); const $$_dleiF2 = new $$_dleiF2C({ target: __sveltets_2_any(), props: {            "label":`Password`,"name":`password`,"type":`password`,value:removal.password,"required":true,"autocomplete":`current-password`,"maxlength":512,}});/*Ωignore_startΩ*/() => removal.password = __sveltets_2_any(null);/*Ωignore_endΩ*/$$_dleiF2.$$bindings = 'value';}
      }
       { svelteHTML.createElement("div", {});
         { svelteHTML.createElement("button", {     "type":`submit`,"class":`danger`,"disabled":deleteAction.busy,});   }
       }
     }
   Section}
}
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const Settings__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type Settings__SvelteComponent_ = ReturnType<typeof Settings__SvelteComponent_>;
/*Ωignore_endΩ*/export default Settings__SvelteComponent_;