/* web/src/lib/router.svelte.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * A small History API router. Same-origin links are handled in the page,
 * except the ones the Worker answers itself (OIDC endpoints), which always
 * get a real navigation.
 */

/** Paths the Worker handles; links to them must leave the app. */
const SERVER_PATHS = [/^\/authorize$/, /^\/end-session$/, /^\/\.well-known\//, /^\/api\//, /^\/token$/, /^\/userinfo$/];

function current() {
  return { path: location.pathname, search: location.search };
}

export const route = $state(current());

/** The current query string, parsed. */
export function query(): URLSearchParams {
  return new URLSearchParams(route.search);
}

/** Where we are, for `?return=` parameters. */
export function here(): string {
  return route.path + route.search;
}

export function isServerPath(path: string): boolean {
  return SERVER_PATHS.some((re) => re.test(path));
}

/** Moves within the app; anything the Worker owns gets a real navigation. */
export function navigate(url: string, opts: { replace?: boolean } = {}): void {
  const target = new URL(url, location.href);
  if (target.origin !== location.origin || isServerPath(target.pathname)) {
    location.assign(target.href);
    return;
  }
  const next = target.pathname + target.search;
  if (opts.replace) history.replaceState(null, "", next);
  else history.pushState(null, "", next);
  Object.assign(route, current());
  window.scrollTo(0, 0);
}

/**
 * A full page load. Used after signing in or out (or anything else that
 * changes the session), so the whole app starts again from the new state.
 */
export function reload(url: string): void {
  location.assign(url);
}

addEventListener("popstate", () => Object.assign(route, current()));

document.addEventListener("click", (ev) => {
  if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
  const a = (ev.target as Element | null)?.closest?.("a");
  if (!a || !a.href || a.target || a.hasAttribute("download") || a.dataset.reload !== undefined) return;
  const url = new URL(a.href);
  if (url.origin !== location.origin || isServerPath(url.pathname)) return;
  ev.preventDefault();
  navigate(url.pathname + url.search);
});
