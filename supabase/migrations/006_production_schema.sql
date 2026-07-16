-- Production schema canonicalization.
-- Apply after 005_role_based_access_control.sql. This migration preserves legacy data.

-- Normalized roles. profiles.role remains as a compatibility cache for the current UI.
create table if not exists public.roles(
  id uuid primary key default gen_random_uuid(),
  name text not null unique check(name in('super_admin','admin','recruiter','viewer','candidate')),
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_roles_unique_assignment unique(user_id,role_id)
);

insert into public.roles(name,description) values
('super_admin','Full system, user, role and settings administration'),
('admin','Recruitment, candidate, application and reporting administration'),
('recruiter','Assigned candidate and application workflow access'),
('viewer','Read-only permitted administration access'),
('candidate','Candidate self-service access')
on conflict(name) do update set description=excluded.description;

insert into public.user_roles(user_id,role_id)
select p.id,r.id from public.profiles p join public.roles r on r.name=p.role::text
on conflict(user_id,role_id) do nothing;

alter table public.profiles
  add column if not exists email text,
  add column if not exists avatar_url text,
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();
update public.profiles p set email=u.email from auth.users u where u.id=p.id and p.email is null;
create unique index if not exists profiles_email_unique on public.profiles(lower(email)) where nullif(email,'') is not null;

-- Campaign metadata for advertisements containing multiple positions.
alter table public.job_campaigns
  add column if not exists country text,
  add column if not exists industry text,
  add column if not exists posted_date date,
  add column if not exists closing_date date;
update public.job_campaigns set status=case lower(replace(status,' ','_'))
  when 'open' then 'open' when 'closed' then 'closed' when 'archived' then 'archived' else 'draft' end;
alter table public.job_campaigns drop constraint if exists job_campaigns_status_check;
alter table public.job_campaigns add constraint job_campaigns_status_check
  check(status in('draft','open','closed','archived'));

-- Canonical jobs metadata and lowercase workflow statuses.
alter table public.jobs
  add column if not exists posted_date date,
  add column if not exists created_by uuid references public.profiles(id) on delete set null;
update public.jobs set posted_date=coalesce(posted_date,created_at::date);
alter table public.jobs alter column status drop default;
update public.jobs set status=case lower(replace(status,' ','_'))
  when 'draft' then 'draft' when 'open' then 'open' when 'closing_soon' then 'closing_soon'
  when 'interview_scheduled' then 'interview_scheduled' when 'closed' then 'closed'
  when 'filled' then 'filled' when 'archived' then 'archived' else 'draft' end;
alter table public.jobs alter column status set default 'draft';
alter table public.jobs drop constraint if exists jobs_status_check;
alter table public.jobs add constraint jobs_status_check
  check(status in('draft','open','closing_soon','interview_scheduled','closed','filled','archived'));
create index if not exists jobs_campaign_idx on public.jobs(campaign_id);
create index if not exists jobs_public_status_idx on public.jobs(status,posted_date desc);

-- Candidate identity normalization. Partial indexes allow incomplete drafts.
alter table public.candidates rename column user_id to auth_user_id;
alter table public.candidates add column if not exists updated_at timestamptz not null default now();
create unique index if not exists candidates_auth_user_unique on public.candidates(auth_user_id) where auth_user_id is not null;
create unique index if not exists candidates_cnic_normalized_unique
  on public.candidates((regexp_replace(cnic,'[^0-9]','','g'))) where nullif(regexp_replace(cnic,'[^0-9]','','g'),'') is not null;
create unique index if not exists candidates_passport_normalized_unique
  on public.candidates((upper(regexp_replace(passport_number,'[^A-Za-z0-9]','','g'))))
  where nullif(regexp_replace(passport_number,'[^A-Za-z0-9]','','g'),'') is not null;
create index if not exists candidates_email_normalized_idx on public.candidates(lower(email)) where nullif(email,'') is not null;
create index if not exists candidates_phone_normalized_idx
  on public.candidates((regexp_replace(phone,'[^0-9]','','g'))) where nullif(regexp_replace(phone,'[^0-9]','','g'),'') is not null;

