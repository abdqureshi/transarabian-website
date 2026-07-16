-- Security hardening for authentication, public jobs, applications and storage.
-- This migration is additive and safe to apply after 003_full_ats.sql.

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

create or replace function public.protect_profile_security_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Profile identity cannot be changed';
  end if;

  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only an administrator can change account roles';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_security_fields on public.profiles;
create trigger protect_profile_security_fields
before update on public.profiles
for each row execute function public.protect_profile_security_fields();

drop policy if exists "profiles read own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "admins manage profiles" on public.profiles;

create policy "profiles read own or staff"
on public.profiles for select
using (id = auth.uid() or public.is_staff());

create policy "profiles update own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid() and role = public.current_user_role());

create policy "admins update profiles"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "jobs public read" on public.jobs;
create policy "published jobs public read"
on public.jobs for select
using (
  status in ('Open', 'Closing Soon', 'Interview Scheduled', 'Closed', 'Filled')
  or public.is_staff()
);

drop policy if exists "candidates create own applications" on public.applications;
create policy "candidates create own applications"
on public.applications for insert
with check (
  candidate_id = auth.uid()
  and status = 'Submitted'
  and (
    candidate_record_id is null
    or exists (
      select 1 from public.candidates c
      where c.id = candidate_record_id and c.user_id = auth.uid()
    )
  )
);

drop policy if exists "documents insert own" on public.application_documents;
create policy "documents insert own application"
on public.application_documents for insert
with check (
  candidate_id = auth.uid()
  and exists (
    select 1 from public.applications a
    where a.id = application_id and a.candidate_id = auth.uid()
  )
);

drop policy if exists "candidate updates own documents" on storage.objects;
drop policy if exists "candidate deletes own documents" on storage.objects;
create policy "candidate updates own documents"
on storage.objects for update to authenticated
using (
  bucket_id = 'candidate-documents'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.can_write_recruitment())
)
with check (
  bucket_id = 'candidate-documents'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.can_write_recruitment())
);

create policy "candidate deletes own documents"
on storage.objects for delete to authenticated
using (
  bucket_id = 'candidate-documents'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.can_write_recruitment())
);

drop policy if exists "staff deletes job posters" on storage.objects;
create policy "staff deletes job posters"
on storage.objects for delete to authenticated
using (bucket_id = 'job-posters' and public.can_write_recruitment());

-- Security-definer functions must never retain PostgreSQL's default PUBLIC grant.
revoke all on function public.next_application_reference() from public;
revoke all on function public.find_candidate_duplicates(text,text,text,text,text,text,date) from public;
revoke all on function public.track_application(text,text) from public;
grant execute on function public.next_application_reference() to authenticated;
grant execute on function public.find_candidate_duplicates(text,text,text,text,text,text,date) to authenticated;
grant execute on function public.track_application(text,text) to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['jobs','applications','job_campaigns','candidates','interviews']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name
    );
  end loop;
end
$$;
