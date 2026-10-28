/* web/src/lib/format.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

export function date(ts: number | null | undefined): string {
  if (!ts) return "never";
  return new Date(ts * 1000).toISOString().slice(0, 16).replace("T", " ") + " UTC";
}

export function relative(ts: number | null | undefined): string {
  if (!ts) return "never";
  const diff = Math.floor(Date.now() / 1000) - ts;
  const abs = Math.abs(diff);
  const [n, word] =
    abs < 60 ? [abs, "second"] :
    abs < 3600 ? [Math.floor(abs / 60), "minute"] :
    abs < 86400 ? [Math.floor(abs / 3600), "hour"] :
    [Math.floor(abs / 86400), "day"];
  const text = `${n} ${word}${n === 1 ? "" : "s"}`;
  return diff < 0 ? `in ${text}` : `${text} ago`;
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
