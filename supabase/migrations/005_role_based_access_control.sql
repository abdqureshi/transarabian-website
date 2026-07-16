-- Role-based access control and assignment-aware RLS.
-- Apply after 004_security_hardening.sql.

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path=public
as $$select coalesce(public.current_user_role() = 'super_admin', false)$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$select coalesce(public.current_user_role() in ('admin','super_admin'), false)$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path=public
as $$select coalesce(public.current_user_role() in ('viewer','recruiter','admin','super_admin'), false)$$;

create or replace function public.can_write_recruitment()
returns boolean language sql stable security definer set search_path=public
as $$select public.is_admin()$$;

create or replace function public.can_view_application(p_application_id uuid)
returns boolean language sql stable security definer set search_path=public
as $$
  select exists(
    select 1 from public.applications a
    where a.id = p_application_id and (
      a.candidate_id = auth.uid()
      or public.current_user_role() in ('viewer','admin','super_admin')
      or (public.current_user_role() = 'recruiter' and a.recruiter_id = auth.uid())
    )
  )
$$;

create or replace function public.can_manage_application(p_application_id uuid)
returns boolean language sql stable security definer set search_path=public
as $$
  select public.is_admin() or exists(
    select 1 from public.applications a
    where a.id = p_application_id
      and public.current_user_role() = 'recruiter'
      and a.recruiter_id = auth.uid()
  )
$$;

create or replace function public.can_view_candidate(p_candidate_id uuid)
returns boolean language sql stable security definer set search_path=public
as $$
  select exists(
    select 1 from public.candidates c
    where c.id = p_candidate_id and (
      c.user_id = auth.uid()
      or public.current_user_role() in ('viewer','admin','super_admin')
      or (public.current_user_role() = 'recruiter' and exists(
        select 1 from public.applications a
        where a.candidate_record_id = c.id and a.recruiter_id = auth.uid()
      ))
    )
  )
$$;

revoke all on function public.is_super_admin() from public;
revoke all on function public.can_view_application(uuid) from public;
revoke all on function public.can_manage_application(uuid) from public;
revoke all on function public.can_view_candidate(uuid) from public;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.can_view_application(uuid) to authenticated;
grant execute on function public.can_manage_application(uuid) to authenticated;
grant execute on function public.can_view_candidate(uuid) to authenticated;

create or replace function public.protect_profile_security_fields()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  if new.id is distinct from old.id then raise exception 'Profile identity cannot be changed'; end if;
  if new.role is distinct from old.role and not public.is_super_admin() then
    raise exception 'Only a super administrator can change account roles';
  end if;
  return new;
end;
$$;

create or replace function public.protect_candidate_security_fields()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  if public.current_user_role() = 'candidate' and (
    new.id is distinct from old.id
    or new.user_id is distinct from old.user_id
    or new.profile_status is distinct from old.profile_status
    or new.duplicate_flags is distinct from old.duplicate_flags
    or new.retention_until is distinct from old.retention_until
  ) then raise exception 'Candidate cannot change protected profile fields'; end if;
  return new;
end;
$$;

drop trigger if exists protect_candidate_security_fields on public.candidates;
create trigger protect_candidate_security_fields before update on public.candidates
for each row execute function public.protect_candidate_security_fields();

create or replace function public.enforce_application_update_permissions()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  if public.current_user_role() = 'recruiter' then
    if old.recruiter_id is distinct from auth.uid() or new.recruiter_id is distinct from old.recruiter_id then
      raise exception 'Recruiter is not assigned to this application';
    end if;
    if (to_jsonb(new) - array['status','updated_at']) is distinct from (to_jsonb(old) - array['status','updated_at']) then
      raise exception 'Recruiters may only update an allowed application status';
    end if;
    if new.status not in ('Under Review','Shortlisted','Interview Scheduled','Interviewed','Selected','Rejected','Documents Pending','On Hold') then
      raise exception 'Application status is not available to recruiters';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_application_update_permissions on public.applications;
