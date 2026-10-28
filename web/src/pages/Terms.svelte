<script lang="ts">
  import { session } from "../lib/session.svelte";
  import Title from "../components/Title.svelte";
  import Contact from "./Contact.svelte";
  import { OPERATOR, UPDATED } from "../lib/legal";
</script>

<Title text="Terms of service" />
<article class="legal">
  <p class="eyebrow">Last updated {UPDATED}</p>
  <h1>Terms of service</h1>
  <p>
    These terms apply to your use of {session.site}, a single sign-on service run by {OPERATOR}. By creating an account
    or signing in, you agree to them. How we handle your data is in the <a href="/privacy">privacy policy</a>.
  </p>

  <h2>Your account</h2>
  <ul>
    <li>Give an email address that's yours, and keep it up to date so security emails reach you.</li>
    <li>
      Keep your password, passkeys and two-factor device safe. You're responsible for what's done with your account. If
      you think someone else has access, sign them out from your account page (or the link in our email) and change
      your password straight away.
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
    {session.site} only signs you in. The apps you use with it are run under their own terms, and we aren't responsible
    for them.
  </p>

  <h2>Suspension and closing accounts</h2>
  <p>
    We can disable or delete an account that breaks these terms or puts the service or other people at risk, usually
    after telling you. You can delete your own account at any time from your account page.
  </p>

  <h2>The service</h2>
  <p>
    {session.site} is a personal project, provided as it is and without guarantees. We work to keep it secure and
    available, but it may sometimes be down, change, or be shut down; if it's shutting down, we'll try to give you
    notice. As far as the law allows, we aren't liable for losses from using it or being unable to. Nothing here limits
    liability that can't be limited by law.
  </p>

  <h2>Changes</h2>
  <p>
    We may update these terms. If a change matters, we'll update the date above and tell you by email; using the service
    afterwards means you accept them.
  </p>

  <h2>Law</h2>
  <p>These terms are governed by the laws of England and Wales.</p>

  <h2>Contact</h2>
  <p><Contact /></p>
</article>