-- Canonical application ownership: candidate_id now references candidates; auth_user_id preserves legacy ownership.
drop trigger if exists enforce_application_update_permissions on public.applications;
drop trigger if exists queue_application_notifications on public.applications;
drop trigger if exists record_application_status on public.applications;
drop function if exists public.track_application(text,text);
drop policy if exists "candidates create own applications" on public.applications;
alter table public.applications rename column candidate_id to auth_user_id;
alter table public.applications rename column candidate_record_id to candidate_id;
alter table public.applications add column if not exists allow_duplicate boolean not null default false;
insert into public.candidates(auth_user_id,full_name,email,phone)
select distinct a.auth_user_id,coalesce(nullif(p.full_name,''),'Candidate'),p.email,p.phone
from public.applications a join public.profiles p on p.id=a.auth_user_id
where a.candidate_id is null
on conflict(auth_user_id) do nothing;
update public.applications a set candidate_id=c.id from public.candidates c
where a.candidate_id is null and c.auth_user_id=a.auth_user_id;
alter table public.applications alter column candidate_id set not null;
alter table public.applications alter column status drop default;
alter table public.applications alter column status type text using case status::text
  when 'Submitted' then 'submitted' when 'Under Review' then 'under_review'
  when 'Shortlisted' then 'shortlisted' when 'Interview' then 'interviewed'
  when 'Interview Scheduled' then 'interview_scheduled' when 'Interviewed' then 'interviewed'
  when 'Selected' then 'selected' when 'Rejected' then 'rejected'
  when 'Medical' then 'medical_pending' when 'Medical Pending' then 'medical_pending'
  when 'Medical Cleared' then 'medical_cleared' when 'Medical Failed' then 'medical_failed'
  when 'Documents Pending' then 'documents_pending' when 'Visa' then 'visa_processing'
  when 'Visa Processing' then 'visa_processing' when 'Visa Approved' then 'visa_approved'
  when 'Protector' then 'protector_complete' when 'Protector Complete' then 'protector_complete'
  when 'Ticket' then 'ticket_issued' when 'Ticket Issued' then 'ticket_issued'
  when 'Deployed' then 'deployed' when 'On Hold' then 'on_hold'
  when 'Withdrawn' then 'withdrawn' else 'submitted' end;
alter table public.applications alter column status set default 'submitted';
alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check check(status in(
  'submitted','under_review','shortlisted','interview_scheduled','interviewed','selected','rejected',
  'medical_pending','medical_cleared','medical_failed','documents_pending','visa_processing',
  'visa_approved','protector_complete','ticket_issued','deployed','on_hold','withdrawn'
));
create unique index if not exists applications_candidate_job_unique
  on public.applications(candidate_id,job_id) where candidate_id is not null and job_id is not null and allow_duplicate=false;