create trigger enforce_application_update_permissions before update on public.applications
for each row execute function public.enforce_application_update_permissions();

-- Profiles: own profile; staff directory for viewer/admin; super admin controls roles.
drop policy if exists "profiles read own or staff" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "admins update profiles" on public.profiles;
create policy "profiles read permitted" on public.profiles for select using(
  id=auth.uid() or public.current_user_role() in ('viewer','admin','super_admin')
  or (public.current_user_role()='recruiter' and role in ('recruiter','admin','super_admin'))
);
create policy "profiles update own permitted fields" on public.profiles for update
using(id=auth.uid()) with check(id=auth.uid() and role=public.current_user_role());
create policy "super admin manages profiles" on public.profiles for all
using(public.is_super_admin()) with check(public.is_super_admin());

-- Jobs and campaigns: all staff may read; only admin/super admin may mutate.
drop policy if exists "writers manage jobs" on public.jobs;
drop policy if exists "published jobs public read" on public.jobs;
create policy "published jobs public read" on public.jobs for select using(
  status in ('Open','Closing Soon','Interview Scheduled','Closed','Filled') or public.is_staff()
);
create policy "admins manage jobs" on public.jobs for all
using(public.is_admin()) with check(public.is_admin());
drop policy if exists "staff manage campaigns" on public.job_campaigns;
drop policy if exists "staff read campaigns" on public.job_campaigns;
create policy "staff read campaigns" on public.job_campaigns for select using(public.is_staff());
create policy "admins manage campaigns" on public.job_campaigns for all using(public.is_admin()) with check(public.is_admin());

-- Candidates: candidate owns profile; recruiter sees assigned records; viewer is read-only; admins manage.
drop policy if exists "staff read candidates" on public.candidates;
drop policy if exists "writers manage candidates" on public.candidates;
drop policy if exists "candidate update own profile" on public.candidates;
create policy "candidate and staff read permitted candidates" on public.candidates for select
using(public.can_view_candidate(id));
create policy "candidate updates own permitted profile" on public.candidates for update
using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "admins manage candidates" on public.candidates for all
using(public.is_admin()) with check(public.is_admin());

-- Applications: assignment-aware recruiter access and read-only viewer access.
drop policy if exists "candidates read own applications" on public.applications;
drop policy if exists "writers update applications" on public.applications;
create policy "applications read permitted" on public.applications for select
using(public.can_view_application(id));
create policy "admins manage applications" on public.applications for all
using(public.is_admin()) with check(public.is_admin());
create policy "assigned recruiters update applications" on public.applications for update
using(public.current_user_role()='recruiter' and recruiter_id=auth.uid())
with check(public.current_user_role()='recruiter' and recruiter_id=auth.uid());

-- Candidate document metadata follows application assignment.
drop policy if exists "documents read own or staff" on public.application_documents;
create policy "documents read permitted" on public.application_documents for select
using(candidate_id=auth.uid() or public.can_view_application(application_id));
create policy "admins delete document metadata" on public.application_documents for delete
using(public.is_admin());

-- Notes are visible/writeable only for assigned recruiters and admins; viewers may read.
drop policy if exists "staff notes" on public.candidate_notes;
create policy "notes read permitted" on public.candidate_notes for select
using(public.can_view_application(application_id));
create policy "assigned staff add notes" on public.candidate_notes for insert
with check(public.can_manage_application(application_id) and created_by=auth.uid());
create policy "note owners or admins update notes" on public.candidate_notes for update
using(created_by=auth.uid() or public.is_admin()) with check(created_by=auth.uid() or public.is_admin());
create policy "note owners or admins delete notes" on public.candidate_notes for delete
using(created_by=auth.uid() or public.is_admin());

-- Interviews follow application assignment. Candidates retain read access to their own interviews.
drop policy if exists "staff interviews" on public.interviews;
create policy "interviews read permitted" on public.interviews for select
using(public.can_view_application(application_id));
create policy "assigned staff schedule interviews" on public.interviews for insert
with check(public.can_manage_application(application_id) and (created_by=auth.uid() or public.is_admin()));
create policy "assigned staff update interviews" on public.interviews for update
using(public.can_manage_application(application_id)) with check(public.can_manage_application(application_id));
create policy "admins delete interviews" on public.interviews for delete using(public.is_admin());

