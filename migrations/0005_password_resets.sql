-- migrations/0005_password_resets.sql
-- Copyright (c) 2026 Clove Nytrix Doughmination Twilight
-- Licensed under the DASL-1.2 Licence.

-- "Forgot password" links. Only sent to verified addresses. `email` is the
-- address the link went to, so it stops working if the address changes.
CREATE TABLE password_resets (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX password_resets_user ON password_resets (user_id);
