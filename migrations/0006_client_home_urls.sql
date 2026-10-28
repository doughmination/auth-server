-- migrations/0006_client_home_urls.sql
-- Copyright (c) 2026 Clove Nytrix Doughmination Twilight
-- Licensed under the DASL-1.2 Licence.

-- Where an application lives, for the "Your apps" page. Apps without one
-- still sign people in; they just aren't listed there.
ALTER TABLE clients ADD COLUMN home_url TEXT;