drop policy if exists "status history read own or staff" on public.application_status_history;
drop policy if exists "staff add status history" on public.application_status_history;
create policy "status history read permitted" on public.application_status_history for select
using(public.can_view_application(application_id));
create policy "status history added by assigned staff" on public.application_status_history for insert
with check(public.can_manage_application(application_id));

drop policy if exists "staff notifications" on public.notifications;
create policy "notifications read permitted" on public.notifications for select
using(public.is_admin() or (application_id is not null and public.can_view_application(application_id)));

-- Identity duplicate search is administrative. Candidate calls receive no matching rows.
create or replace function public.find_candidate_duplicates(
  p_cnic text,p_passport text,p_email text,p_phone text,p_whatsapp text,p_name text,p_dob date
)
returns table(id uuid,matched_on text[])
language sql stable security definer set search_path=public
as $$
  select c.id,array_remove(array[
    case when nullif(p_cnic,'') is not null and c.cnic=p_cnic then 'CNIC' end,
    case when nullif(p_passport,'') is not null and c.passport_number=p_passport then 'Passport' end,
    case when nullif(p_email,'') is not null and lower(c.email)=lower(p_email) then 'Email' end,
    case when nullif(p_phone,'') is not null and c.phone=p_phone then 'Phone' end,
    case when nullif(p_whatsapp,'') is not null and c.whatsapp=p_whatsapp then 'WhatsApp' end,
    case when lower(c.full_name)=lower(p_name) and c.date_of_birth=p_dob then 'Name + DOB' end
  ],null)
  from public.candidates c
  where public.is_admin() and (
    (nullif(p_cnic,'') is not null and c.cnic=p_cnic)
    or (nullif(p_passport,'') is not null and c.passport_number=p_passport)
    or (nullif(p_email,'') is not null and lower(c.email)=lower(p_email))
    or (nullif(p_phone,'') is not null and c.phone=p_phone)
    or (nullif(p_whatsapp,'') is not null and c.whatsapp=p_whatsapp)
    or (lower(c.full_name)=lower(p_name) and c.date_of_birth=p_dob)
  )
$$;

-- Sensitive administration is restricted according to the role matrix.
drop policy if exists "admins audit logs" on public.audit_logs;
create policy "super admin reads audit logs" on public.audit_logs for select using(public.is_super_admin());
drop policy if exists "admin settings" on public.settings;
create policy "super admin manages settings" on public.settings for all
using(public.is_super_admin()) with check(public.is_super_admin());

-- Resolve private storage access from the user/application folder convention.
create or replace function public.can_access_candidate_document(p_name text)
returns boolean language plpgsql stable security definer set search_path=public
as $$
declare parts text[]; application_uuid uuid;
begin
  parts:=storage.foldername(p_name);
  if parts[1]=auth.uid()::text then return true; end if;
  application_uuid:=parts[2]::uuid;
  return public.can_view_application(application_uuid);
exception when others then return false;
end;
$$;
revoke all on function public.can_access_candidate_document(text) from public;
grant execute on function public.can_access_candidate_document(text) to authenticated;

drop policy if exists "candidate reads own documents" on storage.objects;
drop policy if exists "candidate updates own documents" on storage.objects;
drop policy if exists "candidate deletes own documents" on storage.objects;
create policy "authorized users read candidate documents" on storage.objects for select to authenticated
using(bucket_id='candidate-documents' and public.can_access_candidate_document(name));
create policy "candidates update own document objects" on storage.objects for update to authenticated
using(bucket_id='candidate-documents' and (storage.foldername(name))[1]=auth.uid()::text)
with check(bucket_id='candidate-documents' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "candidates or admins delete document objects" on storage.objects for delete to authenticated
using(bucket_id='candidate-documents' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
