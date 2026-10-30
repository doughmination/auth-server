-- migrations/0007_client_icon_urls.sql
-- Copyright (c) 2026 Clove Nytrix Doughmination Twilight
-- Licensed under the DASL-1.2 Licence.

-- An image shown for the app on the "Your apps" page. Apps without one get
-- the first letter of their name instead.
ALTER TABLE clients ADD COLUMN icon_url TEXT;
