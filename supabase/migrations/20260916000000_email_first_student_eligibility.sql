-- Email is the required student eligibility identifier. Roll number remains
-- supported when an institution has it, but must not block email-only access.
alter table public.institution_students
  alter column university_roll_no drop not null;

-- Older schema variants may also have the normalized alias.
alter table public.institution_students
  alter column roll_number drop not null;

comment on column public.institution_students.email is
  'Required eligibility identifier for student activation.';
comment on column public.institution_students.university_roll_no is
  'Optional institutional roll/registration number.';
