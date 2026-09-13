# Supabase deployment

This application now uses Supabase as the durable store for student and institution workflows. Apply every migration in `supabase/migrations` to the same Supabase project referenced by `.env.local`, in filename order.

The latest required migrations are:

`20260913000000_persist_remaining_workflows.sql`

`20260914000000_super_admin_and_safety_governance.sql`

`20260915000000_institution_request_provisioning.sql`

`20260916000000_email_first_student_eligibility.sql`

It adds durable support requests, message feedback, deletion requests, and the remaining institution-request fields used by the application.

The second migration adds `profiles.is_super_admin`, promotes `yugrathee28@gmail.com` when that Auth account exists, and adds the database function used to manage platform-only teammates. It does not create an institution or student membership for that account.

If the Supabase SQL editor reports a syntax error at `for`, paste the complete trigger statement below. `FOR EACH ROW` cannot be run by itself, and copied HTML entities such as `&#x20;` must be replaced with ordinary spaces:

```sql
drop trigger if exists data_deletion_requests_updated_at on public.data_deletion_requests;
create trigger data_deletion_requests_updated_at
  before update on public.data_deletion_requests
  for each row execute function public.set_updated_at();
```

After applying it, verify these workflows in a browser and restart the app between each check:

1. Submit an institution access request.
2. Create an institution, then add and remove a roster student.
3. Add a campus support contact and resource.
4. Register an approved student and complete onboarding.
5. Submit a check-in, exercise completion, support request, feedback, and deletion request.

All of those records should remain after the restart. Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser; it is used only by server actions.

The institution-request approval flow requires the latest migration: it adds `institution_requests.institution_id` and `institutions.website`. Apply migrations in filename order before approving a request from the Super Admin queue.

Student registration is now an idempotent linking flow: it creates (or reconciles) the Auth user, profile, active `STUDENT` membership, `student_profiles` row, and roster link. A repeat registration never overwrites the existing password; it returns an account-exists message with a sign-in link. If a previous attempt created only the Auth/profile rows, submitting the same eligible details once more repairs the missing links without changing the password.

Student eligibility is email-first. Institution admins must provide each student's email; roll number, phone, name, and graduation year are optional supporting details. A student can register with an approved email even when no roll number was uploaded.
