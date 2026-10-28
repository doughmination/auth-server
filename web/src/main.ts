/* web/src/main.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import { loadSession } from "./lib/session.svelte";

const target = document.getElementById("app")!;

loadSession()
  .then(() => mount(App, { target }))
  .catch(() => {
    target.innerHTML =
      '<main class="narrow"><div class="card"><h1>Can\'t reach the server</h1><p class="muted">Check your connection, then reload the page.</p></div></main>';
  });
