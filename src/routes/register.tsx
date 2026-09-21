/* src/routes/register.tsx
   * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
   * Licensed under the DASL-1.2 Licence.
   * See LICENCE.md in the project root for full licence information.
   */

import { Hono } from "hono";
import { Login, UserPlus } from "pixelarticons/react";
import type { AppContext, AppEnv } from "../env";
import { audit } from "../lib/audit";
import { clientIp, form, safeReturn } from "../lib/http";
import { PASSWORD_MAX, PASSWORD_MIN, hashPassword, passwordProblem } from "../lib/password";
import { attempt } from "../lib/ratelimit";
import { cleanText, normaliseUsername, usernameProblem } from "../lib/validate";
import { isReserved } from "../data/reserved";
import { startSession } from "../data/sessions";
import { countUsers, createUser } from "../data/users";
import { render } from "../views/layout";
import { ErrorNote, Field } from "../views/ui";

// Reserved and taken names get the same answer, so the form can't be used to
// find out which names are reserved.
const UNAVAILABLE = "That username isn't available.";

export const register = new Hono<AppEnv>();

function isOpen(c: AppContext): boolean {
    return c.env.REGISTRATION === "open";
}

function closed(c: AppContext) {
    return render(
        c,
        { title: "Sign up", narrow: true, status: 404 },
        <div class="card">
            <h1>Sign-ups are closed</h1>
            <p class="muted">Accounts on this server are created by an admin.</p>
            <p>
                <a class="btn primary" href="/login">
                    <Login class="icon" aria-hidden="true" />
                    Sign in
                </a>
            </p>
        </div>,
    );
}

interface RegisterValues {
    returnTo: string;
    username?: string;
    name?: string;
}

function registerPage(c: AppContext, values: RegisterValues, error?: string) {
    return render(
        c,
        { title: "Create an account", narrow: true, status: error ? 400 : 200 },
        <div class="card">
            <h1>Create an account</h1>
            <p class="muted">You can add a passkey straight after.</p>
            <ErrorNote error={error} />
            <form method="post" action="/register" class="stack">
                <input type="hidden" name="return" value={values.returnTo} />
                <Field
                    label="Username"
                    name="username"
                    value={values.username}
                    required
                    autocomplete="username"
                    maxlength={32}
                    autofocus
                    hint="Lowercase letters, digits, dots, dashes or underscores. You can't change it later."
                />
                <Field label="Display name" name="name" value={values.name} autocomplete="name" maxlength={100} />
                <Field
                    label="Password"
                    name="password"
                    type="password"
                    required
                    autocomplete="new-password"
                    maxlength={PASSWORD_MAX}
                    hint={`At least ${PASSWORD_MIN} characters.`}
                />
                <Field label="Confirm password" name="confirm" type="password" required autocomplete="new-password"
                    maxlength={PASSWORD_MAX} />
                <button type="submit" class="primary wide">
                    <UserPlus class="icon" aria-hidden="true" />
                    Create account
                </button>
            </form>
            <p class="muted small">
                Already have an account? <a href={`/login?return=${encodeURIComponent(values.returnTo)}`}>Sign in</a>
            </p>
        </div>,
    );
}

register.get("/register", async (c) => {
    if (!isOpen(c)) return closed(c);
    const returnTo = safeReturn(c.req.query("return"));
    if (c.get("user")) return c.redirect(returnTo);
    if ((await countUsers(c.env)) === 0) return c.redirect("/setup");
    return registerPage(c, { returnTo });
});

register.post("/register", async (c) => {
    if (!isOpen(c)) return closed(c);
    if (c.get("user")) return c.redirect("/account");

    if (!(await attempt(c.env, `register-ip:${clientIp(c)}`, 10, 60 * 60))) {
        await audit(c, "register.rate_limited", { actor: null });
        return c.text("Too many sign-ups from here. Try again later.", 429);
    }

    const body = await form(c);
    const returnTo = safeReturn(body.return);
    const username = normaliseUsername(body.username);
    const password = (body.password ?? "").slice(0, PASSWORD_MAX);
    // Never echo the password back into the form.
    const values = { returnTo, username, name: body.name ?? "" };

    const problem =
        usernameProblem(username) ??
        ((await isReserved(c.env, username)) ? UNAVAILABLE : null) ??
        passwordProblem(password, username) ??
        (password !== body.confirm ? "The passwords don't match." : null);
    if (problem) return registerPage(c, values, problem);

    const result = await createUser(c.env, {
        username,
        name: cleanText(body.name, 100),
        email: null,
        emailVerified: false,
        passwordHash: await hashPassword(password),
    });
    if (!result.ok) return registerPage(c, values, UNAVAILABLE);

    await startSession(c, result.id, ["pwd"]);
    await audit(c, "register", { actor: result.id, target: username });
    return c.redirect(returnTo === "/account" ? "/account?m=welcome" : returnTo);
});