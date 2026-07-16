-- Slice 0 baseline: prove Flyway runs and the geo stack is present.
-- PostGIS is the core geo dependency (ADR 0007) — later slices add the Slot geo column
-- and ST_DWithin search on top of the extension enabled here.
CREATE EXTENSION IF NOT EXISTS postgis;
