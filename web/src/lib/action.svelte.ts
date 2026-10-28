/* web/src/lib/action.svelte.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { errorText } from "./api";
import { MESSAGES } from "./messages";

/**
 * The state behind a form or button: busy while it runs, then either a
 * success note (from a message code) or the error to show.
 */
export class Action {
  busy = $state(false);
  error = $state("");
  message = $state("");

  /** Runs `fn`; if it returns a message code (or `{ message }`), that's shown as the success note. */
  run = async (fn: () => Promise<unknown>): Promise<boolean> => {
    this.busy = true;
    this.error = "";
    this.message = "";
    try {
      const result = await fn();
      const code = typeof result === "string" ? result : (result as { message?: unknown } | undefined)?.message;
      if (typeof code === "string") this.message = MESSAGES[code] ?? "";
      return true;
    } catch (err) {
      this.error = errorText(err);
      return false;
    } finally {
      this.busy = false;
    }
  };
}

/** Focuses an element when it appears (instead of `autofocus`, which only works on first load). */
export function focus(node: HTMLElement, enabled: boolean | undefined = true) {
  if (enabled) queueMicrotask(() => node.focus());
}
