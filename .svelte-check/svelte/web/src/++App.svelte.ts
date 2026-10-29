///<reference types="svelte" />
;
import type { Component } from "svelte";
import ArrowLeft from "./lib/icons/ArrowLeft.svelte";
import LayoutGrid from "./lib/icons/LayoutGrid.svelte";
import LogOut from "./lib/icons/LogOut.svelte";
import SettingsIcon from "./lib/icons/Settings.svelte";
import Shield from "./lib/icons/Shield.svelte";
import { api, errorText } from "./lib/api";
import { here, navigate, reload, route } from "./lib/router.svelte";
import { session } from "./lib/session.svelte";
import Card from "./components/Card.svelte";

import Login from "./pages/Login.svelte";
import Mfa from "./pages/Mfa.svelte";
import LoginLink from "./pages/LoginLink.svelte";
import Register from "./pages/Register.svelte";
import Setup from "./pages/Setup.svelte";
import Forgot from "./pages/Forgot.svelte";
import Reset from "./pages/Reset.svelte";
import VerifyEmail from "./pages/VerifyEmail.svelte";
import Security from "./pages/Security.svelte";
import Apps from "./pages/Apps.svelte";
import Settings from "./pages/Settings.svelte";
import TotpSetup from "./pages/TotpSetup.svelte";
import Privacy from "./pages/Privacy.svelte";
import Terms from "./pages/Terms.svelte";
import AuthorizeNotice from "./pages/AuthorizeNotice.svelte";
import EndSession from "./pages/EndSession.svelte";
import ErrorPage from "./pages/ErrorPage.svelte";
import NotFound from "./pages/NotFound.svelte";
import Users from "./pages/admin/Users.svelte";
import UserDetail from "./pages/admin/UserDetail.svelte";
import Groups from "./pages/admin/Groups.svelte";
import Clients from "./pages/admin/Clients.svelte";
import ClientDetail from "./pages/admin/ClientDetail.svelte";
import Keys from "./pages/admin/Keys.svelte";
import Audit from "./pages/admin/Audit.svelte";
import Reserved from "./pages/admin/Reserved.svelte";
function $$render() {

  
  
  
  
  
  
  
  
  
  

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  type Page = Component<{ params: Record<string, string> }>;

  interface Route {
    pattern: string;
    page: Page;
    /** Centered card layout for sign-in screens. */
    narrow?: boolean;
    access?: "user" | "admin";
  }

  // These paths are also the links in our emails (verify-email, security,
  // reset, login/link), so they mustn't change.
  const ROUTES: Route[] = [
    { pattern: "/login", page: Login, narrow: true },
    { pattern: "/login/mfa", page: Mfa, narrow: true },
    { pattern: "/login/link/:token", page: LoginLink, narrow: true },
    { pattern: "/register", page: Register, narrow: true },
    { pattern: "/setup", page: Setup, narrow: true },
    { pattern: "/forgot", page: Forgot, narrow: true },
    { pattern: "/reset/:token", page: Reset, narrow: true },
    { pattern: "/verify-email/:token", page: VerifyEmail, narrow: true },
    { pattern: "/security/:token", page: Security, narrow: true },
    { pattern: "/apps", page: Apps, access: "user" },
    { pattern: "/settings", page: Settings, access: "user" },
    { pattern: "/settings/totp", page: TotpSetup, narrow: true, access: "user" },
    { pattern: "/admin/users", page: Users, access: "admin" },
    { pattern: "/admin/users/:id", page: UserDetail, access: "admin" },
    { pattern: "/admin/groups", page: Groups, access: "admin" },
    { pattern: "/admin/clients", page: Clients, access: "admin" },
    { pattern: "/admin/clients/:id", page: ClientDetail, access: "admin" },
    { pattern: "/admin/keys", page: Keys, access: "admin" },
    { pattern: "/admin/audit", page: Audit, access: "admin" },
    { pattern: "/admin/reserved", page: Reserved, access: "admin" },
    { pattern: "/privacy", page: Privacy },
    { pattern: "/terms", page: Terms },
    { pattern: "/authorize/notice", page: AuthorizeNotice, narrow: true },
    { pattern: "/end-session/confirm", page: EndSession, narrow: true },
    { pattern: "/error", page: ErrorPage, narrow: true },
  ];

  const REDIRECTS: Record<string, () => string> = {
    "/": () => (session.user ? "/apps" : "/login"),
    "/admin": () => "/admin/users",
    // The old name for /settings, still linked from emails sent before the rename.
    "/account": () => "/settings" + route.search,
  };

  function match(path: string): { route: Route; params: Record<string, string> } {
    const parts = path.replace(/\/+$/, "").split("/");
    for (const r of ROUTES) {
      const want = r.pattern.split("/");
      if (want.length !== parts.length) continue;
      const params: Record<string, string> = {};
      if (want.every((w, i) => (w.startsWith(":") ? (params[w.slice(1)] = decodeURIComponent(parts[i]!)) : w === parts[i]))) {
        return { route: r, params };
      }
    }
    return { route: { pattern: "*", page: NotFound, narrow: true }, params: {} };
  }

  $effect(() => {
    const to = REDIRECTS[route.path];
    if (to) navigate(to(), { replace: true });
  });

  const current = $derived(match(route.path));
  const needsSignIn = $derived(current.route.access !== undefined && !session.user);
  const forbidden = $derived(current.route.access === "admin" && session.user !== null && !session.user.isAdmin);

  $effect(() => {
    if (needsSignIn) reload(`/login?${new URLSearchParams({ return: here() })}`);
  });

  let signOutError = $state("");
  async function signOut() {
    try {
      const { redirect } = await api<{ redirect: string }>("/api/logout", {});
      reload(redirect);
    } catch (err) {
      signOutError = errorText(err);
    }
  }
;
async () => {

 { svelteHTML.createElement("header", { "class":`topbar`,});
   { svelteHTML.createElement("a", {   "class":`brand`,"href":session.user ? "/apps" : "/login",});session.site; }
  if(session.user){
     { svelteHTML.createElement("nav", {});
       { svelteHTML.createElement("a", {   "class":`btn small`,"href":`/apps`,}); { const $$_dirGtuoyaL3C = __sveltets_2_ensureComponent(LayoutGrid); new $$_dirGtuoyaL3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}  }
       { svelteHTML.createElement("a", {   "class":`btn small`,"href":`/settings`,}); { const $$_nocIsgnitteS3C = __sveltets_2_ensureComponent(SettingsIcon); new $$_nocIsgnitteS3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}  }
      if(session.user.isAdmin){
         { svelteHTML.createElement("a", {   "class":`btn small`,"href":`/admin/users`,}); { const $$_dleihS3C = __sveltets_2_ensureComponent(Shield); new $$_dleihS3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}  }
      }
       { svelteHTML.createElement("button", {     "type":`button`,"class":`small`,"onclick":signOut,});
         { const $$_tuOgoL3C = __sveltets_2_ensureComponent(LogOut); new $$_tuOgoL3C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}  
       }
     }
  }
 }

 { svelteHTML.createElement("main", { "class":current.route.narrow || forbidden ? "narrow" : "wide",});
  if(signOutError){ { svelteHTML.createElement("p", {   "class":`notice error`,"role":`alert`,});signOutError; }}
  if(needsSignIn || REDIRECTS[route.path]){
    
  } else if (forbidden){
     { const $$_draC1C = __sveltets_2_ensureComponent(Card); new $$_draC1C({ target: __sveltets_2_any(), props: {   children:() => { return __sveltets_2_any(0); },"title":`Admins only`,"lead":`Your account isn't in the admin group for this server.`,}});
       { svelteHTML.createElement("p", {});
         { svelteHTML.createElement("a", {   "class":`btn primary`,"href":`/apps`,}); { const $$_tfeLworrA4C = __sveltets_2_ensureComponent(ArrowLeft); new $$_tfeLworrA4C({ target: __sveltets_2_any(), props: {    "class":`icon`,"aria-hidden":`true`,}});}     }
       }
     Card}
  }else{
    route.path; {
      const Page = current.route.page;
       { const $$_egaP1C = __sveltets_2_ensureComponent(Page); new $$_egaP1C({ target: __sveltets_2_any(), props: {  "params":current.params,}});}
    }
  }
 }

 { svelteHTML.createElement("footer", { "class":`site-footer`,});
   { svelteHTML.createElement("a", { "href":`/privacy`,});  }
   { svelteHTML.createElement("a", { "href":`/terms`,});  }
 }
};
return { props: {} as Record<string, never>, exports: {}, bindings: __sveltets_$$bindings(''), slots: {}, events: {} }}
const App__SvelteComponent_ = __sveltets_2_fn_component($$render());
/*Ωignore_startΩ*/type App__SvelteComponent_ = ReturnType<typeof App__SvelteComponent_>;
/*Ωignore_endΩ*/export default App__SvelteComponent_;