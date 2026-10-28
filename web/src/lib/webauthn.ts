/* web/src/lib/webauthn.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.2 Licence.
 * See LICENCE.md in the project root for full licence information.
 *
 * Passkey ceremonies. The server speaks the WebAuthn JSON format
 * (@simplewebauthn/server); browsers without the JSON helpers get it
 * converted by hand.
 */

import { api } from "./api";

type Json = Record<string, any>;

export function passkeysSupported(): boolean {
  return typeof window.PublicKeyCredential === "function";
}

function toBuffer(b64url: string): ArrayBuffer {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

function toB64url(buffer: ArrayBuffer | null | undefined): string | undefined {
  if (!buffer) return undefined;
  let bin = "";
  for (const b of new Uint8Array(buffer)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function creationOptions(json: Json): PublicKeyCredentialCreationOptions {
  const PKC = PublicKeyCredential as any;
  if (PKC.parseCreationOptionsFromJSON) return PKC.parseCreationOptionsFromJSON(json);
  return {
    ...json,
    challenge: toBuffer(json.challenge),
    user: { ...json.user, id: toBuffer(json.user.id) },
    excludeCredentials: (json.excludeCredentials || []).map((c: Json) => ({ ...c, id: toBuffer(c.id) })),
  } as PublicKeyCredentialCreationOptions;
}

function requestOptions(json: Json): PublicKeyCredentialRequestOptions {
  const PKC = PublicKeyCredential as any;
  if (PKC.parseRequestOptionsFromJSON) return PKC.parseRequestOptionsFromJSON(json);
  return {
    ...json,
    challenge: toBuffer(json.challenge),
    allowCredentials: (json.allowCredentials || []).map((c: Json) => ({ ...c, id: toBuffer(c.id) })),
  } as PublicKeyCredentialRequestOptions;
}

function credentialJSON(cred: PublicKeyCredential): Json {
  try {
    if (typeof (cred as any).toJSON === "function") return (cred as any).toJSON();
  } catch {
    // Some password managers return objects whose toJSON throws; build it by hand.
  }
  const r = cred.response as any;
  const response: Json = { clientDataJSON: toB64url(r.clientDataJSON) };
  if (r.attestationObject) {
    response.attestationObject = toB64url(r.attestationObject);
    response.transports = typeof r.getTransports === "function" ? r.getTransports() : [];
  } else {
    response.authenticatorData = toB64url(r.authenticatorData);
    response.signature = toB64url(r.signature);
    response.userHandle = toB64url(r.userHandle);
  }
  return {
    id: cred.id,
    rawId: toB64url(cred.rawId),
    type: cred.type,
    authenticatorAttachment: cred.authenticatorAttachment || undefined,
    clientExtensionResults: cred.getClientExtensionResults(),
    response,
  };
}

/** A friendly message, or "" when the person simply cancelled. */
export function passkeyMessage(err: unknown): string {
  const e = err as { name?: string; message?: string } | null;
  if (!e) return "Something went wrong. Please try again.";
  if (e.name === "NotAllowedError" || e.name === "AbortError") return "";
  if (e.name === "InvalidStateError") return "That passkey is already registered to your account.";
  if (e.name === "SecurityError") return "Passkeys can't be used on this address.";
  return e.message || "Something went wrong. Please try again.";
}

/**
 * Signs in with a passkey: options from `base/options`, the result to
 * `base/verify`. Returns where to go next, or null if the browser gave nothing.
 */
export async function getPasskey(
  base: string,
  extra: Json = {},
  opts: { conditional?: AbortSignal } = {},
): Promise<string | null> {
  const { id, options } = await api<{ id: string; options: Json }>(`${base}/options`, {});
  const request: CredentialRequestOptions = { publicKey: requestOptions(options) };
  if (opts.conditional) {
    (request as any).mediation = "conditional";
    request.signal = opts.conditional;
  }
  const cred = (await navigator.credentials.get(request)) as PublicKeyCredential | null;
  if (!cred) return null;
  const result = await api<{ redirect: string }>(`${base}/verify`, { id, response: credentialJSON(cred), ...extra });
  return result.redirect;
}

/** Adds a passkey to the signed-in account. Returns false if the browser gave nothing. */
export async function createPasskey(name: string): Promise<boolean> {
  const { id, options } = await api<{ id: string; options: Json }>("/api/account/passkeys/options", {});
  const cred = (await navigator.credentials.create({ publicKey: creationOptions(options) })) as PublicKeyCredential | null;
  if (!cred) return false;
  await api("/api/account/passkeys/verify", { id, response: credentialJSON(cred), name });
  return true;
}

export async function conditionalAvailable(): Promise<boolean> {
  const PKC = window.PublicKeyCredential as any;
  return Boolean(PKC?.isConditionalMediationAvailable && (await PKC.isConditionalMediationAvailable()));
}
