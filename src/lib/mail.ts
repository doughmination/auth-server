/* src/lib/mail.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { isSecure, type Env } from "../env";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Sends through Resend's HTTP API (Workers can't use SMTP libraries). Without an
 * API key on a local http issuer, the mail is printed instead so links can be
 * clicked from the terminal.
 */
export async function sendMail(env: Env, mail: Mail): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    if (isSecure(env)) {
      console.error("[mail] RESEND_API_KEY isn't set");
      return false;
    }
    console.log(`[mail] to ${mail.to}: ${mail.subject}\n${mail.text}`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      }),
    });
    if (!res.ok) {
      console.error("[mail] resend refused", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mail] resend unreachable", err);
    return false;
  }
}
