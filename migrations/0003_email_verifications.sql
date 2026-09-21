-- migrations/0003_email_verifications.sql
-- Copyright (c) 2026 Clove Nytrix Doughmination Twilight
-- Licensed under the DASL-1.2 Licence.

-- Links sent to prove an email address. `email` is the address the link was
-- sent to, so a link for an old address can't verify a new one.
CREATE TABLE email_verifications (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX email_verifications_user ON email_verifications (user_id);
