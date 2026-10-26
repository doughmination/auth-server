/* src/routes/legal.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { Hono } from "hono";
import { siteName, type AppContext, type AppEnv } from "../env";
import { render } from "../views/layout";

/** Bump when either page changes in substance. */
const UPDATED = "26 October 2026";
const OPERATOR = "Clove Nytrix Doughmination Twilight";

export const legal = new Hono<AppEnv>();

function Contact(props: { c: AppContext }) {
  const email = props.c.env.CONTACT_EMAIL;
  return email ? <a href={`mailto:${email}`}>{email}</a> : <>the administrator of this server</>;
}

legal.get("/privacy", (c) => {
  const site = siteName(c.env);
  return render(
    c,
    { title: "Privacy policy" },
    <article class="legal">
      <p class="eyebrow">Last updated {UPDATED}</p>
      <h1>Privacy policy</h1>
      <p>
        {site} is a single sign-on service run by {OPERATOR}. It lets you sign in to other apps with one account. This
        page says what it stores about you, why, and for how long. Questions or requests: <Contact c={c} />.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>
          <strong>Your account:</strong> username, display name, email address (and whether you've verified it), and
          the picture URL you give us.
        </li>
        <li>
          <strong>How you sign in:</strong> your password as a one-way hash (we never store or see the password
          itself), your passkeys' public keys (your device keeps the private key), and your two-factor secret,
          encrypted.
        </li>
        <li>
          <strong>Sessions:</strong> for each signed-in browser, its IP address, browser and operating system (from
          the User-Agent header), how you signed in, and when.
        </li>
        <li>
          <strong>Known devices:</strong> a random ID for each browser you've signed in from, so we can tell you
          about sign-ins from new ones.
        </li>
        <li>
          <strong>Security log:</strong> sign-ins, failed sign-ins and account changes, with the IP address they
          came from.
        </li>
        <li>
          <strong>Groups:</strong> any groups an administrator puts you in, which decide which apps you can use.
        </li>
      </ul>
      <p>We don't use analytics, advertising or tracking of any kind, and we never sell your data.</p>

      <h2>Why</h2>
      <p>
        Only to run the service: signing you in, keeping your account secure, telling you about sign-ins and changes,
        and stopping abuse such as password guessing. The legal basis is that it's needed to provide the service you
        signed up for, and our legitimate interest in keeping accounts secure.
      </p>

      <h2>Cookies</h2>
      <p>Three cookies, all strictly necessary, none used for tracking:</p>
      <ul>
        <li>
          <code>sso_session</code>: keeps you signed in, for up to a day.
        </li>
        <li>
          <code>sso_pending</code>: remembers a half-finished sign-in while you enter a code or use a passkey, for up
          to 10 minutes.
        </li>
        <li>
          <code>sso_device</code>: a random ID for this browser, so a sign-in from a new device can be flagged. Kept
          for a year.
        </li>
      </ul>

      <h2>Who else sees it</h2>
      <ul>
        <li>
          <strong>Apps you sign in to</strong> receive what they ask for and you use: an ID for your account, and
          depending on the app, your username, display name, picture, email address and groups. Each app's own
          privacy policy covers what it does with them.
        </li>
        <li>
          <strong>Cloudflare</strong> hosts the service and its database, and sees the traffic, including your IP
          address.
        </li>
        <li>
          <strong>Resend</strong> delivers our emails, so it sees your email address and the messages we send you.
        </li>
        <li>
          <strong>Administrators</strong> of this server can see account details, sessions and the security log, to
          run it and help you.
        </li>
      </ul>
      <p>Those providers may process data outside your country, under their own safeguards.</p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Your account: until it's deleted.</li>
        <li>Sessions: one day. Apps can stay signed in for up to 30 days unless you sign out everywhere.</li>
        <li>Known devices: a year after a browser last signs in.</li>
        <li>Security log: 180 days.</li>
        <li>Email links (verification, sign-out): a day to a week, then they're deleted.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can see and change most of your details on your account page, sign out any session, and delete your
        account at any time from the bottom of that page. Deleting it immediately removes your account and everything
        linked to it; security log entries keep only an anonymous account ID and expire on their own within 180 days.
        You can also ask for a copy of your data, or for corrections, by contacting <Contact c={c} />. If you think we've mishandled your data, you can complain to your data protection authority (in
        the UK, the ICO).
      </p>

      <h2>Children</h2>
      <p>The service isn't meant for children under 13.</p>

      <h2>Changes</h2>
      <p>If this policy changes in a way that matters, we'll update the date above and tell you by email.</p>
    </article>,
  );
});

legal.get("/terms", (c) => {
  const site = siteName(c.env);
  return render(
    c,
    { title: "Terms of service" },
    <article class="legal">
      <p class="eyebrow">Last updated {UPDATED}</p>
      <h1>Terms of service</h1>
      <p>
        These terms apply to your use of {site}, a single sign-on service run by {OPERATOR}. By creating an account or
        signing in, you agree to them. How we handle your data is in the <a href="/privacy">privacy policy</a>.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Give an email address that's yours, and keep it up to date so security emails reach you.</li>
        <li>
          Keep your password, passkeys and two-factor device safe. You're responsible for what's done with your
          account. If you think someone else has access, sign them out from your account page (or the link in our
          email) and change your password straight away.
        </li>
        <li>One person per account. Don't share it, and don't sign in to accounts that aren't yours.</li>
        <li>You must be at least 13 to have an account.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>Don't:</p>
      <ul>
        <li>try to get into other people's accounts, or guess passwords or codes;</li>
        <li>probe, overload or attack the service, or get around its rate limits and security;</li>
        <li>pick a username, display name or picture that impersonates someone or is abusive;</li>
        <li>use the service for anything illegal.</li>
      </ul>

      <h2>Apps you sign in to</h2>
      <p>
        {site} only signs you in. The apps you use with it are run under their own terms, and we aren't responsible
        for them.
      </p>

      <h2>Suspension and closing accounts</h2>
      <p>
        We can disable or delete an account that breaks these terms or puts the service or other people at risk,
        usually after telling you. You can delete your own account at any time from your account page.
      </p>

      <h2>The service</h2>
      <p>
        {site} is a personal project, provided as it is and without guarantees. We work to keep it secure and
        available, but it may sometimes be down, change, or be shut down; if it's shutting down, we'll try to give
        you notice. As far as the law allows, we aren't liable for losses from using it or being unable to. Nothing
        here limits liability that can't be limited by law.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. If a change matters, we'll update the date above and tell you by email; using the
        service afterwards means you accept them.
      </p>

      <h2>Law</h2>
      <p>These terms are governed by the laws of England and Wales.</p>

      <h2>Contact</h2>
      <p>
        <Contact c={c} />
      </p>
    </article>,
  );
});
