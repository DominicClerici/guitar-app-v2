-- Assigns `server_seq` from the global sequence on every write to a synced table
-- (BACKEND_PLAN.md §7).
--
-- The column default already covers INSERT. This exists for UPDATE: without it an updated row
-- keeps the sequence value it was inserted with, so it sorts below every client's cursor and is
-- never pulled again. The guest-to-real-account reassignment in §5 is exactly that kind of write,
-- and it happens outside the sync code, which is why the guarantee lives in the database rather
-- than in a rule the sync layer has to remember.
--
-- Firing on INSERT as well means an insert consumes two sequence values. Gaps are harmless: the
-- cursor only ever asks for `server_seq > n`, never for a contiguous range.
--
-- Every table added to `syncedTables` needs a trigger here. The parity test in
-- src/schema.parity.test.ts fails if one is missing.

CREATE OR REPLACE FUNCTION set_server_seq() RETURNS trigger AS $$
BEGIN
	NEW.server_seq := nextval('server_seq');
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE OR REPLACE TRIGGER user_preferences_server_seq
	BEFORE INSERT OR UPDATE ON "user_preferences"
	FOR EACH ROW EXECUTE FUNCTION set_server_seq();
