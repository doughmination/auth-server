<script lang="ts">
  import { session } from "../lib/session.svelte";
  import Title from "../components/Title.svelte";
  import Contact from "./Contact.svelte";
  import { OPERATOR, UPDATED } from "../lib/legal";
</script>

<Title text="Privacy policy" />
<article class="legal">
  <p class="eyebrow">Last updated {UPDATED}</p>
  <h1>Privacy policy</h1>
  <p>
    {session.site} is a single sign-on service run by {OPERATOR}. It lets you sign in to other apps with one account.
    This page says what it stores about you, why, and for how long. Questions or requests: <Contact />.
  </p>

  <h2>What we store</h2>
  <ul>
    <li>
      <strong>Your account:</strong> username, display name, email address (and whether you've verified it), and the
      picture URL you give us.
    </li>
    <li>
      <strong>How you sign in:</strong> your password as a one-way hash (we never store or see the password itself),
      your passkeys' public keys (your device keeps the private key), and your two-factor secret, encrypted.
    </li>
    <li>
      <strong>Sessions:</strong> for each signed-in browser, its IP address, browser and operating system (from the
      User-Agent header), how you signed in, and when.
    </li>
    <li>
      <strong>Known devices:</strong> a random ID for each browser you've signed in from, so we can tell you about
      sign-ins from new ones.
    </li>
    <li>
      <strong>Security log:</strong> sign-ins, failed sign-ins and account changes, with the IP address they came from.
    </li>
    <li><strong>Groups:</strong> any groups an administrator puts you in, which decide which apps you can use.</li>
  </ul>
  <p>We don't use analytics, advertising or tracking of any kind, and we never sell your data.</p>

  <h2>Why</h2>
  <p>
    Only to run the service: signing you in, keeping your account secure, telling you about sign-ins and changes, and
    stopping abuse such as password guessing. The legal basis is that it's needed to provide the service you signed up
    for, and our legitimate interest in keeping accounts secure.
  </p>

  <h2>Cookies</h2>
  <p>Three cookies, all strictly necessary, none used for tracking:</p>
  <ul>
    <li><code>sso_session</code>: keeps you signed in, for up to a day.</li>
    <li>
      <code>sso_pending</code>: remembers a half-finished sign-in while you enter a code or use a passkey, for up to 10
      minutes.
    </li>
    <li>
      <code>sso_device</code>: a random ID for this browser, so a sign-in from a new device can be flagged. Kept for a
      year.
    </li>
  </ul>

  <h2>Who else sees it</h2>
  <ul>
    <li>
      <strong>Apps you sign in to</strong> receive what they ask for and you use: an ID for your account, and depending
      on the app, your username, display name, picture, email address and groups. Each app's own privacy policy covers
      what it does with them.
    </li>
    <li>
      <strong>Cloudflare</strong> hosts the service and its database, and sees the traffic, including your IP address.
    </li>
    <li>
      <strong>Resend</strong> delivers our emails, so it sees your email address and the messages we send you.
    </li>
    <li>
      <strong>Administrators</strong> of this server can see account details, sessions and the security log, to run it
      and help you.
    </li>
  </ul>
  <p>Those providers may process data outside your country, under their own safeguards.</p>

  <h2>How long we keep it</h2>
  <ul>
    <li>Your account: until it's deleted.</li>
    <li>Sessions: one day. Apps can stay signed in for up to 30 days unless you sign out everywhere.</li>
    <li>Known devices: a year after a browser last signs in.</li>
    <li>Security log: 180 days.</li>
    <li>Email links (password reset, verification, sign-out): an hour to a week, then they're deleted.</li>
  </ul>

  <h2>Your rights</h2>
  <p>
    You can see and change most of your details on your account page, sign out any session, and delete your account at
    any time from the bottom of that page. Deleting it immediately removes your account and everything linked to it;
    security log entries keep only an anonymous account ID and expire on their own within 180 days. You can also ask
    for a copy of your data, or for corrections, by contacting <Contact />. If you think we've mishandled your data,
    you can complain to your data protection authority (in the UK, the ICO).
  </p>

  <h2>Children</h2>
  <p>The service isn't meant for children under 13.</p>

  <h2>Changes</h2>
  <p>If this policy changes in a way that matters, we'll update the date above and tell you by email.</p>
</article>
