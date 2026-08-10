-- `server_seq` triggers for the learning system's tables (BACKEND_PLAN.md §7).
--
-- Same reasoning as 0001: the column default covers INSERT, and this covers UPDATE, without which
-- a merged row keeps its original sequence value and is never pulled by another device again.
--
-- It matters more here than it did for preferences. `section_progress` merges monotonically, so a
-- row is *updated* every time a second device reports a better score or an earlier completion —
-- the case where a missing trigger silently strands the merged result on the server.
--
-- `set_server_seq()` itself is already defined by 0001 and is shared by every synced table.

CREATE OR REPLACE TRIGGER pathway_enrollments_server_seq
	BEFORE INSERT OR UPDATE ON "pathway_enrollments"
	FOR EACH ROW EXECUTE FUNCTION set_server_seq();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER section_progress_server_seq
	BEFORE INSERT OR UPDATE ON "section_progress"
	FOR EACH ROW EXECUTE FUNCTION set_server_seq();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER quiz_attempts_server_seq
	BEFORE INSERT OR UPDATE ON "quiz_attempts"
	FOR EACH ROW EXECUTE FUNCTION set_server_seq();
