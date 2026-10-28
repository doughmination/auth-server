/* vite.config.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * Builds the Svelte app in web/ into dist/, which the Worker serves.
 */

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  root: "web",
  plugins: [svelte()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    // The CSP allows no inline code, so every asset must be a real file.
    assetsInlineLimit: 0,
  },
});