-- Upgrade the existing private document table to the canonical name and ownership model.
alter table public.application_documents rename to candidate_documents;
alter table public.candidate_documents rename column candidate_id to auth_user_id;
alter table public.candidate_documents
  add column if not exists candidate_id uuid references public.candidates(id) on delete cascade,
  add column if not exists original_filename text,
  add column if not exists mime_type text,
  add column if not exists file_size bigint check(file_size is null or file_size>=0),
  add column if not exists verification_status text not null default 'pending'
    check(verification_status in('pending','verified','rejected','expired')),
  add column if not exists uploaded_by uuid references public.profiles(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();
update public.candidate_documents d set candidate_id=a.candidate_id,uploaded_by=coalesce(d.uploaded_by,d.auth_user_id)
from public.applications a where a.id=d.application_id and d.candidate_id is null;
alter table public.candidate_documents alter column candidate_id set not null;
create index if not exists candidate_documents_candidate_idx on public.candidate_documents(candidate_id);
create index if not exists candidate_documents_application_idx on public.candidate_documents(application_id);

-- Historical workflow fields retain the legacy status column for migration traceability.
alter table public.application_status_history
  add column if not exists previous_status text,
  add column if not exists new_status text,
  add column if not exists notes text;
alter table public.application_status_history alter column status drop not null;
update public.application_status_history set
  new_status=coalesce(new_status,lower(replace(status::text,' ','_'))),notes=coalesce(notes,note)
where new_status is null or notes is null;

alter table public.candidate_notes
  add column if not exists author_id uuid references public.profiles(id) on delete set null,
  add column if not exists visibility text not null default 'internal' check(visibility in('internal','candidate')),
  add column if not exists updated_at timestamptz not null default now();
update public.candidate_notes set author_id=created_by where author_id is null;

alter table public.interviews
  add column if not exists scheduled_date date,
  add column if not exists scheduled_time time,
  add column if not exists interviewer_id uuid references public.profiles(id) on delete set null,
  add column if not exists attendance_status text not null default 'scheduled'
    check(attendance_status in('scheduled','confirmed','attended','absent','rescheduled')),
  add column if not exists notes text;
update public.interviews set scheduled_date=scheduled_at::date,scheduled_time=scheduled_at::time
where scheduled_date is null or scheduled_time is null;

alter table public.notifications
  add column if not exists recipient_user_id uuid references public.profiles(id) on delete set null,
  add column if not exists type text not null default 'transactional',
  add column if not exists title text,
  add column if not exists message text;

alter table public.audit_logs
  add column if not exists actor_user_id uuid references public.profiles(id) on delete set null,
  add column if not exists entity_type text,
  add column if not exists entity_id uuid,
  add column if not exists old_values jsonb,
  add column if not exists new_values jsonb;
update public.audit_logs set actor_user_id=coalesce(actor_user_id,user_id),entity_type=coalesce(entity_type,table_name),
  old_values=coalesce(old_values,old_value),new_values=coalesce(new_values,new_value);

-- Role synchronization keeps normalized assignments and the legacy profile cache consistent.
create or replace function public.sync_profile_role_from_assignments(p_user_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare selected_role public.user_role;
begin
  select r.name::public.user_role into selected_role from public.user_roles ur join public.roles r on r.id=ur.role_id
  where ur.user_id=p_user_id order by case r.name when 'super_admin' then 1 when 'admin' then 2
    when 'recruiter' then 3 when 'viewer' then 4 else 5 end limit 1;
  update public.profiles set role=coalesce(selected_role,'candidate'),updated_at=now() where id=p_user_id;
end;$$;

create or replace function public.sync_profile_role_trigger()
returns trigger language plpgsql security definer set search_path=public as $$
begin perform public.sync_profile_role_from_assignments(coalesce(new.user_id,old.user_id));return coalesce(new,old);end;$$;
drop trigger if exists sync_profile_role_after_assignment on public.user_roles;
create trigger sync_profile_role_after_assignment after insert or update or delete on public.user_roles
for each row execute function public.sync_profile_role_trigger();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
declare candidate_role_id uuid;
begin
  insert into public.profiles(id,full_name,email) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.email)
  on conflict(id) do update set email=excluded.email,updated_at=now();
  select id into candidate_role_id from public.roles where name='candidate';
  insert into public.user_roles(user_id,role_id) values(new.id,candidate_role_id) on conflict do nothing;
  return new;
end;$$;

create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path=public as $$
  select coalesce((select r.name::public.user_role from public.user_roles ur join public.roles r on r.id=ur.role_id
    where ur.user_id=auth.uid() order by case r.name when 'super_admin' then 1 when 'admin' then 2
    when 'recruiter' then 3 when 'viewer' then 4 else 5 end limit 1),
    (select role from public.profiles where id=auth.uid()))
$$;

-- Recreate status- and ownership-aware helpers after canonical column conversion.
create or replace function public.can_view_application(p_application_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.applications a where a.id=p_application_id and(
    a.auth_user_id=auth.uid() or public.current_user_role() in('viewer','admin','super_admin')
    or(public.current_user_role()='recruiter' and a.recruiter_id=auth.uid())))
$$;
create or replace function public.can_view_candidate(p_candidate_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.candidates c where c.id=p_candidate_id and(
    c.auth_user_id=auth.uid() or public.current_user_role() in('viewer','admin','super_admin')
    or(public.current_user_role()='recruiter' and exists(select 1 from public.applications a
      where a.candidate_id=c.id and a.recruiter_id=auth.uid()))))
$$;

create or replace function public.enforce_application_update_permissions()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if public.current_user_role()='recruiter' then
    if old.recruiter_id is distinct from auth.uid() or new.recruiter_id is distinct from old.recruiter_id then
      raise exception 'Recruiter is not assigned to this application';end if;
    if(to_jsonb(new)-array['status','updated_at']) is distinct from(to_jsonb(old)-array['status','updated_at']) then
      raise exception 'Recruiters may only update an allowed application status';end if;
    if new.status not in('under_review','shortlisted','interview_scheduled','interviewed','selected','rejected','documents_pending','on_hold') then
      raise exception 'Application status is not available to recruiters';end if;
  end if;return new;
end;$$;
create trigger enforce_application_update_permissions before update on public.applications
for each row execute function public.enforce_application_update_permissions();

create or replace function public.record_application_status()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if old.status is distinct from new.status then
    insert into public.application_status_history(application_id,previous_status,new_status,changed_by,notes)
    values(new.id,old.status,new.status,auth.uid(),'Status updated');
  end if;return new;
end;$$;
create trigger record_application_status after update of status on public.applications
for each row execute function public.record_application_status();

create or replace function public.track_application(p_reference text,p_identifier text)
returns table(job_title text,submitted_at timestamptz,status text,next_action text,interview_date timestamptz,missing_documents text[])
language sql security definer set search_path=public as $$
  select a.job_title,a.submitted_at,a.status,case
    when a.status='submitted' then 'Your application is awaiting review.'
    when a.status='interview_scheduled' then 'Attend the scheduled interview with original documents.'
    when a.status='documents_pending' then 'Contact recruitment to provide missing documents.'
    else 'The recruitment team will contact you when action is required.' end,
    a.interview_date,array[]::text[] from public.applications a join public.candidates c on c.id=a.candidate_id
  where upper(a.reference_number)=upper(p_reference) and(c.cnic=p_identifier or c.phone=p_identifier or c.whatsapp=p_identifier) limit 1
$$;
revoke all on function public.track_application(text,text) from public;
grant execute on function public.track_application(text,text) to anon,authenticated;

-- Replace policies whose ownership/status columns changed.
drop policy if exists "published jobs public read" on public.jobs;
create policy "published jobs public read" on public.jobs for select using(
  status in('open','closing_soon','interview_scheduled','closed','filled') or public.is_staff());
drop policy if exists "candidates create own applications" on public.applications;
create policy "candidates create own applications" on public.applications for insert with check(
  auth_user_id=auth.uid() and status='submitted' and exists(select 1 from public.candidates c
    where c.id=candidate_id and c.auth_user_id=auth.uid()));
drop policy if exists "candidate and staff read permitted candidates" on public.candidates;
create policy "candidate and staff read permitted candidates" on public.candidates for select using(public.can_view_candidate(id));
drop policy if exists "candidate updates own permitted profile" on public.candidates;
create policy "candidate updates own permitted profile" on public.candidates for update
using(auth_user_id=auth.uid()) with check(auth_user_id=auth.uid());
drop policy if exists "candidate create own profile" on public.candidates;
create policy "candidate create own profile" on public.candidates for insert with check(auth_user_id=auth.uid());

-- Canonical document RLS.
alter table public.candidate_documents enable row level security;
drop policy if exists "documents read permitted" on public.candidate_documents;
drop policy if exists "documents insert own application" on public.candidate_documents;
drop policy if exists "admins delete document metadata" on public.candidate_documents;
create policy "documents read permitted" on public.candidate_documents for select using(
  auth_user_id=auth.uid() or public.can_view_application(application_id));
create policy "candidate inserts own documents" on public.candidate_documents for insert with check(
  auth_user_id=auth.uid() and uploaded_by=auth.uid() and exists(select 1 from public.applications a
    where a.id=application_id and a.auth_user_id=auth.uid() and a.candidate_id=candidate_id));
create policy "admins manage document metadata" on public.candidate_documents for all
using(public.is_admin()) with check(public.is_admin());

-- Normalized RBAC table policies.
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
create policy "authenticated read roles" on public.roles for select to authenticated using(true);
create policy "super admin manages roles" on public.roles for all to authenticated
using(public.is_super_admin()) with check(public.is_super_admin());
create policy "users read own role assignments" on public.user_roles for select to authenticated
using(user_id=auth.uid() or public.is_staff());
create policy "super admin manages role assignments" on public.user_roles for all to authenticated
using(public.is_super_admin()) with check(public.is_super_admin());

-- updated_at coverage for newly upgraded tables.
do $$declare table_name text;begin foreach table_name in array array[
  'profiles','jobs','job_campaigns','candidates','applications','candidate_documents','candidate_notes','interviews'
] loop execute format('drop trigger if exists set_updated_at on public.%I',table_name);execute format(
  'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',table_name);
end loop;end$$;
