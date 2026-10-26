-- migrations/0004_security_notices.sql
-- Copyright (c) 2026 Clove Nytrix Doughmination Twilight
-- Licensed under the DASL-1.2 Licence.

-- Browsers an account has signed in from, keyed by a long-lived device cookie
-- (stored hashed). Signing in from one that isn't listed emails the owner.
CREATE TABLE known_devices (
  user_id       TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  device_hash   TEXT NOT NULL,
  first_seen_at INTEGER NOT NULL,
  last_seen_at  INTEGER NOT NULL,
  PRIMARY KEY (user_id, device_hash)
);

CREATE INDEX known_devices_seen ON known_devices (last_seen_at);

-- Which device a session belongs to, so signing it out can forget the device.
ALTER TABLE sessions ADD COLUMN device_hash TEXT;

-- Links in security emails that sign a session (or everything) out without
-- needing to sign in. `session_hash` NULL = the email had no session to name.
CREATE TABLE signout_links (
  token_hash   TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  session_hash TEXT,
  created_at   INTEGER NOT NULL,
  expires_at   INTEGER NOT NULL
);

CREATE INDEX signout_links_user ON signout_links (user_id);
