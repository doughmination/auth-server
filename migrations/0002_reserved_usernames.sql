CREATE TABLE reserved_usernames (
  username   TEXT PRIMARY KEY COLLATE NOCASE,   -- stored canonical (see A2)
  note       TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);