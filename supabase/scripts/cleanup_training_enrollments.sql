-- Clear stuck / test training enrollments (run in Supabase SQL Editor)
-- Safe for development testing. Review rows before deleting in production.

-- See all enrollments:
select id, user_id, session_id, trainee_name, trainee_email, status, enrolled_at
from training_enrollments
order by enrolled_at desc;

-- Remove cancelled rows only:
-- delete from training_enrollments where status = 'cancelled';

-- Remove ALL enrollments (full reset for testing):
-- delete from training_enrollments;
